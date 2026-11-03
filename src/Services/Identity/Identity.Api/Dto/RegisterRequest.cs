namespace Identity.Api.Dto
{
    public record RegisterRequest(string Email, string Password, string FirstName, string LastName);

}
