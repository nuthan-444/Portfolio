import nodemailer from 'nodemailer';

export const sendContactNotificationEmail = async ({ name, email, message, createdAt }) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'steve@portfolio.dev';

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #09090b; color: #f4f4f5; padding: 24px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #27272a;">
      <h2 style="color: #ffffff; margin-top: 0; font-size: 24px; border-bottom: 2px solid #3f3f46; padding-bottom: 12px;">
         New Portfolio Message Received!
      </h2>
      <p style="color: #a1a1aa; font-size: 14px;">Someone left a message on your Steve's AI/ML Portfolio website.</p>
      
      <div style="background-color: #18181b; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffffff;">
        <p style="margin: 6px 0;"><strong>Name:</strong> <span style="color: #ffffff;">${name}</span></p>
        <p style="margin: 6px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #60a5fa; text-decoration: none;">${email}</a></p>
        <p style="margin: 6px 0;"><strong>Sent At:</strong> <span style="color: #a1a1aa;">${new Date(createdAt).toLocaleString()}</span></p>
      </div>

      <div style="background-color: #09090b; padding: 16px; border-radius: 8px; border: 1px solid #27272a;">
        <h4 style="margin: 0 0 8px 0; color: #e4e4e7;">Message Content:</h4>
        <p style="margin: 0; color: #d4d4d8; line-height: 1.6; white-space: pre-wrap;">${message}</p>
      </div>

      <div style="margin-top: 24px; text-align: center;">
        <a href="mailto:${email}?subject=Re:%20Portfolio%20Inquiry" style="display: inline-block; background-color: #ffffff; color: #000000; font-weight: 600; padding: 10px 20px; border-radius: 6px; text-decoration: none;">
          Reply to ${name}
        </a>
      </div>
    </div>
  `;

  try {
    if (!process.env.SMTP_USER || process.env.SMTP_USER.includes('gmail.com') && !process.env.SMTP_PASS) {
      console.log(`[Mailer Notification Simulated] To: ${adminEmail} | From: ${email} (${name}): "${message.slice(0, 50)}..."`);
      return true;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Steve's Portfolio" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      replyTo: email,
      subject: `📬 Portfolio Contact: Message from ${name}`,
      html: htmlContent,
    });

    console.log(`[Mailer] Contact notification email successfully dispatched to ${adminEmail}`);
    return true;
  } catch (error) {
    console.error('[Mailer Error] Failed to dispatch email:', error.message);
    // Still resolve so form submission doesn't fail for visitor
    return false;
  }
};
