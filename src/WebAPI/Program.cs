using InvestimentosPessoais.Infrastructure.Extensions;
using InvestimentosPessoais.Infrastructure.Persistence;
using InvestimentosPessoais.WebAPI.Endpoints;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ── Infraestrutura (EF Core + IDbConnection + Repositórios) ──────────────────
builder.Services.AddInfrastructure(builder.Configuration);

// ── CORS (Vite dev server + produção) ────────────────────────────────────────
builder.Services.AddCors(opt =>
    opt.AddPolicy("FrontendPolicy", policy =>
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://localhost:4173")
              .AllowAnyHeader()
              .AllowAnyMethod()));

// ── OpenAPI / Swagger ─────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(opt =>
{
    opt.SwaggerDoc("v1", new()
    {
        Title   = "Personal Investments API",
        Version = "v1",
        Description = "API for personal investments management (Fixed Income and Variable Income)"
    });
});

var app = builder.Build();

// ── Migrations automáticas + Seed ────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    await DataSeeder.SeedAsync(db);
}

// ── Middleware ────────────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(opt =>
    {
        opt.SwaggerEndpoint("/swagger/v1/swagger.json", "Investments v1");
        opt.RoutePrefix = "swagger";
    });
}

app.UseCors("FrontendPolicy");

// ── Endpoints ─────────────────────────────────────────────────────────────────
app.MapInvestmentEndpoints();

app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();

app.Run();
