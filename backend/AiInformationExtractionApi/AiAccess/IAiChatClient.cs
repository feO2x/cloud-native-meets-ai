using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.AI;

namespace AiInformationExtractionApi.AiAccess;

public interface IAiChatClient
{
    Task<ChatResponse> CompleteChatAsync(List<ChatMessage> chatMessages, CancellationToken cancellationToken = default);
}
