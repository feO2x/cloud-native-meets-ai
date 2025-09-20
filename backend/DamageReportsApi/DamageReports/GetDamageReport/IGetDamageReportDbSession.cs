using System;
using System.Threading;
using System.Threading.Tasks;
using Shared.Messages.DamageReports;

namespace DamageReportsApi.DamageReports.GetDamageReport;

public interface IGetDamageReportDbSession : IAsyncDisposable
{
    Task<DamageReportDto?> GetDamageReportAsync(Guid id, CancellationToken cancellationToken = default);
}
