namespace Scheduling.Api.Dto
{
    public class CreateTimeOffRequest
    {
        public Guid? DoctorId { get; set; }
        public DateTime StartAt { get; set; }
        public DateTime EndAt { get; set; }
        public string? reason { get; set; }
    }

    public record TimeOffResponse(Guid Id, Guid DoctorId, DateTime StartAt, DateTime EndAt, string? Reason);
}
