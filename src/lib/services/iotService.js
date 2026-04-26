/**
 * AgriConnect 360 — IoT Integration Service (Phase 14C)
 * Manages sensor data, smart irrigation, weather stations, field cameras, and drone NDVI
 */

/** 14C.1 — Soil Moisture Sensor Integration */
export class SoilMoistureSensor {
  constructor(sensorId, fieldId) {
    this.sensorId = sensorId;
    this.fieldId = fieldId;
    this.readings = [];
    this.threshold = { low: 30, optimal: 50, high: 80 };
  }

  addReading(moisture, temperature, timestamp = new Date().toISOString()) {
    this.readings.push({ moisture, temperature, timestamp });
    if (this.readings.length > 1000) this.readings.shift();
    return this.getStatus(moisture);
  }

  getStatus(moisture) {
    if (moisture < this.threshold.low) return { status: 'dry', action: 'Irrigate immediately', color: '#ef4444', icon: '🔴' };
    if (moisture < this.threshold.optimal) return { status: 'moderate', action: 'Schedule irrigation within 24h', color: '#fbbf24', icon: '🟡' };
    if (moisture <= this.threshold.high) return { status: 'optimal', action: 'No irrigation needed', color: '#34d399', icon: '🟢' };
    return { status: 'waterlogged', action: 'Stop irrigation, check drainage', color: '#3b82f6', icon: '🔵' };
  }

  getAverageReading(hours = 24) {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    const recent = this.readings.filter(r => new Date(r.timestamp).getTime() > cutoff);
    if (!recent.length) return null;
    return { moisture: Math.round(recent.reduce((s, r) => s + r.moisture, 0) / recent.length), temperature: Math.round(recent.reduce((s, r) => s + r.temperature, 0) / recent.length * 10) / 10, count: recent.length };
  }

  getHistory(days = 7) {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return this.readings.filter(r => new Date(r.timestamp).getTime() > cutoff);
  }
}

/** 14C.2 — Weather Station API Integration */
export class WeatherStation {
  constructor(stationId, location) {
    this.stationId = stationId;
    this.location = location;
    this.currentData = null;
    this.historicalData = [];
  }

  async fetchCurrentWeather(lat, lon) {
    const apiKey = import.meta.env.VITE_OPENWEATHER_KEY || '';
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
      const data = await res.json();
      this.currentData = {
        temperature: data.main?.temp,
        humidity: data.main?.humidity,
        pressure: data.main?.pressure,
        windSpeed: data.wind?.speed,
        windDirection: data.wind?.deg,
        rainfall: data.rain?.['1h'] || 0,
        description: data.weather?.[0]?.description,
        icon: data.weather?.[0]?.icon,
        timestamp: new Date().toISOString(),
      };
      this.historicalData.push(this.currentData);
      return this.currentData;
    } catch (e) {
      console.warn('Weather station fetch failed:', e.message);
      return this.currentData;
    }
  }

  getAlerts() {
    if (!this.currentData) return [];
    const alerts = [];
    if (this.currentData.temperature > 42) alerts.push({ type: 'heat', severity: 'critical', message: 'Extreme heat — protect crops & livestock' });
    if (this.currentData.temperature < 5) alerts.push({ type: 'frost', severity: 'critical', message: 'Frost risk — cover sensitive crops' });
    if (this.currentData.rainfall > 50) alerts.push({ type: 'flood', severity: 'high', message: 'Heavy rainfall — ensure drainage' });
    if (this.currentData.windSpeed > 15) alerts.push({ type: 'wind', severity: 'medium', message: 'High winds — secure structures & nets' });
    if (this.currentData.humidity > 90) alerts.push({ type: 'humidity', severity: 'medium', message: 'High humidity — watch for fungal diseases' });
    return alerts;
  }
}

/** 14C.3 — Smart Irrigation Controller */
export class IrrigationController {
  constructor(controllerId, zones = []) {
    this.controllerId = controllerId;
    this.zones = zones.map(z => ({ ...z, isActive: false, lastRun: null, nextScheduled: null }));
    this.schedules = [];
    this.mode = 'auto'; // auto | manual | schedule
  }

  setMode(mode) { this.mode = mode; }

  activateZone(zoneIndex, durationMinutes = 30) {
    if (zoneIndex < 0 || zoneIndex >= this.zones.length) return false;
    this.zones[zoneIndex].isActive = true;
    this.zones[zoneIndex].lastRun = new Date().toISOString();
    setTimeout(() => { this.zones[zoneIndex].isActive = false; }, durationMinutes * 60 * 1000);
    return { zone: this.zones[zoneIndex], duration: durationMinutes, status: 'activated' };
  }

  deactivateZone(zoneIndex) {
    if (zoneIndex >= 0 && zoneIndex < this.zones.length) this.zones[zoneIndex].isActive = false;
  }

  autoDecide(soilMoisture, weatherForecast) {
    if (this.mode !== 'auto') return { action: 'skip', reason: 'Manual mode active' };
    if (soilMoisture > 60) return { action: 'skip', reason: 'Soil moisture adequate' };
    if (weatherForecast?.includes('rain')) return { action: 'skip', reason: 'Rain forecasted' };
    if (soilMoisture < 30) return { action: 'irrigate', duration: 45, urgency: 'high' };
    return { action: 'irrigate', duration: 30, urgency: 'normal' };
  }

  addSchedule(zoneIndex, time, days, duration) {
    this.schedules.push({ zoneIndex, time, days, duration, enabled: true, id: Date.now() });
  }

  getStatus() {
    return {
      controllerId: this.controllerId,
      mode: this.mode,
      zones: this.zones,
      schedules: this.schedules,
      activeZones: this.zones.filter(z => z.isActive).length,
    };
  }
}

/** 14C.4 — Field Camera (timelapse growth tracking) */
export class FieldCamera {
  constructor(cameraId, fieldId) {
    this.cameraId = cameraId;
    this.fieldId = fieldId;
    this.captures = [];
  }

  addCapture(imageUrl, metadata = {}) {
    this.captures.push({ imageUrl, timestamp: new Date().toISOString(), ...metadata });
    return this.captures.length;
  }

  getTimelapse(days = 30) {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return this.captures.filter(c => new Date(c.timestamp).getTime() > cutoff);
  }

  getLatest() { return this.captures[this.captures.length - 1] || null; }

  getGrowthProgress() {
    if (this.captures.length < 2) return null;
    return { totalCaptures: this.captures.length, firstCapture: this.captures[0].timestamp, lastCapture: this.captures[this.captures.length - 1].timestamp, daysCovered: Math.round((Date.now() - new Date(this.captures[0].timestamp).getTime()) / (24 * 60 * 60 * 1000)) };
  }
}

/** 14C.5 — Drone NDVI Integration */
export class DroneNDVI {
  constructor(fieldId) {
    this.fieldId = fieldId;
    this.scans = [];
  }

  addScan(ndviData) {
    const scan = {
      id: `NDVI-${Date.now()}`,
      timestamp: new Date().toISOString(),
      averageNDVI: ndviData.average || 0,
      minNDVI: ndviData.min || 0,
      maxNDVI: ndviData.max || 0,
      healthZones: ndviData.zones || [],
      coverage: ndviData.coverage || 100,
    };
    this.scans.push(scan);
    return scan;
  }

  getHealthAssessment(ndvi) {
    if (ndvi >= 0.7) return { status: 'Excellent', color: '#22c55e', icon: '🟢', action: 'No action needed' };
    if (ndvi >= 0.5) return { status: 'Good', color: '#34d399', icon: '🟢', action: 'Monitor regularly' };
    if (ndvi >= 0.3) return { status: 'Moderate', color: '#fbbf24', icon: '🟡', action: 'Check for stress factors' };
    if (ndvi >= 0.1) return { status: 'Poor', color: '#f97316', icon: '🟠', action: 'Immediate intervention needed' };
    return { status: 'Critical', color: '#ef4444', icon: '🔴', action: 'Crop may be dead or bare soil' };
  }

  getLatestScan() { return this.scans[this.scans.length - 1] || null; }
  getTrend() {
    if (this.scans.length < 2) return 'insufficient_data';
    const last = this.scans[this.scans.length - 1].averageNDVI;
    const prev = this.scans[this.scans.length - 2].averageNDVI;
    if (last > prev + 0.05) return 'improving';
    if (last < prev - 0.05) return 'declining';
    return 'stable';
  }
}

export default { SoilMoistureSensor, WeatherStation, IrrigationController, FieldCamera, DroneNDVI };
