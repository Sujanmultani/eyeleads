/**
 * Sends a WhatsApp message via CallMeBot's free API. This is a personal-use
 * service — it can only message the phone number that authorized it (i.e.
 * the admin's own number), which is exactly what's needed for order alerts.
 * Best-effort — like sendEmail, a failure here should never block the order
 * flow, so errors are logged and swallowed rather than thrown.
 */
export async function sendWhatsApp({ body }) {
  const { CALLMEBOT_PHONE, CALLMEBOT_APIKEY } = process.env;

  if (!CALLMEBOT_PHONE || !CALLMEBOT_APIKEY) {
    console.warn('[WhatsApp] CallMeBot credentials not configured — skipping WhatsApp notification.');
    return;
  }

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(CALLMEBOT_PHONE)}&text=${encodeURIComponent(body)}&apikey=${CALLMEBOT_APIKEY}`;
    const res = await fetch(url);
    const text = await res.text();

    if (!res.ok || text.toLowerCase().includes('error')) {
      console.error('[WhatsApp] CallMeBot send failed:', text);
    }
  } catch (err) {
    console.error('[WhatsApp] Error sending message:', err.message);
    // Never throw — a failed WhatsApp send should never block the order flow.
  }
}
