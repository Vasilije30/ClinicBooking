using System.ComponentModel.DataAnnotations;

namespace Directory.Api.Dto
{
    public class CreateDoctorRequest
    {
        [Required]
        public Guid UserId { get; set; }

        [Required, MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required, MaxLength(10)]
        public string Title {  get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Biography { get; set; }

        [Required]
        public Guid SpecialtyId { get; set; }
    }
}
