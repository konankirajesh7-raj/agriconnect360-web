export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = process.env.ALLOWED_ORIGIN || 'https://agriconnect360.vercel.app';
  res.setHeader('Access-Control-Allow-Origin', allowed);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, message } = req.body || {};

  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ success: false, error: 'Invalid Indian mobile number' });
  }

  // NOTE: OTP delivery is handled by Supabase Auth (Twilio integration).
  // This endpoint is a fallback for custom SMS only.
  const API_KEY = process.env.FAST2SMS_API_KEY;
  if (!API_KEY) {
    return res.status(503).json({ success: false, error: 'Fallback SMS not configured — use Supabase OTP' });
  }

  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: { 'authorization': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        route: 'q',
        message: message || 'Your RythuSphere OTP is ready.',
        language: 'english',
        flash: 0,
        numbers: phone,
      }),
    });

    const data = await response.json();

    if (data.return === true) {
      return res.status(200).json({ success: true, request_id: data.request_id });
    } else {
      return res.status(200).json({ success: false, error: data.message || 'SMS failed' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
