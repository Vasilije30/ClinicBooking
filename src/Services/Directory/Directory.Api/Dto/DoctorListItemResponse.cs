namespace Directory.Api.Dto
{
    public record DoctorListItemResponse(Guid Id, string FirstName, string LastName, string Title, Guid SpecialtyId, string SpecialtyName);
}
