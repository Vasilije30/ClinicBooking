using System.Net;

namespace Scheduling.Api.Clients
{
    public record DoctorSummary(Guid Id, Guid UserId, Guid SpecialtyId, bool IsActive);
    public record ExaminationTypeSymmary(Guid Id, string Name, int DurationMinutes, decimal Price, Guid SpecialtyId);
    public class DirectoryClient(HttpClient http)
    {
        public Task<DoctorSummary?> GetDoctorAsync(Guid id) =>
            GetAsync<DoctorSummary>($"api/doctors/{id}/summary");

        public Task<DoctorSummary?> GetDoctorByUserAsync(Guid userId) =>
            GetAsync<DoctorSummary>($"api/doctors/by-user/{userId}");

        public Task<ExaminationTypeSymmary?> GetExaminationTypes(Guid id) =>
            GetAsync<ExaminationTypeSymmary>($"api/examination-types/{id}");

        private async Task<T?> GetAsync<T>(string url)
        {
            var res = await http.GetAsync(url);
            if (res.StatusCode == HttpStatusCode.NotFound) return default;
            res.EnsureSuccessStatusCode();
            return await res.Content.ReadFromJsonAsync<T>();
        }


    }
    
}
