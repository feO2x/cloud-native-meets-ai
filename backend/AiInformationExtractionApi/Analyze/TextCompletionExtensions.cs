using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AiInformationExtractionApi.AiAccess;
using Light.SharedCore.Time;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.AI;
using Serilog;
using Shared.JsonAccess;
using Shared.Messages.Analyze;

namespace AiInformationExtractionApi.Analyze;

public static class TextCompletionExtensions
{
    public static async Task<Ok<AnalysisResponseDto>> CompleteAnalysisAsync(
        this IAiChatClient aiChatClient,
        AnalysisType analysisType,
        FormSection formSection,
        List<ChatMessage> messages,
        IClock clock,
        ILogger logger,
        CancellationToken cancellationToken = default
    )
    {
        var now = clock.GetTime();
        var response = await aiChatClient.CompleteChatAsync(messages, cancellationToken);
        var responseText = response.Text;
        logger.Debug("Received response from AI analysis\n{AiResponse}", responseText);
        using var jsonDocument = Json.ParseDocument(responseText);
        return TypedResults.Ok(
            new AnalysisResponseDto(
                analysisType,
                formSection,
                now,
                // We clone the root element to avoid issues when the jsonDocument is disposed
                jsonDocument.RootElement.Clone()
            )
        );
    }
}
