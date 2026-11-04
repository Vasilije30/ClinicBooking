namespace Directory.Api.Dto
{
    public record DoctorDetailsResponse(Guid Id, string FirstName, string LastName, string Title,
    string? Biography, Guid SpecialtyId, string SpecialtyName,
    List<ExaminationTypeResponse> ExaminationTypes);
}
