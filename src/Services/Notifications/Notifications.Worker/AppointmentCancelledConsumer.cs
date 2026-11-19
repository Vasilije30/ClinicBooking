using System;
using System.Collections.Generic;
using System.Text;
using MassTransit;
using Contracts;

namespace Notifications.Worker
{
    public class AppointmentCancelledConsumer(EmailSender email, IConfiguration config, ILogger<AppointmentCancelled> logger) : IConsumer<AppointmentCancelled>
    {
        public async Task Consume(ConsumeContext<AppointmentCancelled> context)
        {
            var m = context.Message;
            if (string.IsNullOrWhiteSpace(m.PatientEmail))
            {
                logger.LogWarning("Termin {Id} nema email pacijenta, preskacem.", m.AppointmentId);
                return;
            }

            var zone = TimeZoneInfo.FindSystemTimeZoneById(config["TimeZone"]!);
            var start = TimeZoneInfo.ConvertTimeFromUtc(m.StartAt, zone);

            var who = m.CancelledByPatient ? "Otkazali ste" : "Ordinacija je otkazala";
            var reason = string.IsNullOrWhiteSpace(m.Reason) ? "" : $"Razlog: {m.Reason}";

            await email.SendAsync(m.PatientEmail, "Termin je otkazan", $"{who} termin zakazan za: {start:dd.MM.yyyy.} u {start:HH:mm}. {reason}");

            logger.LogInformation("Poslat email o otkazivanju za termin {Id}", m.AppointmentId);
        }
    }
}
