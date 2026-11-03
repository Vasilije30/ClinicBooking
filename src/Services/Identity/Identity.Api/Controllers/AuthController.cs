using Identity.Api.Dto;
using Identity.Api.Models;
using Identity.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Identity.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController(UserManager<ApplicationUser> userManager, ITokenService tokenService) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            var user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
            };

            var result = await userManager.CreateAsync(user, request.Password);
            if(!result.Succeeded)
            {
                return BadRequest(result.Errors.Select(e => e.Description));
            }
            await userManager.AddToRoleAsync(user, "Patient");
            return Ok(new {user.Id, user.Email});
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var user = await userManager.FindByEmailAsync(request.Email);
            if (user is null || !await userManager.CheckPasswordAsync(user, request.Password))
                return Unauthorized(new { message = "Pogresan email ili lozinka." });

            var roles = await userManager.GetRolesAsync(user);
            var token = tokenService.CreateToken(user, roles);

            return Ok(new {token});
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            return Ok(User.Claims.Select(c => new { c.Type, c.Value }));
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin-only")]
        public IActionResult AdminOnly()
        {
            return Ok("Samo admin vidi ovo.");
        }
    }
}
