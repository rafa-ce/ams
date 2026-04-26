using InvestimentosPessoais.Application.DTOs;
using InvestimentosPessoais.Domain.Entities;
using InvestimentosPessoais.Domain.Exceptions;
using InvestimentosPessoais.Domain.Interfaces;

namespace InvestimentosPessoais.WebAPI.Endpoints;

public static class InvestmentEndpoints
{
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
                var entity = new VariableIncome(
                    req.Name, req.Institution, req.CurrentPrice,
                    req.Category, req.Ticker,
                    req.DividendsReceived, req.Notes);

                entity.AddTransaction(new Transaction(0, req.InvestedAmount, req.InvestmentDate, req.Shares, Math.Round(req.InvestedAmount / req.Shares, 6)));

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
