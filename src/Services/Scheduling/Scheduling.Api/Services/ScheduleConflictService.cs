using Microsoft.EntityFrameworkCore;
using Scheduling.Api.Data;
using Scheduling.Api.Models;

namespace Scheduling.Api.Services;

public record AffectedAppointments(Guid Id, DateTime StartAt, DateTime EndAt);

public class ScheduleConflictService(SchedulingDbContext db, SlotService slotService)
{
    public async Task<List<AffectedAppointments>> FindByTimeOffAsync(Guid doctorId, DateTime startUtc, DateTime endUtc)
    {
        return await db.Appointments
            .Where(a => a.DoctorId == doctorId
                    && a.Status == AppointmentStatus.Booked
                    && a.StartAt < endUtc && a.EndAt > startUtc)
            .OrderBy(a => a.StartAt)
            .Select(a => new AffectedAppointments(a.Id, a.StartAt, a.EndAt))
            .ToListAsync();
    } 

    public async Task<List<AffectedAppointments>> FindByScheduleAsync(Guid doctorId, DayOfWeek day, LocalRange? workHours, IReadOnlyList<LocalRange> breaks)
    {
        var now = DateTime.UtcNow;

        var future = await db.Appointments
            .Where(a => a.DoctorId == doctorId
                        && a.Status == AppointmentStatus.Booked
                        && a.EndAt > now)
            .ToListAsync();

        var affected = new List<AffectedAppointments>();
        foreach(var a in future)
        {
            var localStart = TimeZoneInfo.ConvertTimeFromUtc(a.StartAt, slotService.Zone);
            if (localStart.DayOfWeek != day) continue;

            var localEnd = TimeZoneInfo.ConvertTimeFromUtc(a.EndAt, slotService.Zone);
            var start = TimeOnly.FromDateTime(localStart);
            var end = TimeOnly.FromDateTime(localEnd);


            var fits = workHours is not null
                        && start >= workHours.Start && end <= workHours.End
                        && !breaks.Any(b => start < b.End && b.Start < end);

            if (!fits)
            {
                affected.Add(new AffectedAppointments(a.Id, a.StartAt, a.EndAt));
            }
        }
        return affected.OrderBy(x => x.StartAt).ToList();
    }
}
