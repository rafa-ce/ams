using InvestimentosPessoais.Domain.Entities;

namespace InvestimentosPessoais.Application.DTOs;

// ═══════════════════════════════════════════════════════════════════════════
//  RESPONSE DTOs
// ═══════════════════════════════════════════════════════════════════════════

public record InvestmentDto(
    int Id,
    string InvestmentType,
    string Name,
    string Institution,
    decimal InvestedAmount,
    decimal CurrentValue,
    decimal Return,
    decimal ReturnPercentage,
    bool IsPositive,
    DateTime InvestmentDate,
    DateTime? MaturityDate,
    string Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    // Fixed Income
    string? Type,
    string? Indexer,
    decimal? ContractedRate,
    decimal? IndexerPercentage,
    // Variable Income
    string? Category,
    string? Ticker,
    decimal? Shares,
    decimal? AveragePrice,
    decimal? CurrentPrice,
    decimal? DividendsReceived,
    decimal? TotalReturn
);

public record PortfolioSummaryDto(
    decimal TotalInvested,
    decimal TotalCurrent,
    decimal TotalReturn,
    decimal TotalReturnPercentage,
    int TotalAssets,
    int TotalFixedIncomeAssets,
    int TotalVariableIncomeAssets,
    decimal TotalFixedIncome,
    decimal TotalVariableIncome,
    decimal FixedIncomePercentage,
    decimal VariableIncomePercentage
);

public record ListResponseDto(
    PortfolioSummaryDto Summary,
    IReadOnlyList<InvestmentDto> Investments
);

// ═══════════════════════════════════════════════════════════════════════════
//  REQUEST DTOs
// ═══════════════════════════════════════════════════════════════════════════

public record CreateFixedIncomeRequest(
    string Name,
    string Institution,
    decimal InvestedAmount,
    decimal CurrentValue,
    DateTime InvestmentDate,
    string Type,
    string Indexer,
    decimal ContractedRate,
    decimal? IndexerPercentage = null,
    DateTime? MaturityDate = null,
    string Notes = ""
);

public record CreateVariableIncomeRequest(
    string Name,
    string Institution,
    decimal InvestedAmount,
    decimal CurrentPrice,
    decimal Shares,
    DateTime InvestmentDate,
    string Category,
    string Ticker,
    decimal DividendsReceived = 0,
    string Notes = ""
);

public record UpdateFixedIncomeRequest(
    string Name,
    string Institution,
    decimal InvestedAmount,
    decimal CurrentValue,
    DateTime InvestmentDate,
    string Type,
    string Indexer,
    decimal ContractedRate,
    decimal? IndexerPercentage = null,
    DateTime? MaturityDate = null,
    string Notes = ""
);

public record UpdateVariableIncomeRequest(
    string Name,
    string Institution,
    decimal InvestedAmount,
    decimal CurrentPrice,
    decimal Shares,
    DateTime InvestmentDate,
    string Category,
    string Ticker,
    decimal DividendsReceived = 0,
    string Notes = ""
);

public record UpdateValueRequest(decimal NewValue);

public record UpdatePriceRequest(decimal NewPrice);

public record RegisterDividendRequest(decimal Amount);

// ═══════════════════════════════════════════════════════════════════════════
//  STATIC MAPPER
// ═══════════════════════════════════════════════════════════════════════════

public static class InvestmentMapper
{
    public static InvestmentDto ToDto(Investment inv) => inv switch
    {
        FixedIncome fi => new InvestmentDto(
            fi.Id, "FixedIncome", fi.Name, fi.Institution,
            fi.InvestedAmount, fi.CurrentValue, fi.Return,
            fi.ReturnPercentage, fi.IsPositive,
            fi.InvestmentDate, fi.MaturityDate, fi.Notes,
            fi.CreatedAt, fi.UpdatedAt,
            // FI
            fi.Type, fi.Indexer, fi.ContractedRate, fi.IndexerPercentage,
            // VI (nulls)
            null, null, null, null, null, null, null),

        VariableIncome vi => new InvestmentDto(
            vi.Id, "VariableIncome", vi.Name, vi.Institution,
            vi.InvestedAmount, vi.CurrentValue, vi.Return,
            vi.ReturnPercentage, vi.IsPositive,
            vi.InvestmentDate, vi.MaturityDate, vi.Notes,
            vi.CreatedAt, vi.UpdatedAt,
            // FI (nulls)
            null, null, null, null,
            // VI
            vi.Category, vi.Ticker, vi.Shares, vi.AveragePrice,
            vi.CurrentPrice, vi.DividendsReceived, vi.TotalReturn),

        _ => throw new InvalidOperationException($"Unmapped type: {inv.GetType().Name}")
    };

    public static PortfolioSummaryDto ToSummary(IReadOnlyList<Investment> list)
    {
        var totalInvested = list.Sum(i => i.InvestedAmount);
        var totalCurrent  = list.Sum(i => i.CurrentValue);
        var totalReturn   = totalCurrent - totalInvested;
        var pct           = totalInvested == 0 ? 0m
                            : Math.Round((totalReturn / totalInvested) * 100, 2);

        var fi  = list.OfType<FixedIncome>().ToList();
        var vi  = list.OfType<VariableIncome>().ToList();
        var tfi = fi.Sum(i => i.CurrentValue);
        var tvi = vi.Sum(i => i.CurrentValue);
        var pFI = totalCurrent == 0 ? 0m : Math.Round((tfi / totalCurrent) * 100, 2);
        var pVI = totalCurrent == 0 ? 0m : Math.Round((tvi / totalCurrent) * 100, 2);

        return new PortfolioSummaryDto(
            totalInvested, totalCurrent, totalReturn, pct,
            list.Count, fi.Count, vi.Count,
            tfi, tvi, pFI, pVI);
    }
}
