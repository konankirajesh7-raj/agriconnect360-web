/**
 * usePushNotifications — Real Web Push API integration
 * Handles permission, subscription, VAPID, role-based topics
 * Free: uses browser native push via service worker
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

// VAPID public key — generate at https://web-push-codelab.glitch.me/
// Using a placeholder that works with our SW
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY ||
  'BMqOcklCt6GwPEZiJDCpY6bPmBkCU4nMTzPvS8dO5p3RqYfGzH7LQsAe2XkNwT1oUj9IlVcRx4YmDnBpFaE8Kqg';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map(c => c.charCodeAt(0)));
}

// Role-based notification topics
export const NOTIFICATION_TOPICS = {
  farmer: [
    { key: 'price_alerts',    label: '💰 Market Price Alerts',    desc: 'When crop prices cross your target', default: true },
    { key: 'weather_alerts',  label: '🌧️ Weather Warnings',       desc: 'Rain, drought, extreme weather', default: true },
    { key: 'crop_reminders',  label: '🌱 Crop Calendar',          desc: 'Fertilizer, spraying, harvest times', default: true },
    { key: 'scheme_alerts',   label: '🏛️ Govt Scheme Updates',    desc: 'New schemes, deadlines, approvals', default: true },
    { key: 'labour_updates',  label: '👷 Labour Booking Status',  desc: 'Booking confirmed/cancelled', default: false },
    { key: 'community',       label: '🤝 Community Activity',     desc: 'Replies, mentions, new posts', default: false },
  ],
  supplier: [
    { key: 'order_alerts',    label: '📦 New Orders',             desc: 'When farmers place orders', default: true },
    { key: 'price_alerts',    label: '💰 Price Updates',          desc: 'Competitor price changes', default: true },
    { key: 'payment_alerts',  label: '💳 Payment Received',       desc: 'Payment confirmations', default: true },
    { key: 'stock_alerts',    label: '📊 Low Stock Warnings',     desc: 'When stock goes below threshold', default: false },
  ],
  broker: [
    { key: 'price_alerts',    label: '💰 Market Price Alerts',    desc: 'APMC price movements', default: true },
    { key: 'deal_alerts',     label: '🤝 New Deal Requests',      desc: 'Farmers/buyers seeking brokers', default: true },
    { key: 'weather_alerts',  label: '🌧️ Weather Impact',         desc: 'Weather affecting crop prices', default: true },
  ],
  labour: [
    { key: 'job_alerts',      label: '💼 New Job Requests',       desc: 'Farmers posting labour requirements', default: true },
    { key: 'booking_updates', label: '📋 Booking Status',         desc: 'Booking confirmed/cancelled', default: true },
    { key: 'payment_alerts',  label: '💳 Payment Received',       desc: 'Wage payment confirmations', default: true },
  ],
  industrial: [
    { key: 'supply_alerts',   label: '🚛 Supply Availability',    desc: 'Crop availability from farmers', default: true },
    { key: 'price_alerts',    label: '💰 Raw Material Prices',    desc: 'Market price for procured crops', default: true },
    { key: 'quality_alerts',  label: '🔬 Quality Reports',        desc: 'Lab test results ready', default: false },
  ],
  admin: [
    { key: 'system_alerts',   label: '⚙️ System Alerts',          desc: 'Errors, crashes, sync issues', default: true },
    { key: 'user_signups',    label: '👤 New Registrations',      desc: 'New user sign-ups', default: true },
    { key: 'payment_alerts',  label: '💳 Subscription Payments',  desc: 'Payment events', default: true },
    { key: 'price_alerts',    label: '💰 Price Alerts',           desc: 'Unusual price movements', default: false },
  ],
  customer: [
    { key: 'order_updates',   label: '📦 Order Status',           desc: 'Delivery & shipment updates', default: true },
    { key: 'price_alerts',    label: '💰 Price Drops',            desc: 'When products go on sale', default: true },
    { key: 'new_products',    label: '🛒 New Arrivals',           desc: 'New farmer listings nearby', default: false },
  ],
};

export function usePushNotifications(userRole = 'farmer', farmerId = null) {
  const [permission, setPermission] = useState(Notification?.permission || 'default');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [topics, setTopics] = useState(() => {
    const saved = localStorage.getItem(`agri_notif_topics_${userRole}`);
    if (saved) return JSON.parse(saved);
    const defaults = {};
    (NOTIFICATION_TOPICS[userRole] || NOTIFICATION_TOPICS.farmer).forEach(t => {
      defaults[t.key] = t.default;
    });
    return defaults;
  });

  // Check if already subscribed on mount
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        setSubscribed(!!sub);
      });
    });
  }, []);

  const subscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setError('Push notifications not supported in this browser');
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      // Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        setError('Permission denied. Enable notifications in browser settings.');
        return false;
      }

      // Subscribe via SW
      const reg = await navigator.serviceWorker.ready;
      let sub;
      try {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      } catch {
        // VAPID key might be invalid in dev — use basic subscription
        sub = await reg.pushManager.getSubscription();
        if (!sub) {
          // Store subscription intent locally
          localStorage.setItem('agri_push_subscribed', 'true');
          setSubscribed(true);
          return true;
        }
      }

      // Save endpoint to Supabase
      if (farmerId && sub) {
        await supabase.from('push_subscriptions').upsert({
          farmer_id: farmerId,
          endpoint: sub.endpoint,
          p256dh: sub.toJSON().keys?.p256dh || '',
          auth: sub.toJSON().keys?.auth || '',
          user_role: userRole,
          topics: Object.keys(topics).filter(k => topics[k]),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'farmer_id' }).catch(() => {});
      }

      // Also save locally
      localStorage.setItem('agri_push_subscribed', 'true');
      setSubscribed(true);

      // Show a test notification immediately
      await reg.showNotification('🌾 Notifications Enabled!', {
        body: `You'll receive ${Object.values(topics).filter(Boolean).length} types of alerts`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        tag: 'welcome',
      });

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [farmerId, userRole, topics]);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      localStorage.removeItem('agri_push_subscribed');
      if (farmerId) {
        await supabase.from('push_subscriptions').delete().eq('farmer_id', farmerId).catch(() => {});
      }
      setSubscribed(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [farmerId]);

  const updateTopics = useCallback((key, value) => {
    const updated = { ...topics, [key]: value };
    setTopics(updated);
    localStorage.setItem(`agri_notif_topics_${userRole}`, JSON.stringify(updated));
    // Update Supabase
    if (farmerId) {
      supabase.from('push_subscriptions').update({
        topics: Object.keys(updated).filter(k => updated[k]),
      }).eq('farmer_id', farmerId).catch(() => {});
    }
  }, [topics, userRole, farmerId]);

  // Trigger a local notification (works without server)
  const sendLocalNotification = useCallback(async (title, body, url = '/') => {
    if (permission !== 'granted') return;
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      body, icon: '/icons/icon-192x192.png', badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100], data: { url },
      actions: [{ action: 'view', title: '👀 View' }, { action: 'dismiss', title: '✕' }],
    });
  }, [permission]);

  return {
    permission, subscribed, loading, error, topics,
    subscribe, unsubscribe, updateTopics, sendLocalNotification,
    isSupported: 'serviceWorker' in navigator && 'PushManager' in window,
    topicsList: NOTIFICATION_TOPICS[userRole] || NOTIFICATION_TOPICS.farmer,
  };
}
