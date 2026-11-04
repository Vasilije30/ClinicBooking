using Directory.Api.Data;
using Directory.Api.Dto;
using Directory.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Directory.Api.Controllers
{
    [ApiController]
    [Route("api/examination-types")]

    public class ExaminationTypeController(DirectoryDbContext db) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<List<ExaminationTypeResponse>>> GetAll([FromQuery] Guid? specialtyId)
        {
            var query = db.ExaminationTypes.Where(t => t.IsActive);

            if (specialtyId.HasValue)
            {
                query = query.Where(t => t.SpecialtyId == specialtyId.Value);
            }

            var items = await query.OrderBy(t => t.Name).Select(t => new ExaminationTypeResponse(t.Id, t.Name, t.Description, t.DurationMinutes, t.Price, t.SpecialtyId)).ToListAsync();

            return Ok(items);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ExaminationTypeResponse>> GetById(Guid id)
        {
            var t = await db.ExaminationTypes.FindAsync(id);
            if (t is null || !t.IsActive) return NotFound();

            return Ok(ToResponse(t));
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<ExaminationTypeResponse>> Create(CreateExaminationTypeRequest request)
        {
            var specialtyExists = await db.Specialties.AnyAsync(s => s.Id == request.SpecialtyId);
            if (!specialtyExists) return BadRequest(new { message = "Specijalnost ne postoji." });

            var type = new ExaminationType
            {
                Name = request.Name,
                Description = request.Description,
                DurationMinutes = request.DurationMinutes,
                Price = request.Price,
                SpecialtyId = request.SpecialtyId
            };
            db.ExaminationTypes.Add(type);
            await db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = type.Id }, ToResponse(type));
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:guid}")]
        public async Task<ActionResult<ExaminationTypeResponse>> Update(Guid Id, CreateExaminationTypeRequest request)
        {
            var type = await db.ExaminationTypes.FindAsync(Id);
            if (type is null) return NotFound();

            var specialtyExists = await db.Specialties.AnyAsync(s => s.Id == request.SpecialtyId);
            if (!specialtyExists) return BadRequest(new { message = "Navedena specijalizacija ne postoji." });

            type.Name = request.Name;
            type.Description = request.Description;
            type.DurationMinutes = request.DurationMinutes;
            type.Price = request.Price;
            type.SpecialtyId = request.SpecialtyId;

            await db.SaveChangesAsync();

            return Ok(ToResponse(type));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Deactivate(Guid id)
        {
            var type = await db.ExaminationTypes.FindAsync(id);
            if (type is null) return NotFound();

            type.IsActive = false;

            await db.SaveChangesAsync();
            return Ok(ToResponse(type));
        }


        private static ExaminationTypeResponse ToResponse(ExaminationType t) =>
        new(t.Id, t.Name, t.Description, t.DurationMinutes, t.Price, t.SpecialtyId);
    }
}
