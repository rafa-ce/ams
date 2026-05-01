using InvestimentosPessoais.Application.DTOs;
using InvestimentosPessoais.Domain.Entities;
using InvestimentosPessoais.Domain.Exceptions;
using InvestimentosPessoais.Domain.Interfaces;
using InvestimentosPessoais.Infrastructure.Persistence;

namespace InvestimentosPessoais.WebAPI.Endpoints;

public static class InvestmentEndpoints
{
    private static readonly string[] FixedIncomeCategories = new[]
    {
        "CDB",
        "Treasury Selic",
        "Treasury IPCA+",
        "Treasury Prefixed",
        "LCI",
        "LCA",
        "CRI",
        "CRA",
        "Debenture"
    };

    private static bool IsFixedIncomeCategory(string category)
        => FixedIncomeCategories.Contains(category, StringComparer.OrdinalIgnoreCase);

    private static string NormalizeCategory(string category)
        => category?.Trim() ?? string.Empty;

    public static WebApplication MapInvestmentEndpoints(this WebApplication app)
    {
        var api = app.MapGroup("/api/investments")
                     .WithTags("Investments");

        // ── GET /api/investments ─────────────────────────────────────────────
        api.MapGet("/", async (IInvestmentRepository repo, CancellationToken ct) =>
        {
            var list = await repo.GetAllAsync(ct);
            return Results.Ok(new ListResponseDto(
                InvestmentMapper.ToSummary(list),
                list.Select(InvestmentMapper.ToDto).ToList()));
        })
        .WithName("ListInvestments")
        .WithSummary("Lists all investments with portfolio summary")
        .WithOpenApi();

        // ── GET /api/investments/{id} ────────────────────────────────────────
        api.MapGet("/{id:int}", async (int id, IInvestmentRepository repo, CancellationToken ct) =>
        {
            var inv = await repo.GetByIdAsync(id, ct);
            return inv is null
                ? Results.NotFound(new { message = $"Investment {id} not found." })
                : Results.Ok(InvestmentMapper.ToDto(inv));
        })
        .WithName("GetInvestment")
        .WithSummary("Gets an investment by ID")
        .WithOpenApi();

        // ── POST /api/investments/fixed-income ────────────────────────────────
        api.MapPost("/fixed-income", async (
            CreateFixedIncomeRequest req,
            IInvestmentRepository repo,
            CancellationToken ct) =>
        {
            try
            {
                var entity = new FixedIncome(
                    req.Name, req.Institution, req.CurrentValue,
                    req.Type, req.Indexer, req.ContractedRate,
                    req.IndexerPercentage, req.MaturityDate, req.Notes);
                    
                entity.AddTransaction(new Transaction(0, req.InvestedAmount, req.InvestmentDate));

                await repo.AddAsync(entity, ct);
                await repo.SaveChangesAsync(ct);

                return Results.Created(
                    $"/api/investments/{entity.Id}",
                    InvestmentMapper.ToDto(entity));
            }
            catch (DomainException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        })
        .WithName("CreateFixedIncome")
        .WithSummary("Registers a new Fixed Income investment")
        .WithOpenApi();

        // ── POST /api/investments/variable-income ────────────────────────────
        api.MapPost("/variable-income", async (
            CreateVariableIncomeRequest req,
            IInvestmentRepository repo,
            CancellationToken ct) =>
        {
            try
            {
                decimal investedAmount = req.UnitPrice * req.Shares;
                var entity = new VariableIncome(
                    req.Name, req.Institution, req.UnitPrice,
                    req.Category, req.Ticker,
                    req.DividendsReceived, req.Notes);

                entity.AddTransaction(new Transaction(0, investedAmount, req.InvestmentDate, req.Shares, req.UnitPrice));

                await repo.AddAsync(entity, ct);
                await repo.SaveChangesAsync(ct);

                return Results.Created(
                    $"/api/investments/{entity.Id}",
                    InvestmentMapper.ToDto(entity));
            }
            catch (DomainException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        })
        .WithName("CreateVariableIncome")
        .WithSummary("Registers a new Variable Income investment")
        .WithOpenApi();

        api.MapPost("/", async (
            CreateInvestmentRequest req,
            IInvestmentRepository repo,
            CancellationToken ct) =>
        {
            var category = NormalizeCategory(req.Category);
            try
            {
                if (IsFixedIncomeCategory(category))
                {
                    if (req.CurrentValue is null)
                        return Results.BadRequest(new { message = "CurrentValue is required for fixed income assets." });

                    var entity = new FixedIncome(
                        req.Name,
                        req.Institution,
                        req.CurrentValue.Value,
                        category,
                        req.Indexer ?? "CDI",
                        req.ContractedRate ?? 0m,
                        req.IndexerPercentage,
                        req.MaturityDate,
                        req.Notes);

                    entity.AddTransaction(new Transaction(0, req.InvestedAmount, req.InvestmentDate));
                    await repo.AddAsync(entity, ct);
                    await repo.SaveChangesAsync(ct);

                    return Results.Created($"/api/investments/{entity.Id}", InvestmentMapper.ToDto(entity));
                }

                if (req.CurrentPrice is null || req.Shares is null || string.IsNullOrWhiteSpace(req.Ticker))
                    return Results.BadRequest(new { message = "CurrentPrice, Shares and Ticker are required for variable income assets." });

                var asset = new VariableIncome(
                    req.Name,
                    req.Institution,
                    req.CurrentPrice.Value,
                    category,
                    req.Ticker,
                    req.DividendsReceived ?? 0m,
                    req.Notes);

                asset.AddTransaction(new Transaction(0, req.InvestedAmount, req.InvestmentDate, req.Shares.Value, Math.Round(req.InvestedAmount / req.Shares.Value, 6))); 
                await repo.AddAsync(asset, ct);
                await repo.SaveChangesAsync(ct);

                return Results.Created($"/api/investments/{asset.Id}", InvestmentMapper.ToDto(asset));
            }
            catch (DomainException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        })
        .WithName("CreateInvestment")
        .WithSummary("Registers a new investment using the selected category")
        .WithOpenApi();

        // ── PUT /api/investments/{id}/fixed-income ────────────────────────────
        api.MapPut("/{id:int}/fixed-income", async (
            int id,
            UpdateFixedIncomeRequest req,
            IInvestmentRepository repo,
            CancellationToken ct) =>
        {
            var inv = await repo.GetByIdAsync(id, ct);
            if (inv is null)
                return Results.NotFound(new { message = $"Investment {id} not found." });
            if (inv is not FixedIncome fi)
                return Results.BadRequest(new { message = "Investment is not a Fixed Income asset." });

            try
            {
                fi.UpdateFixedIncomeData(
                    req.Name, req.Institution, req.CurrentValue,
                    req.Type, req.Indexer, req.ContractedRate,
                    req.IndexerPercentage, req.MaturityDate, req.Notes);

                // Note: Updating existing transaction amounts directly via asset update is omitted.
                // Transactions should ideally be managed individually now.

                repo.Update(fi);
                await repo.SaveChangesAsync(ct);

                return Results.Ok(InvestmentMapper.ToDto(fi));
            }
            catch (DomainException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        })
        .WithName("UpdateFixedIncome")
        .WithSummary("Updates an existing Fixed Income investment")
        .WithOpenApi();

        // ── PUT /api/investments/{id}/variable-income ────────────────────────────
        api.MapPut("/{id:int}/variable-income", async (
            int id,
            UpdateVariableIncomeRequest req,
            IInvestmentRepository repo,
            CancellationToken ct) =>
        {
            var inv = await repo.GetByIdAsync(id, ct);
            if (inv is null)
                return Results.NotFound(new { message = $"Investment {id} not found." });
            if (inv is not VariableIncome vi)
                return Results.BadRequest(new { message = "Investment is not a Variable Income asset." });

            try
            {
                vi.UpdateVariableIncomeData(
                    req.Name, req.Institution, req.CurrentPrice,
                    req.Category, req.Ticker,
                    req.DividendsReceived, req.Notes);

                // Note: Updating existing transaction amounts directly via asset update is omitted.

                repo.Update(vi);
                await repo.SaveChangesAsync(ct);

                return Results.Ok(InvestmentMapper.ToDto(vi));
            }
            catch (DomainException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        })
        .WithName("UpdateVariableIncome")
        .WithSummary("Updates an existing Variable Income investment")
        .WithOpenApi();

        // ── PATCH /api/investments/{id}/value ───────────────────────────────
        api.MapPatch("/{id:int}/value", async (
            int id,
            UpdateValueRequest req,
            IInvestmentRepository repo,
            CancellationToken ct) =>
        {
            var inv = await repo.GetByIdAsync(id, ct);
            if (inv is null)
                return Results.NotFound(new { message = $"Investment {id} not found." });

            try
            {
                inv.UpdateCurrentValue(req.NewValue);
                repo.Update(inv);
                await repo.SaveChangesAsync(ct);
                return Results.Ok(InvestmentMapper.ToDto(inv));
            }
            catch (DomainException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        })
        .WithName("UpdateValue")
        .WithSummary("Updates the current value of an investment")
        .WithOpenApi();

        // ── PATCH /api/investments/{id}/price ─────────────────────────────
        api.MapPatch("/{id:int}/price", async (
            int id,
            UpdatePriceRequest req,
            IInvestmentRepository repo,
            CancellationToken ct) =>
        {
            var inv = await repo.GetByIdAsync(id, ct);
            if (inv is null)
                return Results.NotFound(new { message = $"Investment {id} not found." });
            if (inv is not VariableIncome vi)
                return Results.BadRequest(new { message = "This endpoint is exclusively for Variable Income." });

            try
            {
                vi.UpdatePrice(req.NewPrice);
                repo.Update(vi);
                await repo.SaveChangesAsync(ct);
                return Results.Ok(InvestmentMapper.ToDto(vi));
            }
            catch (DomainException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        })
        .WithName("UpdatePrice")
        .WithSummary("Updates the price of a Variable Income asset")
        .WithOpenApi();

        // ── POST /api/investments/{id}/dividends ────────────────────────────
        api.MapPost("/{id:int}/dividends", async (
            int id,
            RegisterDividendRequest req,
            IInvestmentRepository repo,
            CancellationToken ct) =>
        {
            var inv = await repo.GetByIdAsync(id, ct);
            if (inv is null)
                return Results.NotFound(new { message = $"Investment {id} not found." });
            if (inv is not VariableIncome vi)
                return Results.BadRequest(new { message = "Dividends are exclusively for Variable Income." });

            try
            {
                vi.RegisterDividend(req.Amount);
                repo.Update(vi);
                await repo.SaveChangesAsync(ct);
                return Results.Ok(InvestmentMapper.ToDto(vi));
            }
            catch (DomainException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        })
        .WithName("RegisterDividend")
        .WithSummary("Registers receipt of dividend/yield")
        .WithOpenApi();

        // ── POST /api/investments/{id}/transactions ───────────────────────────
        api.MapPost("/{id:int}/transactions", async (
            int id,
            CreateTransactionRequest req,
            IInvestmentRepository repo,
            CancellationToken ct) =>
        {
            var inv = await repo.GetByIdAsync(id, ct);
            if (inv is null)
                return Results.NotFound(new { message = $"Investment {id} not found." });

            try
            {
                var transaction = new Transaction(0, req.Amount, req.PurchaseDate, req.Shares, req.UnitPrice);
                inv.AddTransaction(transaction);
                repo.Update(inv);
                await repo.SaveChangesAsync(ct);
                return Results.Created(
                    $"/api/investments/{id}/transactions/{transaction.Id}",
                    InvestmentMapper.ToTransactionDto(transaction));
            }
            catch (DomainException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        })
        .WithName("CreateTransaction")
        .WithSummary("Adds a new transaction to an investment")
        .WithOpenApi();

        // ── PUT /api/investments/{id}/transactions/{transactionId} ─────────────
        api.MapPut("/{id:int}/transactions/{transactionId:int}", async (
            int id,
            int transactionId,
            UpdateTransactionRequest req,
            IInvestmentRepository repo,
            AppDbContext ctx,
            CancellationToken ct) =>
        {
            var inv = await repo.GetByIdAsync(id, ct);
            if (inv is null)
                return Results.NotFound(new { message = $"Investment {id} not found." });

            var transaction = inv.Transactions.FirstOrDefault(t => t.Id == transactionId);
            if (transaction is null)
                return Results.NotFound(new { message = $"Transaction {transactionId} not found." });

            try
            {
                // Update transaction properties via DbContext
                var dbTransaction = await ctx.Transactions.FindAsync(new object[] { transactionId }, ct);
                if (dbTransaction is null)
                    return Results.NotFound(new { message = $"Transaction {transactionId} not found." });

                dbTransaction.Update(req.Amount, req.PurchaseDate, req.Shares, req.UnitPrice);
                await ctx.SaveChangesAsync(ct);
                return Results.Ok(InvestmentMapper.ToTransactionDto(dbTransaction));
            }
            catch (DomainException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        })
        .WithName("UpdateTransaction")
        .WithSummary("Updates an existing transaction")
        .WithOpenApi();

        // ── DELETE /api/investments/{id}/transactions/{transactionId} ────────
        api.MapDelete("/{id:int}/transactions/{transactionId:int}", async (
            int id,
            int transactionId,
            IInvestmentRepository repo,
            AppDbContext ctx,
            CancellationToken ct) =>
        {
            var inv = await repo.GetByIdAsync(id, ct);
            if (inv is null)
                return Results.NotFound(new { message = $"Investment {id} not found." });

            var transaction = inv.Transactions.FirstOrDefault(t => t.Id == transactionId);
            if (transaction is null)
                return Results.NotFound(new { message = $"Transaction {transactionId} not found." });

            var dbTransaction = await ctx.Transactions.FindAsync(new object[] { transactionId }, ct);
            if (dbTransaction is null)
                return Results.NotFound(new { message = $"Transaction {transactionId} not found." });

            ctx.Transactions.Remove(dbTransaction);
            await ctx.SaveChangesAsync(ct);
            return Results.NoContent();
        })
        .WithName("RemoveTransaction")
        .WithSummary("Removes a transaction from an investment")
        .WithOpenApi();

        // ── DELETE /api/investments/{id} ────────────────────────────────────
        api.MapDelete("/{id:int}", async (int id, IInvestmentRepository repo, CancellationToken ct) =>
        {
            var inv = await repo.GetByIdAsync(id, ct);
            if (inv is null)
                return Results.NotFound(new { message = $"Investment {id} not found." });

            repo.Remove(inv);
            await repo.SaveChangesAsync(ct);
            return Results.NoContent();
        })
        .WithName("RemoveInvestment")
        .WithSummary("Removes an investment from the portfolio")
        .WithOpenApi();

        return app;
    }
}
