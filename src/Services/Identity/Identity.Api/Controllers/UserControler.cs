using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Identity.Api.Dto;
using Identity.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace Identity.Api.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize(Roles = "Admin")]
    public class UserControler(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole<Guid>> roleManager) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<List<UserResponse>>> Search([FromQuery] string? email)
        {
            if (string.IsNullOrWhiteSpace(email) || email.Trim().Length < 3)
                return BadRequest("Unesite bar 3 znaka za pretragu.");

            var term = email.Trim().ToLower();

            var users = await userManager.Users
                .Where(u => u.Email!.ToLower().Contains(term))
                .OrderBy(u => u.Email)
                .Take(10)
                .ToListAsync();

            var result = new List<UserResponse>();
            foreach (var user in users)
            {
                var roles = await userManager.GetRolesAsync(user);
                result.Add(new UserResponse(user.Id, user.Email!, user.FirstName, user.LastName, roles.ToList()));
            }

            return Ok(result);
        }

        [HttpPost("{id:guid}/roles")]
        public async Task<IActionResult> AddRole(Guid id, [FromBody] AddRoleRequest request)
        {
            if (!await roleManager.RoleExistsAsync(request.Role))
                return BadRequest($"Uloga '{request.Role}' ne postoji.");

            var user = await userManager.FindByIdAsync(id.ToString());
            if (user is null)
                return NotFound("Korisnik nije pronađen.");

            if (await userManager.IsInRoleAsync(user, request.Role))
                return NoContent();

            if(request.Role == "Doctor" && await userManager.IsInRoleAsync(user, "Patient"))
            {
                var removed = await userManager.RemoveFromRoleAsync(user, "Patient");
                if(!removed.Succeeded)
                {
                    return BadRequest(removed.Errors.Select(e => e.Description));
                }
            }

            var result = await userManager.AddToRoleAsync(user, request.Role);
            if (!result.Succeeded)
                return BadRequest(string.Join("; ", result.Errors.Select(e => e.Description)));

            return NoContent();
        }
    }
}
