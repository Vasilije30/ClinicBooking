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
    public class SlotController(DirectoryClient directory, SlotService slotService) : ControllerBase
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
            var slots = await slotService.GetSlotsAsync(doctorId, date, type.DurationMinutes);

            return Ok(slots);
        }
    }
}
