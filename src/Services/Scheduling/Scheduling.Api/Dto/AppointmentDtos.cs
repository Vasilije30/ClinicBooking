namespace Scheduling.Api.Dto
{
    public class CreateAppointmentRequest
    {
        public Guid DoctorId { get; set; }
        public Guid ExaminationTypeId { get; set; }
        public DateTime StartAt { get; set; }
    }

    public record AppointmentResponse(Guid Id, Guid DoctorId, Guid PatientId, Guid ExaminationTypeId, DateTime StartAt, DateTime EndAt, string status, string? CancelReason);
}
