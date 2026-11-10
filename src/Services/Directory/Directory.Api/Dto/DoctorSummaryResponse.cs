namespace Directory.Api.Dto
{
    public record DoctorSummaryResponse(Guid Id, Guid UserId, Guid SpecialtyId, bool IsActive);
}
