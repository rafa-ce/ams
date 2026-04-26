using InvestimentosPessoais.Domain.Exceptions;

namespace InvestimentosPessoais.Domain.Entities;

/// <summary>
/// Root of the TPH hierarchy. The entire "Investments" table is based here.
/// Yield calculations stay in the Domain — they do not leak to Application.
/// </summary>
public abstract class Investment
{
    public int Id { get; protected set; }
    public string Name { get; protected set; } = string.Empty;
    public string Institution { get; protected set; } = string.Empty;
    public decimal CurrentValue { get; protected set; }
    public DateTime? MaturityDate { get; protected set; }
    public string Notes { get; protected set; } = string.Empty;
    public DateTime CreatedAt { get; protected set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; protected set; } = DateTime.UtcNow;

    private readonly List<Transaction> _transactions = new();
    public IReadOnlyCollection<Transaction> Transactions => _transactions.AsReadOnly();

    public decimal InvestedAmount => _transactions.Sum(t => t.Amount);
    public DateTime InvestmentDate => _transactions.Any() ? _transactions.Min(t => t.PurchaseDate) : CreatedAt;

    // ── Calculations centralized in the Domain ────────────────────────────────
    public decimal Return => CurrentValue - InvestedAmount;

    public decimal ReturnPercentage =>
        InvestedAmount == 0 ? 0 : Math.Round((Return / InvestedAmount) * 100, 2);

    public bool IsPositive => Return >= 0;

    // ── Protected constructor (EF Core needs the parameterless one) ───────────
    protected Investment() { }

    protected Investment(
        string name,
        string institution,
        decimal currentValue,
        DateTime? maturityDate = null,
        string notes = "")
    {
        ValidateName(name);
        ValidateValue(currentValue, nameof(currentValue));

        Name = name.Trim();
        Institution = institution.Trim();
        CurrentValue = currentValue;
        MaturityDate = maturityDate;
        Notes = notes.Trim();
    }

    public void UpdateCurrentValue(decimal newValue)
    {
        ValidateValue(newValue, nameof(newValue));
        CurrentValue = newValue;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddTransaction(Transaction transaction)
    {
        _transactions.Add(transaction);
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateData(
        string name,
        string institution,
        decimal currentValue,
        DateTime? maturityDate,
        string notes)
    {
        ValidateName(name);
        ValidateValue(currentValue, nameof(currentValue));

        Name = name.Trim();
        Institution = institution.Trim();
        CurrentValue = currentValue;
        MaturityDate = maturityDate;
        Notes = notes.Trim();
        UpdatedAt = DateTime.UtcNow;
    }

    // ── Domain validations ────────────────────────────────────────────────────
    private static void ValidateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("The investment name is required.");
    }

    private static void ValidateValue(decimal value, string field)
    {
        if (value < 0)
            throw new DomainException($"The field '{field}' cannot be negative.");
    }
}
