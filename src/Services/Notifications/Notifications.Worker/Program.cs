using Notifications.Worker;
using MassTransit;
using Notifications.Worker;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<AppointmentBookedConsumer>();
    x.AddConsumer<AppointmentCancelledConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration["RabbitMq:Host"], "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
        });

        cfg.ConfigureEndpoints(context);
    });
});
builder.Services.AddSingleton<EmailSender>();
var host = builder.Build();
host.Run();
