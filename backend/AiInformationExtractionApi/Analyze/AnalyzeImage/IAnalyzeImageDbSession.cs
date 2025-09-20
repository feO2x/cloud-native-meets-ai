using System;
using System.Threading;
using System.Threading.Tasks;
using AiInformationExtractionApi.DatabaseAccess.Model;

namespace AiInformationExtractionApi.Analyze.AnalyzeImage;

public interface IAnalyzeImageDbSession : IAsyncDisposable
{
    Task<MediaItem?> GetMediaItemAsync(Guid id, CancellationToken cancellationToken = default);
}
