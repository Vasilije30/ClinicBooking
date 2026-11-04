namespace Directory.Api.Models
{
    public class Specialty
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        public List<Doctor> Doctors { get; set; } = [];
        public List<ExaminationType> ExaminationTypes { get; set; } = [];
    }
}