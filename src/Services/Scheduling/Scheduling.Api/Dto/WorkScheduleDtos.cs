namespace Scheduling.Api.Dto
{
    public record BreakDto(TimeOnly StartTime, TimeOnly EndTime);

    public class SaveWorkScheduleRequest
    {
        public Guid? DoctorId { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public List<BreakDto> Breaks { get; set; } = [];
    }
    public record WorkScheduleResponse(
        Guid Id,
        Guid DoctorId,
        DayOfWeek DayOfWeek,
        TimeOnly StartTime,
        TimeOnly EndTime,
        List<BreakDto> Breaks);
}
