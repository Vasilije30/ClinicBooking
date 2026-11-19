using System;
using System.Collections.Generic;
using System.Text;

namespace Contracts
{
    public record AppointmentBooked(Guid AppointmentId, Guid DoctorId, string PatientEmail, string ExaminationTypeName, DateTime StartAt, DateTime EndAt);
}
