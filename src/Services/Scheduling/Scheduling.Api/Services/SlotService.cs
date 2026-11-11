using Microsoft.EntityFrameworkCore;
using Scheduling.Api.Data;
using Scheduling.Api.Models;


namespace Scheduling.Api.Services
{
    public class SlotService(SchedulingDbContext db, IConfiguration config)
    {
        public TimeZoneInfo Zone { get; } =
            TimeZoneInfo.FindSystemTimeZoneById(config["Scheduling:TimeZone"]!);

        public async Task<List<Slot>> GetSlotsAsync(Guid doctorId, DateOnly date, int durationMinutes)
        {
            var dayStartUtc = TimeZoneInfo.ConvertTimeToUtc(
            date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Unspecified), Zone);
            var dayEndUtc = TimeZoneInfo.ConvertTimeToUtc(
                date.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Unspecified), Zone);

            var schedule = await db.WorkSchedules
                .Include(w => w.Breaks)
                .FirstOrDefaultAsync(w => w.DoctorId == doctorId && w.DayOfWeek == date.DayOfWeek);

            var timeOffs = await db.TimeOffs
                .Where(t => t.DoctorId == doctorId && t.StartAt < dayEndUtc && t.EndAt > dayStartUtc)
                .Select(t => new UtcRange(t.StartAt, t.EndAt))
                .ToListAsync();

            var booked = await db.Appointments
                .Where(a => a.DoctorId == doctorId
                            && a.Status == AppointmentStatus.Booked
                            && a.StartAt < dayEndUtc && a.EndAt > dayStartUtc)
                .Select(a => new UtcRange(a.StartAt, a.EndAt))
                .ToListAsync();

            var workHours = schedule is null
                ? null
                : new LocalRange(schedule.StartTime, schedule.EndTime);

            var breaks = schedule is null
                ? new List<LocalRange>()
                : schedule.Breaks.Select(b => new LocalRange(b.StartTime, b.EndTime)).ToList();

            return SlotCalculator.Calculate(date, Zone, workHours, breaks, timeOffs, booked, durationMinutes, DateTime.UtcNow);
        }
    }
}
