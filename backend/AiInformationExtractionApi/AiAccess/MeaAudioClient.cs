using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.AI;

namespace AiInformationExtractionApi.AiAccess;

[Experimental("MEAI001")]
public sealed class MeaAudioClient : IAiAudioClient
{
    private readonly ISpeechToTextClient _speechToTextClient;

    public MeaAudioClient(ISpeechToTextClient speechToTextClient) => _speechToTextClient = speechToTextClient;

    public async Task<string> TranscribeAudioAsync(string audioFilePath, CancellationToken cancellationToken = default)
    {
        await using var fileStream = File.OpenRead(audioFilePath);
        var response = await _speechToTextClient.GetTextAsync(fileStream, cancellationToken: cancellationToken);
        return response.Text;
    }
}
