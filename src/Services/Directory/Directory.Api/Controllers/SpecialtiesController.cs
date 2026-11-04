using Directory.Api.Data;
using Directory.Api.Dto;
using Directory.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace Directory.Api.Controllers
{
    [ApiController]
    [Route("api/specialties")]
    public class SpecialtiesController(DirectoryDbContext db) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<List<SpecialtyResponse>>> GetAll()
        {
            var items = await db.Specialties
                .OrderBy(s => s.Name)
                .Select(s => new SpecialtyResponse(s.Id, s.Name, s.Description))
                .ToListAsync();

            return Ok(items);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<SpecialtyResponse>> GetById(Guid id)
        {
            var s = await db.Specialties.FindAsync(id);
            if(s is null)
            {
                return NotFound();
            }
            return Ok(new SpecialtyResponse(s.Id, s.Name, s.Description));
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<SpecialtyResponse>> Create(CreateSpecialtyRequest request)
        {
            var exists = await db.Specialties.AnyAsync(s => s.Name == request.Name);
            if(exists)
            {
                return Conflict(new { message = "Specijalnost sa tim nazivom vec postoji." });
            }
            
            var specialty = new Specialty
            {
                Name = request.Name,
                Description = request.Description
            };
            db.Specialties.Add(specialty);
            await db.SaveChangesAsync();

            var response = new SpecialtyResponse(specialty.Id, specialty.Name, specialty.Description);
            return CreatedAtAction(nameof(GetById), new { id = specialty.Id }, response);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:guid}")]
        public async Task<ActionResult<SpecialtyResponse>> Update(Guid id, CreateSpecialtyRequest request)
        {
            var specialty = await db.Specialties.FindAsync(id);
            if (specialty == null) return NotFound();

            var nameTaken = await db.Specialties.AnyAsync(d =>  d.Name == request.Name && d.Id != id);
            if (nameTaken) return Conflict(new { message = "Specijalnost sa tim nazivom vec postoji." });
            
            specialty.Name = request.Name;
            specialty.Description = request.Description;
            await db.SaveChangesAsync();

            return Ok(new SpecialtyResponse(specialty.Id, specialty.Name, specialty.Description));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:guid}")]
        public async Task<ActionResult<SpecialtyResponse>> Delete(Guid id)
        {
            var specialty = await db.Specialties.FindAsync(id);
            if(specialty is null) return NotFound();

            var inUse = await db.Doctors.AnyAsync(d => d.SpeciltyId == id)
                    || await db.ExaminationTypes.AnyAsync(t => t.SpecilatyId == id);

            if (inUse)
                return Conflict(new { message = "Specijalnost se koristi i ne moze biti obrisana." });

            db.Specialties.Remove(specialty);
            await db.SaveChangesAsync();

            return NoContent();
        }
    }
}
