using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Shared.Messages.DamageReports;

namespace DamageReportsApi.DamageReports.GetDamageReports;

public interface IGetDamageReportsDbSession : IAsyncDisposable
{
    Task<List<DamageReportListDto>> GetDamageReportsAsync(
        int skip,
        int take,
        CancellationToken cancellationToken = default
    );
}
