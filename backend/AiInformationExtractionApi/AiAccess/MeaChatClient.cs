using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.AI;

namespace AiInformationExtractionApi.AiAccess;

public sealed class MeaChatClient : IAiChatClient
{
    private readonly IChatClient _chatClient;
    private readonly AiOptions _options;

    public MeaChatClient(IChatClient chatClient, AiOptions options)
    {
        _chatClient = chatClient;
        _options = options;
    }

    public Task<ChatResponse> CompleteChatAsync(
        List<ChatMessage> chatMessages,
        CancellationToken cancellationToken = default
    )
    {
        var options = new ChatOptions
        {
            Temperature = _options.Temperature,
            ResponseFormat = ChatResponseFormat.Json
        };
        return _chatClient.GetResponseAsync(chatMessages, options, cancellationToken);
    }
}
