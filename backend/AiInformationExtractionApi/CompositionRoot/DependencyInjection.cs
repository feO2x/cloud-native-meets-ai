using System.Diagnostics.CodeAnalysis;
using AiInformationExtractionApi.AiAccess;
using AiInformationExtractionApi.Analyze;
using AiInformationExtractionApi.DatabaseAccess;
using AiInformationExtractionApi.Media;
using Light.SharedCore.Time;
using Microsoft.AspNetCore.Builder;
using Shared.Auth;
using Shared.CompositionRoot;
using Shared.JsonAccess;

namespace AiInformationExtractionApi.CompositionRoot;

public static class DependencyInjection
{
    [Experimental("MEAI001")]
    public static WebApplicationBuilder ConfigureServices(this WebApplicationBuilder builder)
    {
        builder.ConfigureDefaultLogging();
        builder.AddDatabaseAccess();
        builder.AddAiAccess();

        builder
           .Services
           .AddUtcClock()
           .AddDefaultHealthChecks()
           .AddDefaultHttpJsonOptions()
           .AddOpenTelemetryMetricsAndTracing(builder.Configuration)
           .AddJwtAuth(builder.Configuration)
           .AddOpenApiSupport()
           .AddAnalyzeModule()
           .AddMediaModule();

        return builder;
    }
}
