using System.ComponentModel.DataAnnotations;

namespace Directory.Api.Dto
{
    public class CreateSpecialtyRequest
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description {  get; set; }
    }
}
