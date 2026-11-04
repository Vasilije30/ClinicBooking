namespace Directory.Api.Models
{
    public class Doctor
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Biography { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


        public Guid SpeciltyId { get; set; }
        public Specialty Specialty { get; set; } = null!;
    }
}
