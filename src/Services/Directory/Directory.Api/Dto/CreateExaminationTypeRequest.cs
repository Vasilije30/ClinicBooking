using System.ComponentModel.DataAnnotations;

namespace Directory.Api.Dto
{
    public class CreateExaminationTypeRequest
    {
        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;
        [MaxLength(500)]
        public string? Description { get; set; }
        [Range(5, 480)]
        public int DurationMinutes { get; set; }
        [Range(0, 100000)]
        public decimal Price { get; set; }
        [Required]
        public Guid SpecialtyId { get; set; }
    }
}
