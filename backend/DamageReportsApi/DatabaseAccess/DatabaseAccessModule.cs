using System.Threading.Tasks;
using DamageReportsApi.DatabaseAccess.Model;
using Light.GuardClauses;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Shared;

namespace DamageReportsApi.DatabaseAccess;

public static class DatabaseAccessModule
{
    public static WebApplicationBuilder AddDatabaseAccess(this WebApplicationBuilder builder)
    {
        builder.AddNpgsqlDbContext<DamageReportsDbContext>(Constants.DamageReportsDatabaseName);
        return builder;
    }

    public static async Task ApplyDatabaseMigrationsAsync(this WebApplication app, bool trySeedData = true)
    {
        await using var scope = app.Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<DamageReportsDbContext>();
        var executionStrategy = dbContext.Database.CreateExecutionStrategy();
        await executionStrategy.ExecuteAsync(dbContext, context => context.Database.MigrateAsync());
        if (trySeedData)
        {
            await executionStrategy.ExecuteAsync(dbContext, SeedDatabaseAsync);
        }
    }

    private static async Task SeedDatabaseAsync(DamageReportsDbContext dbContext)
    {
        if (await dbContext.DamageReports.AnyAsync())
        {
            return;
        }

        var sampleReports = SampleData.CreateSampleDamageReports();
        dbContext.DamageReports.AddRange(sampleReports);
        foreach (var sampleReport in sampleReports)
        {
            if (!sampleReport.Passengers.IsNullOrEmpty())
            {
                dbContext.Passengers.AddRange(sampleReport.Passengers);
            }

            if (sampleReport.OtherPartyContact is not null)
            {
                dbContext.OtherPartyContacts.Add(sampleReport.OtherPartyContact);
            }
        }

        await dbContext.SaveChangesAsync();
    }
}
