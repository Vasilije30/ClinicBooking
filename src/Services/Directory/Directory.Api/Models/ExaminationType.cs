namespace Directory.Api.Models
{
    public class ExaminationType
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DurationMinutes { get; set; }
        public decimal Price { get; set; }
        public bool IsActive { get; set; } = true;

        public Guid SpecialtyId { get; set; }
        public Specialty Specialty { get; set; } = null!;
    }
}
