using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Scheduling.Api.Clients;
using Scheduling.Api.Data;
using Scheduling.Api.Dto;
using Scheduling.Api.Models;
using Scheduling.Api.Services;
using System.Linq;

namespace Scheduling.Api.Controllers
{
    [ApiController]
    [Route("api/appointments")]
    [Authorize]
    public class AppointmentController(SchedulingDbContext db, DirectoryClient directory, SlotService slotService) : ControllerBase
    {
        private const int minCancelHours = 24;

        private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        private bool isAdmin => User.IsInRole("Admin");

        [HttpPost]
        public async Task<ActionResult<AppointmentResponse>> Create(CreateAppointmentRequest request)
        {
            if (request.StartAt.Kind == DateTimeKind.Unspecified) 
                return BadRequest(new { message = "Vreme termina mora biti u UTC formatu, npr. 2026-11-16T07:00:00Z." });

            var startAt = request.StartAt.ToUniversalTime();

            var doctor = await directory.GetDoctorAsync(request.DoctorId);
            if (doctor is null || !doctor.IsActive)
                return NotFound(new { message = "Lekar ne postoji ili nije aktivan." });

            var type = await directory.GetExaminationTypes(request.ExaminationTypeId);
            if (type is null)
                return NotFound(new { message = "Tip pregleda ne postoji." });
            if (type.SpecialtyId != doctor.SpecialtyId)
                return BadRequest(new { message = "Tip pregleda ne pripada specijalnosti ovog lekara." });

            await using var tx = await db.Database.BeginTransactionAsync();
            await db.Database.ExecuteSqlInterpolatedAsync(
                $"SELECT pg_advisory_xact_lock(hashtext({doctor.Id.ToString()}))");

            var localDate = DateOnly.FromDateTime(
                TimeZoneInfo.ConvertTimeFromUtc(startAt, slotService.Zone));

            var slots = await slotService.GetSlotsAsync(doctor.Id, localDate, type.DurationMinutes);
            var slot = slots.FirstOrDefault(s => s.StartAt == startAt);
            if (slot is null)
                return Conflict(new { message = "Termin vise nije slobodan." });

            var appointment = new Appointment
            {
                DoctorId = doctor.Id,
                DoctorUserId = doctor.UserId,
                PatientId = CurrentUserId,
                ExaminationTypeId = type.Id,
                StartAt = slot.StartAt,
                EndAt = slot.EndAt,
            };

            db.Appointments.Add(appointment);
            await db.SaveChangesAsync();
            await tx.CommitAsync();

            return StatusCode(StatusCodes.Status201Created, ToResponse(appointment));
        }

        [HttpGet("mine")]
        public async Task<ActionResult<List<AppointmentResponse>>> GetMine()
        {
            var userId = CurrentUserId;
            var items = await db.Appointments
                .Where(a => a.PatientId == userId)
                .OrderByDescending(a => a.StartAt)
                .ToListAsync();

            return Ok(items.Select(ToResponse).ToList());
        }

        [Authorize(Roles = "Doctor")]
        [HttpGet("doctor")]
        public async Task<ActionResult<List<AppointmentResponse>>> GetForDoctor()
        {
            var userId = CurrentUserId;
            var items = await db.Appointments
                .Where(a => a.DoctorUserId == userId)
                .OrderByDescending(a => a.StartAt)
                .ToListAsync();

            return Ok(items.Select(ToResponse).ToList());
        }

        [HttpPost("{id:guid}/cancel")]
        public async Task<IActionResult> Cancel(Guid id, [FromQuery] string? reason)
        {
            if (reason is { Length: > 300 })
                return BadRequest(new { message = "Razlog moze imati najvise 300 znakova." });

            var appointment = await db.Appointments.FindAsync(id);
            if (appointment is null) 
                return NotFound();

            var userId = CurrentUserId;
            var isPatient = appointment.PatientId == userId;
            var isDoctor = appointment.DoctorId == userId;

            if (!isPatient && !isDoctor && !isAdmin) 
                return NotFound();

            if (appointment.Status != AppointmentStatus.Booked)
                return Conflict(new { message = "Termin je vec otkazan ili zavrsen" });

            var canCancelLate = isDoctor || isAdmin;
            if (!canCancelLate && appointment.StartAt - DateTime.UtcNow < TimeSpan.FromHours(minCancelHours))
                return BadRequest(new { message = $"Termin se ne moze otkazati manje od {minCancelHours} sata pre pocetka" });

            appointment.Status = AppointmentStatus.Cancelled;
            appointment.CancelReason = reason;

            await db.SaveChangesAsync();

            return NoContent();

        }


        private static AppointmentResponse ToResponse(Appointment a) =>
            new(a.Id, a.DoctorId, a.PatientId, a.ExaminationTypeId, a.StartAt, a.EndAt, a.Status.ToString(), a.CancelReason);
    }
}
