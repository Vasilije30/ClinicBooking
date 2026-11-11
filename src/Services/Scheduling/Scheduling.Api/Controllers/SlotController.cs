using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Scheduling.Api.Clients;
using Scheduling.Api.Models;
using Scheduling.Api.Services;
using Scheduling.Api.Data;
using Microsoft.AspNetCore.Mvc.Routing;

namespace Scheduling.Api.Controllers
{
    [ApiController]
    [Route("api/slots")]
    public class SlotController(SchedulingDbContext db, DirectoryClient directory, IConfiguration config) : ControllerBase
    {
        public async Task<ActionResult<List<Slot>>> Get([FromQuery] Guid doctorId, [FromQuery] Guid examinationTypeId, [FromQuery] DateOnly date)
        {
            var doctor = await directory.GetDoctorAsync(doctorId);
            if (doctor is null || !doctor.IsActive)
            {
                return NotFound(new { message = "Lekar ne postoji ili nije aktivan." });
            }
            var type = await directory.GetExaminationTypes(examinationTypeId);
            if (type is null)
            {
                return BadRequest(new { message = "Tip pregleda ne postoji." });
            }
            if (type.SpecialtyId != doctor.SpecialtyId)
            {
                return BadRequest(new { message = "Tip pregleda ne pripada specijalnosti ovog lekara." });
            }
            var zone = TimeZoneInfo.FindSystemTimeZoneById(config["Scheduling:TimeZone"]!);

            var dayStartUtc = TimeZoneInfo.ConvertTimeToUtc(
                date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Unspecified), zone);
            var dayEndUtc = TimeZoneInfo.ConvertTimeToUtc(
                date.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Unspecified), zone);

            var schedule = await db.WorkSchedules
                .Include(w => w.Breaks)
                .FirstOrDefaultAsync(w => w.DoctorId == doctorId && w.DayOfWeek == date.DayOfWeek);

            var timeOffs = await db.TimeOffs
                .Where(t => t.DoctorId == doctorId && t.StartAt < dayEndUtc && t.EndAt > dayStartUtc)
                .Select(t => new UtcRange(t.StartAt, t.EndAt))
                .ToListAsync();

            var booked = await db.Appointments
                .Where(a => a.DoctorId == doctorId && a.Status == AppointmentStatus.Booked && a.StartAt < dayEndUtc && a.EndAt > dayStartUtc)
                .Select(a => new UtcRange(a.StartAt, a.EndAt))
                .ToListAsync();

            var workHours = schedule is null
                ? null
                : new LocalRange(schedule.StartTime, schedule.EndTime);

            var breaks = schedule is null
                ? null
                : schedule.Breaks.Select(b => new LocalRange(b.StartTime, b.EndTime)).ToList();

            var slots = SlotCalculator.Calculate(date, zone, workHours, breaks, timeOffs, booked, type.DurationMinutes, DateTime.UtcNow);

            return Ok(slots);
        }
    }
}
