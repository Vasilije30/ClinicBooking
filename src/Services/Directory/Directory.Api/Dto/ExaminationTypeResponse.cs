namespace Directory.Api.Dto
{
    public record ExaminationTypeResponse(Guid id, string Name, string? Description, int DurationMinutes, decimal Price, Guid SpecialtyId);
}
