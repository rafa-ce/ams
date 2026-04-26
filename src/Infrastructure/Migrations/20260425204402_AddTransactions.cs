using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InvestimentosPessoais.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTransactions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Investments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Institution = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    CurrentValue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MaturityDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false, defaultValue: ""),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    InvestmentType = table.Column<string>(type: "TEXT", maxLength: 21, nullable: false),
                    Type = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Indexer = table.Column<string>(type: "TEXT", maxLength: 30, nullable: true),
                    ContractedRate = table.Column<decimal>(type: "decimal(8,4)", nullable: true),
                    IndexerPercentage = table.Column<decimal>(type: "decimal(8,4)", nullable: true),
                    Category = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Ticker = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    CurrentPrice = table.Column<decimal>(type: "decimal(18,6)", nullable: true),
                    DividendsReceived = table.Column<decimal>(type: "decimal(18,2)", nullable: true, defaultValue: 0m)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Investments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Transactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    InvestmentId = table.Column<int>(type: "INTEGER", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PurchaseDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Shares = table.Column<decimal>(type: "decimal(18,6)", nullable: true),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transactions_Investments_InvestmentId",
                        column: x => x.InvestmentId,
                        principalTable: "Investments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Investments_Type",
                table: "Investments",
                column: "InvestmentType");

            migrationBuilder.CreateIndex(
                name: "IX_VariableIncome_Ticker",
                table: "Investments",
                column: "Ticker");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_InvestmentId",
                table: "Transactions",
                column: "InvestmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_PurchaseDate",
                table: "Transactions",
                column: "PurchaseDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Transactions");

            migrationBuilder.DropTable(
                name: "Investments");
        }
    }
}
