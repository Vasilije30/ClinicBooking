namespace Scheduling.Api.Models
{
    public class WorkSchedule
    {
        public Guid Id { get; set; }
        public Guid DoctorId { get; set; } // id profila za directory
        public Guid DoctorUserId { get; set; } // id naloga iz tokena (sub)
        public DayOfWeek DayOfWeek { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }

        public List<BreakPeriod> Breaks { get; set; } = [];
    }
}
