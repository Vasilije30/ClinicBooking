using Microsoft.AspNetCore.Identity;

namespace Identity.Api.Data
{
    public class RoleSeeder
    {
        private static readonly string[] Roles = ["Patient", "Doctor", "Receptionist", "Admin"];
        public static async Task SeedAsync(IServiceProvider services)
        {
            var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();

            foreach(var role in Roles)
            {
                if(!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole<Guid>(role));
                }
            }
        }
    }
}
