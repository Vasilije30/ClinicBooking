using MailKit.Net.Smtp;
using MailKit.Security;
using MailKit;
using System;
using System.Collections.Generic;
using System.Text;
using MimeKit;

namespace Notifications.Worker;

public class EmailSender(IConfiguration config)
{
    public async Task SendAsync(string to, string subject, string body)
    {
        var message = new MimeMessage();
        message.From.Add(MailboxAddress.Parse(config["Email:From"]!));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new TextPart("plain") { Text = body };

        using var client = new SmtpClient();
        await client.ConnectAsync(config["Email:Host"]!, int.Parse(config["Email:Port"]!), SecureSocketOptions.None);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
        
    }
}
