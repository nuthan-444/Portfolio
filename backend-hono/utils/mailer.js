/**
 * Sends a contact notification email.
 *
 * On Cloudflare Workers, nodemailer (which uses Node.js net/tls) is NOT
 * supported natively. This implementation uses the Fetch API to call the
 * SMTP2GO HTTP API as a compatible alternative.
 *
 * To use this:
 *  1. Sign up at https://www.smtp2go.com (free tier: 1,000 emails/month)
 *  2. Add your SMTP2GO_API_KEY as a Cloudflare Worker secret:
 *       wrangler secret put SMTP2GO_API_KEY
 *  3. Set ADMIN_EMAIL and SMTP_FROM_EMAIL in wrangler.toml [vars]
 *
 * If SMTP2GO_API_KEY is not set, the email is logged to console (dev mode).
 */
export const sendContactNotificationEmail = async (
  { name, email, message, createdAt },
  env = {}
) => {
  const adminEmail = env.ADMIN_EMAIL || 'steve@portfolio.dev';
  const fromEmail = env.SMTP_FROM_EMAIL || env.SMTP_USER || 'noreply@portfolio.dev';
  const apiKey = env.SMTP2GO_API_KEY;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #09090b; color: #f4f4f5; padding: 24px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #27272a;">
      <h2 style="color: #ffffff; margin-top: 0; font-size: 24px; border-bottom: 2px solid #3f3f46; padding-bottom: 12px;">
         New Portfolio Message Received!
      </h2>
      <p style="color: #a1a1aa; font-size: 14px;">Someone left a message on your Portfolio website.</p>
      
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

  // No API key — log and return (dev / fallback mode)
  if (!apiKey) {
    console.log(
      `[Mailer Simulated] To: ${adminEmail} | From: ${email} (${name}): "${message.slice(0, 50)}..."`
    );
    return true;
  }

  try {
    const res = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        to: [adminEmail],
        sender: `"Nuthan's Portfolio" <${fromEmail}>`,
        reply_to_address: email,
        subject: `📬 Portfolio Contact: Message from ${name}`,
        html_body: htmlContent,
      }),
    });

    const data = await res.json();
    if (data.data?.succeeded) {
      console.log(`[Mailer] Contact email sent to ${adminEmail}`);
      return true;
    } else {
      console.error('[Mailer] SMTP2GO error:', JSON.stringify(data));
      return false;
    }
  } catch (error) {
    console.error('[Mailer Error]', error.message);
    return false;
  }
};
