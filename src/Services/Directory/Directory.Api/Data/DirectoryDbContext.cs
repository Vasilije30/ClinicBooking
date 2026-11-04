using Directory.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Directory.Api.Data
{
    public class DirectoryDbContext(DbContextOptions<DirectoryDbContext> options) : DbContext(options)
    {
        public DbSet<Specialty> Specialties => Set<Specialty>();
        public DbSet<Doctor> Doctors => Set<Doctor>();
        public DbSet<ExaminationType> ExaminationTypes => Set<ExaminationType>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Specialty>(e =>
            {
                e.Property(x => x.Name).IsRequired().HasMaxLength(100);
                e.Property(x => x.Description).HasMaxLength(500);
                e.HasIndex(x => x.Name).IsUnique();
            });

            modelBuilder.Entity<Doctor>(e =>
            {
                e.Property(x => x.FirstName).IsRequired().HasMaxLength(100);
                e.Property(x => x.LastName).IsRequired().HasMaxLength(100);
                e.Property(x => x.Title).HasMaxLength(50);
                e.Property(x => x.Biography).HasMaxLength(2000);
                e.HasIndex(x => x.UserId).IsUnique();

                e.HasOne(x => x.Specialty)
                    .WithMany(s => s.Doctors)
                    .HasForeignKey(x => x.SpeciltyId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ExaminationType>(e =>
            {
                e.Property(x => x.Name).IsRequired().HasMaxLength(150);
                e.Property(x => x.Description).HasMaxLength(500);
                e.Property(x => x.Price).HasPrecision(10, 2);

                e.HasOne(x => x.Specialty)
                    .WithMany(s => s.ExaminationTypes)
                    .HasForeignKey(x => x.SpecialtyId)
                .OnDelete(DeleteBehavior.Restrict);
            });
        }

    }
}
