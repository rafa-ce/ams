using InvestimentosPessoais.Domain.Exceptions;

namespace InvestimentosPessoais.Domain.Entities;

/// <summary>
/// Stocks, REITs (FIIs), ETFs, BDRs, Cryptocurrencies, etc.
/// </summary>
public sealed class VariableIncome : Investment
{
    /// <summary>Stocks | REITs | ETFs | BDRs | Crypto</summary>
    public string Category { get; private set; } = string.Empty;

    /// <summary>Trading ticker: AAPL, TSLA, BTC, etc.</summary>
    public string Ticker { get; private set; } = string.Empty;

    /// <summary>Amount of shares/units</summary>
    public decimal Shares => Transactions.Sum(t => t.Shares ?? 0);

    /// <summary>Weighted average purchase price</summary>
    public decimal AveragePrice => Shares > 0 ? Transactions.Sum(t => t.Amount) / Shares : 0;

    /// <summary>Current price per unit</summary>
    public decimal CurrentPrice { get; private set; }

    /// <summary>Total dividends/yields received</summary>
    public decimal DividendsReceived { get; private set; }

    /// <summary>Total financial return (capital + dividends)</summary>
    public decimal TotalReturn => Return + DividendsReceived;

    private VariableIncome() { }

    public VariableIncome(
        string name,
        string institution,
        decimal currentPrice,
        string category,
        string ticker,
        decimal dividendsReceived = 0,
        string notes = "")
        : base(name, institution, 0, null, notes)
    {
        Category = category;
        Ticker = ticker.Trim().ToUpperInvariant();
        CurrentPrice = currentPrice;
        DividendsReceived = dividendsReceived;
    }

    /// <summary>Updates price and recalculates CurrentValue automatically.</summary>
    public void UpdatePrice(decimal newPrice)
    {
        if (newPrice < 0)
            throw new DomainException("Price cannot be negative.");

        CurrentPrice = newPrice;
        UpdateCurrentValue(newPrice * Shares);
    }

    /// <summary>Registers receipt of dividend/yield.</summary>
    public void RegisterDividend(decimal amount)
    {
        if (amount <= 0)
            throw new DomainException("Dividend amount must be positive.");

        DividendsReceived += amount;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>Additional purchase — dynamically handled by Transaction, but keeping interface if needed.</summary>
    public void RegisterPurchase(Transaction transaction)
    {
        AddTransaction(transaction);
        UpdateCurrentValue(CurrentPrice * Shares);
    }

    public void UpdateVariableIncomeData(
        string name,
        string institution,
        decimal currentPrice,
        string category,
        string ticker,
        decimal dividendsReceived = 0,
        string notes = "")
    {
        UpdateData(name, institution, currentPrice * Shares, null, notes);
        Category = category;
        Ticker = ticker.Trim().ToUpperInvariant();
        CurrentPrice = currentPrice;
        DividendsReceived = dividendsReceived;
    }
}
