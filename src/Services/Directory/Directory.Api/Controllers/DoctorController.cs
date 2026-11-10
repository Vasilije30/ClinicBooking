using Directory.Api.Data;
using Directory.Api.Models;
using Directory.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Runtime.InteropServices;

namespace Directory.Api.Controllers
{
    [ApiController]
    [Route("api/doctors")]
    public class DoctorController(DirectoryDbContext db) : ControllerBase
    {

        [HttpGet]
        public async Task<ActionResult<List<DoctorListItemResponse>>> GetAll([FromQuery] Guid? specialtyId, [FromQuery] string? search )
        {
            var query = db.Doctors.Where(d => d.IsActive);

            if(specialtyId.HasValue)
            {
                query = query.Where(d => d.SpecialtyId == specialtyId.Value);
            }
            if(!string.IsNullOrWhiteSpace(search))
            {
                var target = search.Trim().ToLower();
                query = query.Where(d => (d.FirstName + " " + d.LastName).ToLower().Contains(target));
            }

            var items = await query.OrderBy(d => d.LastName).ThenBy(d => d.FirstName)
                                   .Select(d => new DoctorListItemResponse(
                                       d.Id, d.FirstName, d.LastName, d.Title, d.SpecialtyId, d.Specialty.Name))
                                   .ToListAsync();
            return Ok(items);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<DoctorDetailsResponse>> GetById(Guid id)
        {
            var doctor = await db.Doctors.Include(d => d.Specialty).FirstOrDefaultAsync(d => d.Id == id && d.IsActive);
            if (doctor is null) return NotFound();

            var examinationTypes = await db.ExaminationTypes.Where(t => t.SpecialtyId == doctor.SpecialtyId && t.IsActive)
                                                 .OrderBy(t => t.Name)
                                                 .Select(t => new ExaminationTypeResponse(t.Id, t.Name, t.Description, t.DurationMinutes, t.Price, t.SpecialtyId))
                                                 .ToListAsync();

            return Ok(new DoctorDetailsResponse(doctor.Id, doctor.FirstName, doctor.LastName, doctor.Title, doctor.Biography, doctor.SpecialtyId, doctor.Specialty.Name, examinationTypes));
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<DoctorDetailsResponse>> Create(CreateDoctorRequest request)
        {
            var specialtyExists = await db.Specialties.AnyAsync(s => s.Id == request.SpecialtyId);
            if (!specialtyExists) return BadRequest(new { message = "Specijalizacija ne postoji." });

            var userTaken = await db.Doctors.AnyAsync(d => d.UserId == request.UserId);
            if (userTaken) return Conflict(new { message = "Doktor vec postojii" });

            var doctor = new Doctor
            {
                UserId = request.UserId,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Biography = request.Biography,
                Title = request.Title,
                SpecialtyId = request.SpecialtyId,
            };

            db.Doctors.Add(doctor);
            await db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = doctor.Id }, await BuildDetails(doctor.Id));
        }



        [Authorize(Roles = "Admin")]
        [HttpPut("{id:guid}")]
        public async Task<ActionResult<DoctorDetailsResponse>> Update(Guid id, UpdateDoctorRequest request)
        {
            var doctor = await db.Doctors.FindAsync(id);
            if (doctor is null) return NotFound();

            var specialtyExists = await db.Specialties.AnyAsync(s => s.Id == request.SpecialtyId);
            if (!specialtyExists) return BadRequest(new { message = "Specijalizacija ne postoji." });

            doctor.FirstName = request.FirstName;
            doctor.LastName = request.LastName;
            doctor.Biography = request.Biography;
            doctor.Title = request.Title;
            doctor.SpecialtyId = request.SpecialtyId;
            await db.SaveChangesAsync();

            return Ok(await BuildDetails(doctor.Id));
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id:guid}/deactivate")]
        public async Task<ActionResult> Deactivate(Guid id)
        {
            var doctor = await db.Doctors.FindAsync(id);
            if (doctor is null) return NotFound();

            doctor.IsActive = false;
            await db.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("{id:guid}/summary")]
        public async Task<ActionResult<DoctorSummaryResponse>> GetSummary(Guid id)
        {
            var doctor = await db.Doctors
                .Where(d => d.Id == id)
                .Select(d => new DoctorSummaryResponse(d.Id, d.UserId, d.SpecialtyId, d.IsActive))
                .FirstOrDefaultAsync();

            return doctor is null ? NotFound() : Ok(doctor);
        }

        [HttpGet("by-user/{userId:guid}")]
        public async Task<ActionResult<DoctorSummaryResponse>> GetByUser(Guid userId)
        {
            var doctor = await db.Doctors
                .Where(d => d.UserId == userId)
                .Select(d => new DoctorSummaryResponse(d.Id, d.UserId, d.SpecialtyId, d.IsActive))
                .FirstOrDefaultAsync();

            return doctor is null ? NotFound() : Ok(doctor);
        }

        private async Task<DoctorDetailsResponse> BuildDetails(Guid id)
        {
            var doctor = await db.Doctors.Include(d => d.Specialty).FirstAsync(d => d.Id == id);

            var types = await db.ExaminationTypes
                .Where(t => t.SpecialtyId == doctor.SpecialtyId && t.IsActive)
                .OrderBy(t => t.Name)
                .Select(t => new ExaminationTypeResponse(
                    t.Id, t.Name, t.Description, t.DurationMinutes, t.Price, t.SpecialtyId))
                .ToListAsync();

            return new DoctorDetailsResponse(
                doctor.Id, doctor.FirstName, doctor.LastName, doctor.Title,
                doctor.Biography, doctor.SpecialtyId, doctor.Specialty.Name, types);
        }
    }
}
