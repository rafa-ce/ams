using System.Text.Json.Serialization;

namespace InvestimentosPessoais.Domain.Entities;

public class Transaction
{
    public int Id { get; private set; }
    public int InvestmentId { get; private set; }
    
    [JsonIgnore]
    public Investment Investment { get; private set; } = null!;

    public decimal Amount { get; private set; }
    public DateTime PurchaseDate { get; private set; }
    
    // For variable income
    public decimal? Shares { get; private set; }
    public decimal? UnitPrice { get; private set; }

    private Transaction() { }

    public Transaction(int investmentId, decimal amount, DateTime purchaseDate, decimal? shares = null, decimal? unitPrice = null)
    {
        InvestmentId = investmentId;
        Amount = amount;
        PurchaseDate = purchaseDate;
        Shares = shares;
        UnitPrice = unitPrice;
    }
}
