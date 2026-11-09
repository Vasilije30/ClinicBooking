using Microsoft.EntityFrameworkCore;
using Scheduling.Api.Models;

namespace Scheduling.Api.Data
{
    public class SchedulingDbContext(DbContextOptions<SchedulingDbContext> options) : DbContext(options)
    {
        public DbSet<WorkSchedule> WorkSchedules => Set<WorkSchedule>();
        public DbSet<BreakPeriod> BreakPeriods => Set<BreakPeriod>();
        public DbSet<TimeOff> TimeOffs => Set<TimeOff>();
        public DbSet<Appointment> Appointments => Set<Appointment>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<WorkSchedule>(e =>
            {
                e.HasIndex(x => new { x.DoctorId, x.DayOfWeek }).IsUnique();
                e.HasIndex(x => x.DoctorUserId);

                e.HasMany(x => x.Breaks)
                 .WithOne(b => b.WorkSchedule)
                 .HasForeignKey(b => b.WorkScheduleId)
                 .OnDelete(DeleteBehavior.Cascade);
            });
            modelBuilder.Entity<TimeOff>(e =>
            {
                e.Property(x => x.Reason).HasMaxLength(300);
                e.HasIndex(x => new { x.DoctorId, x.StartAt });
            });

            modelBuilder.Entity<Appointment>(e =>
            {
                e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
                e.Property(x => x.CancelReason).HasMaxLength(300);

                e.HasIndex(x => x.PatientId);
                e.HasIndex(x => new { x.DoctorId, x.StartAt })
                 .IsUnique()
                 .HasFilter("\"Status\" = 'Booked'");
            });
        }
    }
}
