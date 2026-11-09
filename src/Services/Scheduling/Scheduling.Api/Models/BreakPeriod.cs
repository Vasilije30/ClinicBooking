namespace Scheduling.Api.Models
{
    public class BreakPeriod
    {
        public Guid Id { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly TimeOnly { get; set; }

        public Guid WorkScheduleId { get; set; }
        public WorkSchedule WorkSchedule { get; set; } = null!;
    }
}
