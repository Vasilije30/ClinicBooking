using System.Globalization;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Scheduling.Api.Clients;
using Scheduling.Api.Data;
using Scheduling.Api.Dto;
using Scheduling.Api.Models;

namespace Scheduling.Api.Controllers
{
    [ApiController]
    [Route("api/time-offs")]
    [Authorize(Roles = "Admin,Doctor")]
    public class TimeOffController(SchedulingDbContext db, DirectoryClient directory) : ControllerBase
    {
        public Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        private bool isAdmin => User.IsInRole("Admin");

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<List<TimeOffResponse>>> GetByDoctor([FromQuery] Guid doctorId)
        {
            var now = DateTime.UtcNow;
            var items = await db.TimeOffs
                .Where(t => t.DoctorId == doctorId && t.EndAt > now)
                .OrderBy(t => t.StartAt)
                .ToListAsync();

            return Ok(items.Select(ToResponse).ToList());
        }

        [AllowAnonymous]
        [HttpGet("whoami")]
        public IActionResult WhoAmI() =>
            Ok(User.Claims.Select(c => new { c.Type, c.Value }));

        [Authorize(Roles = "Doctor")]
        [HttpGet("mine")]
        public async Task<ActionResult<List<TimeOffResponse>>> GetMine()
        {
            var userId = CurrentUserId;
            var now = DateTime.UtcNow;

            var items = await db.TimeOffs
                .Where(t => t.DoctorId == userId && t.EndAt > now)
                .OrderBy(t => t.StartAt)
                .ToListAsync();

            return Ok(items.Select(ToResponse).ToList());
        }

        [HttpPost]
        public async Task<ActionResult<TimeOffResponse>> Create(CreateTimeOffRequest request)
        {
            if (request.StartAt.Kind == DateTimeKind.Unspecified || request.EndAt.Kind == DateTimeKind.Unspecified)
            {
                return BadRequest(new { message = "Vremena moraju biti u UTC formatu." });
            }
            var startAt = request.StartAt.ToUniversalTime();
            var endAt = request.EndAt.ToUniversalTime();

            if (endAt <= startAt) return BadRequest(new { message = "Kraj odsustva mora biti posle pocetka." });

            if (endAt <= DateTime.UtcNow) return BadRequest(new { message = "Odsustvo ne moze biti u proslosti." });

            if (request.reason is { Length: > 300 }) return BadRequest(new { message = "Razlog mora biti najvise 300 karaktera" });

            DoctorSummary? doctor;
            if (isAdmin)
            {
                if(request.DoctorId is null)
                {
                    return BadRequest(new { message = "Admin mora da unese doctorId" });
                }
                doctor = await directory.GetDoctorAsync(request.DoctorId.Value);
            } 
            else
            {
                doctor = await directory.GetDoctorByUserAsync(CurrentUserId);
            }
            if(doctor is null || !doctor.IsActive)
            {
                return BadRequest(new { message = "Lekar ne postoji ili nije aktivan." });
            }

            var timeOff = new TimeOff
            {
                DoctorId = doctor.Id,
                DoctorUserId = doctor.UserId,
                StartAt = startAt,
                EndAt = endAt,
                Reason = request.reason
            };
            db.TimeOffs.Add(timeOff);
            await db.SaveChangesAsync();

            return StatusCode(StatusCodes.Status201Created, ToResponse(timeOff));
        }

        [HttpDelete("{id:guid}")]
        public async Task <IActionResult> Delete(Guid id)
        {
            var timeOff = await db.TimeOffs.FindAsync(id);
            if(timeOff is null)
            {
                return NotFound();
            }
            if (!isAdmin && timeOff.DoctorUserId != CurrentUserId)
                return NotFound();

            db.TimeOffs.Remove(timeOff);
            await db.SaveChangesAsync();

            return NoContent();
        }

        private static TimeOffResponse ToResponse(TimeOff t) =>
            new(t.Id, t.DoctorId, t.StartAt, t.EndAt, t.Reason);


    }
}
