using InvestimentosPessoais.Domain.Entities;
using InvestimentosPessoais.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InvestimentosPessoais.Infrastructure.Persistence.Repositories;

/// <summary>
/// EF Core Repository for all CRUD operations.
/// </summary>
public sealed class InvestmentRepository : IInvestmentRepository
{
    private readonly AppDbContext _ctx;

    public InvestmentRepository(AppDbContext ctx) => _ctx = ctx;

    // ── Read ────────────────────────────────────────────────────────────────

    public async Task<Investment?> GetByIdAsync(int id, CancellationToken ct = default)
        => await _ctx.Investments
                     .Include(i => i.Transactions)
                     .AsNoTracking()
                     .FirstOrDefaultAsync(i => i.Id == id, ct);

    public async Task<IReadOnlyList<Investment>> GetAllAsync(CancellationToken ct = default)
        => await _ctx.Investments
                     .Include(i => i.Transactions)
                     .AsNoTracking()
                     .OrderBy(i => i.Name)
                     .ToListAsync(ct);

    public async Task<IReadOnlyList<FixedIncome>> GetFixedIncomeAsync(CancellationToken ct = default)
        => await _ctx.FixedIncomes
                     .Include(i => i.Transactions)
                     .AsNoTracking()
                     .OrderBy(i => i.MaturityDate)
                     .ToListAsync(ct);

    public async Task<IReadOnlyList<VariableIncome>> GetVariableIncomeAsync(CancellationToken ct = default)
        => await _ctx.VariableIncomes
                     .Include(i => i.Transactions)
                     .AsNoTracking()
                     .OrderBy(i => i.Ticker)
                     .ToListAsync(ct);

    public async Task<bool> ExistsAsync(int id, CancellationToken ct = default)
        => await _ctx.Investments.AnyAsync(i => i.Id == id, ct);

    // ── Write ───────────────────────────────────────────────────────────────

    public async Task AddAsync(Investment inv, CancellationToken ct = default)
        => await _ctx.Investments.AddAsync(inv, ct);

    public void Update(Investment inv)
        => _ctx.Investments.Update(inv);

    public void Remove(Investment inv)
        => _ctx.Investments.Remove(inv);

    // ── Unit of Work ────────────────────────────────────────────────────────

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
        => await _ctx.SaveChangesAsync(ct);
}
