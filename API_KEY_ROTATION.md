# 🔑 API Key Rotation Schedule — AgriConnect 360

## Active Keys

| Service | Key Name | Rotation Period | Last Rotated | Next Due |
|---------|----------|----------------|-------------|----------|
| Supabase | `VITE_SUPABASE_ANON_KEY` | 6 months | 2026-04-20 | 2026-10-20 |
| Gemini AI | `VITE_GEMINI_API_KEY` | 3 months | 2026-04-20 | 2026-07-20 |
| Groq AI | `VITE_GROQ_API_KEY` | 3 months | 2026-04-20 | 2026-07-20 |
| OpenWeather | `VITE_OPENWEATHER_API_KEY` | 12 months | 2026-04-20 | 2027-04-20 |
| data.gov.in | `VITE_DATA_GOV_API_KEY` | Never (public) | — | — |

## Rotation Procedure

1. **Generate new key** from the service dashboard
2. **Update `.env`** locally with new key
3. **Update Vercel** env vars in dashboard
4. **Test** the app with new key locally
5. **Deploy** to production
6. **Revoke old key** from service dashboard (after 24h grace)

## Security Rules

- ❌ NEVER commit `.env` files to git
- ❌ NEVER share keys in chat/email
- ✅ All keys stored in Vercel environment variables
- ✅ `.gitignore` blocks all `.env*` files
- ✅ Supabase anon key is safe for client (RLS protects data)
- ✅ Service role key ONLY on server-side (Edge Functions)

## Emergency Key Compromise

1. **Immediately** revoke the compromised key
2. Generate a new key
3. Update Vercel env vars
4. Redeploy: `npx vercel --prod`
5. Monitor Supabase logs for unauthorized access
