using System;
using Light.GuardClauses;
using Light.GuardClauses.Exceptions;
using Microsoft.Extensions.Configuration;

namespace AiInformationExtractionApi.AiAccess;

public sealed record AiOptions
{
    public string TextVisionService { get; init; } = "OpenAI";
    public string TextVisionModel { get; init; } = "gpt-5";

    public string AudioTranscriptionService { get; init; } = "OpenAI";
    public string AudioTranscriptionModel { get; init; } = "whisper-1";
    public float? Temperature { get; init; }
    public string ApiKey { get; init; } = string.Empty;

    public static AiOptions FromConfiguration(IConfiguration configuration, string sectionName = "ai")
    {
        sectionName.MustNotBeNullOrWhiteSpace();
        var options = configuration.GetSection(sectionName).Get<AiOptions>() ?? new AiOptions();
        var validationResults = new AiOptionsValidator().Validate(options);
        if (validationResults.IsValid)
        {
            return options;
        }

        var errorMessage = $"AiOptions are invalid{Environment.NewLine}{validationResults}";
        throw new InvalidConfigurationException(errorMessage);
    }
}
