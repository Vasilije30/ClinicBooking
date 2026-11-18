namespace Identity.Api.Dto
{
    public record UserResponse(Guid id, string Email, string FirstName, string LastName, List<string> Roles);

    public class AddRoleRequest
    {
        public string Role { get; set; } = string.Empty;
    }
}
