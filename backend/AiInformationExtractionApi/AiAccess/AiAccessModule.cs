using System;
using System.Diagnostics.CodeAnalysis;
using Light.GuardClauses.Exceptions;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OpenAI.Audio;
using OpenAI.Chat;

namespace AiInformationExtractionApi.AiAccess;

public static class AiAccessModule
{
    [Experimental("MEAI001")]
    public static WebApplicationBuilder AddAiAccess(this WebApplicationBuilder builder)
    {
        var services = builder.Services;
        // AI Options
        var aiOptions = AiOptions.FromConfiguration(builder.Configuration);
        services.AddSingleton(aiOptions);

        // AI Chat Client
        if (string.Equals(aiOptions.TextVisionService, "OpenAI", StringComparison.OrdinalIgnoreCase))
        {
            // OpenAI
            services
               .AddChatClient(new ChatClient(aiOptions.TextVisionModel, aiOptions.ApiKey).AsIChatClient())
               .UseLogging()
               .UseOpenTelemetry();
        }
        else if (string.Equals(aiOptions.TextVisionService, "MeaOllama", StringComparison.OrdinalIgnoreCase))
        {
            // Existing Ollama instance on host
            var connectionString =
                builder.Configuration.GetConnectionString("MeaOllama") ??
                throw new InvalidConfigurationException("Connection string 'MeaOllama' is missing.");
            services
               .AddChatClient(new OllamaChatClient(connectionString, aiOptions.TextVisionModel))
               .UseLogging()
               .UseOpenTelemetry();
        }
        else
        {
            // Ollama in Docker container
            builder
               .AddOllamaApiClient(aiOptions.TextVisionModel)
               .AddChatClient()
               .UseLogging()
               .UseOpenTelemetry();
        }

        services.AddSingleton(sp => AiOptions.FromConfiguration(sp.GetRequiredService<IConfiguration>()));
        services.AddScoped<IAiChatClient, MeaChatClient>();

        // AI Speech to Text Client
        services
           .AddSpeechToTextClient(sp =>
                {
                    var options = sp.GetRequiredService<AiOptions>();
                    return new AudioClient(options.AudioTranscriptionModel, options.ApiKey).AsISpeechToTextClient();
                }
            )
           .UseLogging();
        services.AddSingleton<IAiAudioClient, MeaAudioClient>();

        return builder;
    }
}
