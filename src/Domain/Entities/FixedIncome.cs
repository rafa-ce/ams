namespace InvestimentosPessoais.Domain.Entities;

/// <summary>
/// CDB, Treasury Direct, LCI, LCA, CRI, CRA, Debentures, etc.
/// </summary>
public sealed class FixedIncome : Investment
{
    /// <summary>CDB | Treasury Selic | Treasury IPCA+ | LCI | LCA | CRI | CRA</summary>
    public string Type { get; private set; } = string.Empty;

    /// <summary>CDI | IPCA | SELIC | Prefixed</summary>
    public string Indexer { get; private set; } = string.Empty;

    /// <summary>Contracted rate % p.a. (e.g.: 12.5 for 12.5%)</summary>
    public decimal ContractedRate { get; private set; }

    /// <summary>% of the indexer (e.g.: 110 for 110% of CDI). Null for prefixed.</summary>
    public decimal? IndexerPercentage { get; private set; }

    private FixedIncome() { }

    public FixedIncome(
        string name,
        string institution,
        decimal currentValue,
        string type,
        string indexer,
        decimal contractedRate,
        decimal? indexerPercentage = null,
        DateTime? maturityDate = null,
        string notes = "")
        : base(name, institution, currentValue, maturityDate, notes)
    {
        Type = type;
        Indexer = indexer;
        ContractedRate = contractedRate;
        IndexerPercentage = indexerPercentage;
    }

    public void UpdateRate(decimal newRate, string newIndexer, decimal? newPercentage = null)
    {
        ContractedRate = newRate;
        Indexer = newIndexer;
        IndexerPercentage = newPercentage;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateFixedIncomeData(
        string name,
        string institution,
        decimal currentValue,
        string type,
        string indexer,
        decimal contractedRate,
        decimal? indexerPercentage = null,
        DateTime? maturityDate = null,
        string notes = "")
    {
        UpdateData(name, institution, currentValue, maturityDate, notes);
        Type = type;
        Indexer = indexer;
        ContractedRate = contractedRate;
        IndexerPercentage = indexerPercentage;
    }
}