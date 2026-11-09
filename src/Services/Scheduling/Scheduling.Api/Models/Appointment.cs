namespace Scheduling.Api.Models
{
    public class Appointment
    {
        public Guid Id { get; set; }
        public Guid DoctorId { get; set; }
        public Guid DoctorUserId { get; set; }
        public Guid PatientId { get; set; }
        public Guid ExaminationTypeId { get; set; }
        public DateTime StartAt { get; set; }
        public DateTime EndAt { get; set; }
        public AppointmentStatus Status { get; set; } = AppointmentStatus.Booked;
        public string? CancelReason { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }
}
