# AgriConnect 360 — Admin Operations Guide

> For Platform Administrators & System Operators

---

## 1. Accessing the Admin Panel

1. Login with an admin-role account
2. Navigate to `/admin` or click "🛡️ Admin Panel" in the sidebar
3. The Admin section includes 5 tabs:
   - **User Management** — View, filter, verify, and suspend users
   - **Content Moderation** — Review flagged posts, listings, Q&A
   - **Platform Analytics** — User stats, engagement, revenue, feature usage
   - **Configuration** — Feature flags, pricing, commission rates
   - **Support Helpdesk** — Ticket management, broadcast messages

---

## 2. User Management

### Verifying Users
- Unverified users show ❌ in the "Verified" column
- Click **Verify** to mark a user as verified
- Verification is required for: Industrial buyers, Brokers, Suppliers, Labour associations

### Changing User Roles
Update via Supabase Dashboard:
```sql
UPDATE profiles SET role = 'industrial' WHERE id = '<user-id>';
```
Valid roles: `farmer`, `admin`, `fpo`, `industrial`, `broker`, `supplier`, `labour`

### Suspending Accounts
- Click **Suspend** to deactivate a user
- Suspended users cannot login until reactivated
- All active sessions are invalidated

---

## 3. Content Moderation

### Review Queue
- Posts, Q&A answers, and product listings flagged by auto-moderation or user reports
- Actions: **Approve**, **Reject**, **Delete**, **Ban User**

### Auto-Moderation Rules
- Spam detection (URLs, repeated text)
- Profanity filter (Hindi/Telugu/English)
- Misleading price claims (>200% deviation from market)
- Duplicate product listings

---

## 4. Feature Flags

Toggle features on/off without code deployment:

| Flag | Description | Default |
|------|-------------|---------|
| Premium Module | Enable/disable premium features | ON |
| Drone Reports | Enable drone NDVI features | ON |
| WhatsApp Bot | Enable WhatsApp integration | OFF |
| IoT Integration | Enable IoT sensor features | ON |
| F2C Store | Enable farmer-to-consumer store | ON |

---

## 5. Monitoring

### Key Metrics to Watch
- **Daily Active Users (DAU)** — Target: >1000
- **Retention Rate (7-day)** — Target: >60%
- **API Error Rate** — Target: <1%
- **Support Ticket Response Time** — Target: <24h

### System Health
- Check the sidebar footer: "🟢 System Operational"
- Module count auto-updates based on active features

### Database Maintenance
```sql
-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Vacuum for performance
VACUUM ANALYZE;
```

---

## 6. Emergency Procedures

### High API Usage
1. Check rate limiter logs
2. Temporarily increase cache TTL in `performance.js`
3. If abuse detected, suspend offending accounts

### Data Breach Response
1. Immediately disable affected accounts
2. Rotate Supabase anon key in Vercel env vars
3. Notify affected users within 72 hours (DPDP Act requirement)
4. File report with DPA (Data Protection Authority of India)

### Service Outage
1. Check Supabase status: https://status.supabase.com
2. Check Vercel status: https://www.vercelstatus.com
3. Enable offline mode banner for users
4. Service Worker caches allow read-only access during outages

---

*Last Updated: April 23, 2026*
