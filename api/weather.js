export default async function handler(req, res) {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });

  const params = new URLSearchParams({
    latitude: lat, longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code,apparent_temperature,surface_pressure',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
    hourly: 'temperature_2m,precipitation_probability,weather_code',
    timezone: 'Asia/Kolkata',
    forecast_days: '7',
  });

  try {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!r.ok) throw new Error(`API returned ${r.status}`);
    const data = await r.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
