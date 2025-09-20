using Aspire.Hosting;
using Microsoft.Extensions.Configuration;
using Projects;
using Shared;
using Shared.CompositionRoot;

namespace AspireAppHost;

public static class CompositionRoot
{
    public static IDistributedApplicationBuilder ConfigureServices(this IDistributedApplicationBuilder builder)
    {
        builder.Services.AddDefaultLogging(builder.Configuration);
        var appHostOptions = builder.Configuration.GetSection("appHost").Get<AppHostOptions>() ?? new AppHostOptions();

        var gateway = builder.AddProject<Gateway>(Constants.GatewayName);
        var identityServer = builder.AddProject<IdentityServer>(Constants.IdentityServerName);
        var postgresServer = builder.AddPostgres(Constants.PostgresServerName);
        var damageReportsDatabase = postgresServer.AddDatabase(Constants.DamageReportsDatabaseName);
        var aiInformationExtractionDatabase = postgresServer.AddDatabase(Constants.AiInformationExtractionDatabaseName);

        var damageReportsApi = builder
           .AddProject<DamageReportsApi>(Constants.DamageReportsServiceName)
           .WaitFor(damageReportsDatabase)
           .WaitFor(identityServer)
           .WithReference(damageReportsDatabase)
           .WithReference(identityServer);

        var aiInformationExtractionApi = builder
           .AddProject<AiInformationExtractionApi>(Constants.AiInformationExtractionServiceName)
           .WaitFor(aiInformationExtractionDatabase)
           .WaitFor(identityServer)
           .WithReference(aiInformationExtractionDatabase)
           .WithReference(identityServer);

        if (appHostOptions.RunOllama)
        {
            var ollamaServer = builder
               .AddOllama("ollama")
               .WithDataVolume("ollama-data")
               .WithGPUSupport()
               .WithOpenWebUI();
            var aiModel = ollamaServer.AddModel("llama", "llama3.2-vision:11b");

            aiInformationExtractionApi
               .WithReference(aiModel)
               .WithEnvironment("AI__TextVisionService", "Ollama")
               .WithEnvironment("AI__TextVisionModel", "llama");
        }

        identityServer.WithReference(gateway);
        gateway
           .WaitFor(identityServer)
           .WithReference(identityServer)
           .WithReference(damageReportsApi)
           .WithReference(aiInformationExtractionApi);

        return builder;
    }
}
