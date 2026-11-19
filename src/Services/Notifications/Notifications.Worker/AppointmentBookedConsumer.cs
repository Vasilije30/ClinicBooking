using System;
using System.Collections.Generic;
using System.Text;
using Contracts;
using MassTransit;

namespace Notifications.Worker
{
    
    public class AppointmentBookedConsumer(EmailSender email, IConfiguration config, ILogger<AppointmentBookedConsumer> logger) : IConsumer<AppointmentBooked>
    {
        public async Task Consume(ConsumeContext<AppointmentBooked> context)
        {
            var m = context.Message;
            if (string.IsNullOrWhiteSpace(m.PatientEmail))
            {
                logger.LogWarning("Termin {Id} nema pacijenta, preskacem.", m.AppointmentId);
            }

            var zone = TimeZoneInfo.FindSystemTimeZoneById(config["TimeZone"]!);
            var start = TimeZoneInfo.ConvertTimeFromUtc(m.StartAt, zone);

            await email.SendAsync(
                m.PatientEmail,
                "Termin je zakazan",
                $"Vas termin ({m.ExaminationTypeName}) je zakazan za {start:dd.MM.yyyy} u {start:HH:mm}.");

            logger.LogInformation("Poslat email za termin {Id}", m.AppointmentId);
        }
    }
}
