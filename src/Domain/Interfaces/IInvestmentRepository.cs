using InvestimentosPessoais.Domain.Entities;

namespace InvestimentosPessoais.Domain.Interfaces;

/// <summary>
/// Repository contract — agnostic to ORM/technology.
/// </summary>
public interface IInvestmentRepository
{
    // ── Read ────────────────────────────────────────────────────────────────
    Task<Investment?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<Investment>> GetAllAsync(CancellationToken ct = default);
    Task<IReadOnlyList<FixedIncome>> GetFixedIncomeAsync(CancellationToken ct = default);
    Task<IReadOnlyList<VariableIncome>> GetVariableIncomeAsync(CancellationToken ct = default);
    Task<bool> ExistsAsync(int id, CancellationToken ct = default);

    // ── Write ───────────────────────────────────────────────────────────────
    Task AddAsync(Investment investment, CancellationToken ct = default);
    void Update(Investment investment);
    void Remove(Investment investment);

    // ── Lightweight Unit of Work ────────────────────────────────────────────
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
