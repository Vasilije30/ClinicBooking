namespace Scheduling.Api.Models
{
    public class TimeOff
    {
        public Guid Id { get; set; }
        public Guid DoctorId { get; set; }
        public Guid DoctorUserId { get; set; }
        public DateTime StartAt { get; set; } //utc
        public DateTime EndAt { get; set; }
        public string? Reason { get; set; }

    }
}
