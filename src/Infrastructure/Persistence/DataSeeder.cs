using InvestimentosPessoais.Domain.Entities;
using InvestimentosPessoais.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InvestimentosPessoais.Infrastructure.Persistence;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Investments.AnyAsync()) return;

        var cdb = new FixedIncome("CDB Banco Inter 110% CDI", "Banco Inter", 10_850m, "CDB", "CDI", 0m, 110m, new DateTime(2025, 1, 15));
        cdb.AddTransaction(new Transaction(0, 10_000m, new DateTime(2024, 1, 15)));

        var tesouro = new FixedIncome("Tesouro IPCA+ 2029", "Tesouro Direto", 5_320m, "Treasury IPCA+", "IPCA", 5.5m, null, new DateTime(2029, 5, 15));
        tesouro.AddTransaction(new Transaction(0, 5_000m, new DateTime(2024, 3, 10)));

        var lci = new FixedIncome("LCI Bradesco 95% CDI", "Bradesco", 8_420m, "LCI", "CDI", 0m, 95m, new DateTime(2025, 6, 1));
        lci.AddTransaction(new Transaction(0, 8_000m, new DateTime(2024, 6, 1)));

        var cdbXp = new FixedIncome("CDB XP 12% p.a. Prefixed", "XP Investimentos", 3_180m, "CDB", "Prefixed", 12m, null, new DateTime(2025, 9, 1));
        cdbXp.AddTransaction(new Transaction(0, 3_000m, new DateTime(2024, 9, 1)));

        var petr4 = new VariableIncome("Petrobras PN", "XP Investimentos", 36.90m, "Stocks", "PETR4", 420m);
        petr4.AddTransaction(new Transaction(0, 6_000m, new DateTime(2023, 11, 5), 155m, Math.Round(6000m/155m, 6)));

        var hglg11 = new VariableIncome("CSHG Logística REIT", "BTG Pactual", 148.60m, "REITs", "HGLG11", 280m);
        hglg11.AddTransaction(new Transaction(0, 4_000m, new DateTime(2024, 2, 20), 27m, Math.Round(4000m/27m, 6)));

        var bova11 = new VariableIncome("BOVA11 ETF Ibovespa", "Clear", 118.40m, "ETFs", "BOVA11", 0m);
        bova11.AddTransaction(new Transaction(0, 3_000m, new DateTime(2024, 4, 10), 26m, Math.Round(3000m/26m, 6)));

        var vale3 = new VariableIncome("Vale ON", "Rico", 59.80m, "Stocks", "VALE3", 195m);
        vale3.AddTransaction(new Transaction(0, 2_500m, new DateTime(2024, 5, 15), 42m, Math.Round(2500m/42m, 6)));

        var investments = new List<Investment> { cdb, tesouro, lci, cdbXp, petr4, hglg11, bova11, vale3 };

        await db.Investments.AddRangeAsync(investments);
        await db.SaveChangesAsync();
    }
}
