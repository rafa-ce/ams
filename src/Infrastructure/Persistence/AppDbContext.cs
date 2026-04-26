using InvestimentosPessoais.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InvestimentosPessoais.Infrastructure.Persistence;

/// <summary>
/// Main DbContext with TPH (Table-per-Hierarchy).
/// The entire Investment hierarchy goes to the "Investments" table
/// with the discriminator column "InvestmentType".
/// </summary>
public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Investment> Investments => Set<Investment>();
    public DbSet<FixedIncome> FixedIncomes => Set<FixedIncome>();
    public DbSet<VariableIncome> VariableIncomes => Set<VariableIncome>();
    public DbSet<Transaction> Transactions => Set<Transaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── TPH Hierarchy Root ────────────────────────────────────────────
        modelBuilder.Entity<Investment>(e =>
        {
            e.ToTable("Investments");
            e.HasKey(x => x.Id);

            e.HasDiscriminator<string>("InvestmentType")
             .HasValue<FixedIncome>("FixedIncome")
             .HasValue<VariableIncome>("VariableIncome");

            e.Property(x => x.Name)
             .IsRequired()
             .HasMaxLength(200);

            e.Property(x => x.Institution)
             .IsRequired()
             .HasMaxLength(100);

            e.Ignore(x => x.InvestedAmount);
            e.Ignore(x => x.InvestmentDate);

            e.HasMany(x => x.Transactions)
             .WithOne(t => t.Investment)
             .HasForeignKey(t => t.InvestmentId)
             .OnDelete(DeleteBehavior.Cascade);

            e.Property(x => x.CurrentValue)
             .HasColumnType("decimal(18,2)")
             .IsRequired();

            e.Property(x => x.Notes)
             .HasMaxLength(500)
             .HasDefaultValue(string.Empty);

            e.Property(x => x.CreatedAt)
             .HasDefaultValueSql("CURRENT_TIMESTAMP");

            e.Property(x => x.UpdatedAt)
             .HasDefaultValueSql("CURRENT_TIMESTAMP");

            // Discriminator index for type filters
            e.HasIndex("InvestmentType").HasDatabaseName("IX_Investments_Type");
        });

        // ── Fixed Income ────────────────────────────────────────────────────────
        modelBuilder.Entity<FixedIncome>(e =>
        {
            e.Property(x => x.Type)
             .IsRequired()
             .HasMaxLength(50);

            e.Property(x => x.Indexer)
             .IsRequired()
             .HasMaxLength(30);

            e.Property(x => x.ContractedRate)
             .HasColumnType("decimal(8,4)");

            e.Property(x => x.IndexerPercentage)
             .HasColumnType("decimal(8,4)");
        });

        // ── Variable Income ────────────────────────────────────────────────────
        modelBuilder.Entity<VariableIncome>(e =>
        {
            e.Property(x => x.Category)
             .IsRequired()
             .HasMaxLength(50);

            e.Property(x => x.Ticker)
             .IsRequired()
             .HasMaxLength(20);

            e.Ignore(x => x.Shares);
            e.Ignore(x => x.AveragePrice);

            e.Property(x => x.CurrentPrice)
             .HasColumnType("decimal(18,6)");

            e.Property(x => x.DividendsReceived)
             .HasColumnType("decimal(18,2)")
             .HasDefaultValue(0m);

            e.HasIndex(x => x.Ticker).HasDatabaseName("IX_VariableIncome_Ticker");
        });

        // ── Transactions ────────────────────────────────────────────────────────
        modelBuilder.Entity<Transaction>(e =>
        {
            e.ToTable("Transactions");
            e.HasKey(x => x.Id);
            
            e.Property(x => x.Amount).HasColumnType("decimal(18,2)").IsRequired();
            e.Property(x => x.Shares).HasColumnType("decimal(18,6)");
            e.Property(x => x.UnitPrice).HasColumnType("decimal(18,6)");
            e.HasIndex(x => x.PurchaseDate);
        });
    }
}
