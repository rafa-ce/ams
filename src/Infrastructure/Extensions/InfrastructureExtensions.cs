using System.Data;
using InvestimentosPessoais.Domain.Interfaces;
using InvestimentosPessoais.Infrastructure.Persistence;
using InvestimentosPessoais.Infrastructure.Persistence.Repositories;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace InvestimentosPessoais.Infrastructure.Extensions;

public static class InfrastructureExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connStr = configuration.GetConnectionString("DefaultConnection")
                      ?? "Data Source=investimentos.db";

        // ── EF Core (escrita + migrations) ────────────────────────────────────
        services.AddDbContext<AppDbContext>(opt =>
            opt.UseSqlite(connStr));

        // ── IDbConnection (Dapper — disponível para uso futuro) ───────────────
        // Scoped = uma conexão por request HTTP, fechada ao fim do request.
        services.AddScoped<IDbConnection>(_ => new SqliteConnection(connStr));

        // ── Repositórios ──────────────────────────────────────────────────────
        services.AddScoped<IInvestmentRepository, InvestmentRepository>();

        return services;
    }
}
