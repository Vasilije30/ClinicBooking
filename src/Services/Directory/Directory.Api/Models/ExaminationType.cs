namespace Directory.Api.Models
{
    public class ExaminationType
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Desctiption { get; set; }
        public int DurationMinutes { get; set; }
        public decimal Price { get; set; }
        public bool IsActive { get; set; } = true;

        public Guid SpecilatyId { get; set; }
        public Specialty Specialty { get; set; } = null!;
    }
}
