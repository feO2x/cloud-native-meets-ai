using System;
using System.Threading;
using System.Threading.Tasks;
using DamageReportsApi.DatabaseAccess;
using DamageReportsApi.DatabaseAccess.Model;
using Light.DatabaseAccess.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace DamageReportsApi.DamageReports.SubmitDamageReport;

public sealed class EfSubmitDamageReportSession : EfSession<DamageReportsDbContext>,
                                                  ISubmitDamageReportDbSession
{
    public EfSubmitDamageReportSession(DamageReportsDbContext dbContext) : base(dbContext) { }

    public Task<DamageReport?> GetDamageReportAsync(Guid id, CancellationToken cancellationToken = default) =>
        DbContext
           .DamageReports
           .Include(dr => dr.Passengers)
           .Include(dr => dr.OtherPartyContact)
           .FirstOrDefaultAsync(dr => dr.Id == id, cancellationToken);

    public Task AddDamageReportAsync(DamageReport damageReport, CancellationToken cancellationToken = default)
    {
        DbContext.DamageReports.Add(damageReport);
        return Task.CompletedTask;
    }

    public Task AddPassengerAsync(Passenger passenger, CancellationToken cancellationToken = default)
    {
        DbContext.Passengers.Add(passenger);
        return Task.CompletedTask;
    }

    public Task AddOtherPartyContactAsync(
        OtherPartyContact otherPartyContact,
        CancellationToken cancellationToken = default
    )
    {
        DbContext.OtherPartyContacts.Add(otherPartyContact);
        return Task.CompletedTask;
    }

    public Task RemovePassengerAsync(Passenger passenger, CancellationToken cancellationToken = default)
    {
        DbContext.Passengers.Remove(passenger);
        return Task.CompletedTask;
    }

    public Task RemoveOtherPartyContactAsync(
        OtherPartyContact otherPartyContact,
        CancellationToken cancellationToken = default
    )
    {
        DbContext.OtherPartyContacts.Remove(otherPartyContact);
        return Task.CompletedTask;
    }
}
