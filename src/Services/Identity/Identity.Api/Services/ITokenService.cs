using Identity.Api.Models;

namespace Identity.Api.Services
{
    public interface ITokenService
    {
        string CreateToken(ApplicationUser user, IList<string> roles);
    }
}
