using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query.Internal;
using Scheduling.Api.Clients;
using Scheduling.Api.Data;
using Scheduling.Api.Dto;
using Scheduling.Api.Models;

namespace Scheduling.Api.Controllers
{
    [ApiController]
    [Route("api/work-schedules")]
    [Authorize(Roles = "Admin,Doctor")]
    public class WorkSchedulesController(SchedulingDbContext db, DirectoryClient directory) : ControllerBase
    {
        private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        private bool IsAdmin => User.IsInRole("Admin");

        [Authorize(Roles ="Admin")]
        [HttpGet]
        public async Task<ActionResult<List<WorkScheduleResponse>>> GetByDoctor([FromQuery] Guid doctorId)
        {
            var items = await db.WorkSchedules
                .Include(w => w.Breaks)
                .Where(w => w.DoctorId == doctorId)
                .OrderBy(w => w.DayOfWeek)
                .ToListAsync();

            return Ok(items.Select(ToResponse).ToList());
        }

        [Authorize(Roles = "Doctor")]
        [HttpGet("mine")]
        public async Task<ActionResult<List<WorkScheduleResponse>>> GetMine()
        {
            var userId = CurrentUserId;
            var items = await db.WorkSchedules
                .Include(w => w.Breaks)
                .Where(w => w.DoctorId == userId)
                .OrderBy(w => w.DayOfWeek)
                .ToListAsync();

            return Ok(items.Select(ToResponse).ToList());
        }

        [HttpPut]
        public async Task<ActionResult<List<WorkScheduleResponse>>> Save(SaveWorkScheduleRequest request)
        {
            if (!Enum.IsDefined(request.DayOfWeek))
                return BadRequest(new { message = "Neispravan dan u nedelji" });
            if (request.EndTime <= request.StartTime)
                return BadRequest(new { message = "Kraj radnog vremena mora biti posle pocetka" });

            var breakError = ValidateBreaks(request);
            if (breakError is not null)
                return BadRequest(new { message = breakError });

            DoctorSummary? doctor;
            if (IsAdmin)
            {
                if (request.DoctorId is null)
                    return BadRequest(new { message = "Admin mora da navede doctorId" });

                doctor = await directory.GetDoctorAsync(request.DoctorId.Value);
            }
            else
            {
                doctor = await directory.GetDoctorByUserAsync(CurrentUserId);
            }
            if (doctor is null || !doctor.IsActive)
                return BadRequest(new { message = "Lekar ne postoji ili nije aktivan" });

            var schedule = await db.WorkSchedules
                .Include(w => w.Breaks)
                .FirstOrDefaultAsync(w => w.DoctorId == doctor.Id && w.DayOfWeek == request.DayOfWeek);

            if(schedule is null)
            {
                schedule = new WorkSchedule
                {
                    DoctorId = doctor.Id,
                    DoctorUserId = doctor.UserId,
                    DayOfWeek = request.DayOfWeek
                };
                db.WorkSchedules.Add(schedule);
            }
            schedule.StartTime = request.StartTime;
            schedule.EndTime = request.EndTime;

            schedule.Breaks.Clear();
            foreach(var b in request.Breaks)
            {
                schedule.Breaks.Add(new BreakPeriod
                {
                    StartTime = b.StartTime,
                    EndTime = b.EndTime
                });
            }

            await db.SaveChangesAsync();
            return Ok(ToResponse(schedule));

        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var schedule = await db.WorkSchedules.FindAsync(id);
            if (schedule is null) return NotFound();

            if (!IsAdmin && schedule.DoctorUserId != CurrentUserId)
                return Forbid();

            db.WorkSchedules.Remove(schedule);
            await db.SaveChangesAsync();
            return NoContent();
        }

        private static string? ValidateBreaks(SaveWorkScheduleRequest r)
        {
            var ordered = r.Breaks.OrderBy(b => b.StartTime).ToList();
            for (var i = 0; i< ordered.Count; i++)
            {
                var b = ordered[i];
                if (b.EndTime <= b.StartTime)
                    return "Kraj pauze mora biti posle pocetka.";
                if (b.StartTime < r.StartTime || b.EndTime > r.EndTime)
                    return "Pauza mora biti unutar radnog vremena.";
                if (i > 0 && b.StartTime < ordered[i - 1].EndTime)
                    return "Pauze se ne smeju preklapati.";
            }
            return null;
        }

        private static WorkScheduleResponse ToResponse(WorkSchedule w) => new(
        w.Id,
        w.DoctorId,
        w.DayOfWeek,
        w.StartTime,
        w.EndTime,
        w.Breaks
            .OrderBy(b => b.StartTime)
            .Select(b => new BreakDto(b.StartTime, b.EndTime))
            .ToList());
    }
}
