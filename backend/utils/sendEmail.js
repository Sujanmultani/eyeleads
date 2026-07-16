import https from 'https';

/**
 * Sends an email using the Resend API.
 * Uses RESEND_API_KEY and RESEND_FROM_EMAIL from the environment.
 */
export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'EyeLeads Optics <onboarding@resend.dev>';

  if (!apiKey) {
    console.warn('[Email Warning] RESEND_API_KEY is not configured in environment variables.');
    return { success: false, message: 'RESEND_API_KEY missing' };
  }

  const payload = {
    from: fromEmail,
    to: [to],
    subject: subject,
    html: html
  };

  return new Promise((resolve) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true });
        } else {
          console.warn(`[Resend Email Error] Status ${res.statusCode}: ${body}`);
          resolve({ success: false, error: body });
        }
      });
    });

    req.on('error', (error) => {
      console.warn('[Resend Email Error] Request failed:', error.message);
      resolve({ success: false, error: error.message });
    });

    req.write(data);
    req.end();
  });
}
