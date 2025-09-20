using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using AiInformationExtractionApi.DatabaseAccess;
using Light.DatabaseAccess.EntityFrameworkCore;
using Npgsql;

namespace AiInformationExtractionApi.Media.UploadMedia;

public sealed class EfUploadMediaSession : EfClient<AiInformationExtractionDbContext>, IUploadMediaDbSession
{
    public EfUploadMediaSession(AiInformationExtractionDbContext dbContext) : base(dbContext) { }

    public async Task UploadMediaItemAsync(
        Guid id,
        string name,
        string mimeType,
        Stream content,
        CancellationToken cancellationToken
    )
    {
        const string sql =
            """
            INSERT INTO "MediaItems" ("Id", "Name", "MimeType", "ContentSizeInBytes", "Content")
            VALUES ($1, $2, $3, $4, $5);
            """;
        await using var command = await CreateCommandAsync<NpgsqlCommand>(sql, cancellationToken);
        command.Parameters.Add(new NpgsqlParameter<Guid> { TypedValue = id });
        command.Parameters.Add(new NpgsqlParameter { Value = name });
        command.Parameters.Add(new NpgsqlParameter { Value = mimeType });
        command.Parameters.Add(new NpgsqlParameter<int> { TypedValue = (int) content.Length });
        command.Parameters.Add(new NpgsqlParameter { Value = content });
        await command.ExecuteNonQueryAsync(cancellationToken);
    }
}
