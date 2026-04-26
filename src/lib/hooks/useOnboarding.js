/**
 * Onboarding Context — Phase 11
 * Multi-step wizard state management with localStorage persistence
 * Steps: Welcome → Mobile+OTP → Profile → Land → Crops → Schemes → Preferences → Summary
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const OnboardingContext = createContext(null);
const STORAGE_KEY = 'agri360_onboarding';

const STEPS = [
  { id: 'welcome',     label: 'Welcome',      icon: '🌾', index: 0 },
  { id: 'mobile',      label: 'Verify Mobile', icon: '📱', index: 1 },
  { id: 'profile',     label: 'Profile',       icon: '👤', index: 2 },
  { id: 'land',        label: 'Land & Fields', icon: '🌾', index: 3 },
  { id: 'crops',       label: 'Crops',         icon: '🌱', index: 4 },
  { id: 'schemes',     label: 'Schemes',       icon: '🏛️', index: 5 },
  { id: 'preferences', label: 'Preferences',   icon: '⚙️', index: 6 },
  { id: 'summary',     label: 'Summary',       icon: '✅', index: 7 },
];

const INITIAL_DATA = {
  // Step 1: Language
  language: 'en',
  // Step 2: Mobile
  mobile: '',
  otpVerified: false,
  // Step 3: Profile
  name: '',
  gender: 'male',
  age: '',
  aadhaarLast4: '',
  kisanId: '',
  district: 'Guntur',
  mandal: '',
  village: '',
  // Step 4: Fields
  fields: [
    { name: '', area_acres: '', soil_type: 'Black Cotton', irrigation_type: 'Borewell', latitude: '', longitude: '' },
  ],
  // Step 5: Crops
  selectedCrops: [],
  seasons: ['Kharif'],
  // Step 6: Schemes (auto-populated)
  eligibleSchemes: [],
  // Step 7: Preferences
  notifications: {
    priceAlerts: true,
    weatherAlerts: true,
    cropReminders: true,
    smsAlerts: false,
    pestAlerts: true,
  },
};

const AP_DISTRICTS = [
  'Guntur', 'Krishna', 'Kurnool', 'Prakasam', 'Nellore',
  'Visakhapatnam', 'East Godavari', 'West Godavari', 'Anantapur', 'Chittoor',
  'Kadapa', 'Srikakulam', 'Vizianagaram', 'Tirupati', 'Eluru',
  'Rajahmundry', 'Kakinada', 'Nandyal', 'Bapatla', 'Palnadu',
];

const AP_MANDALS = {
  'Guntur': ['Tenali', 'Mangalagiri', 'Ponnur', 'Bapatla', 'Repalle', 'Prathipadu', 'Pedanandipadu'],
  'Krishna': ['Vijayawada', 'Gudivada', 'Machilipatnam', 'Nuzvid', 'Gannavaram', 'Vuyyuru'],
  'Kurnool': ['Kurnool', 'Nandyal', 'Adoni', 'Yemmiganur', 'Allagadda', 'Dhone'],
  'Prakasam': ['Ongole', 'Markapur', 'Chirala', 'Kandukur', 'Darsi'],
  'Nellore': ['Nellore', 'Gudur', 'Kavali', 'Atmakur'],
  'Visakhapatnam': ['Visakhapatnam', 'Anakapalle', 'Araku', 'Narsipatnam'],
  'East Godavari': ['Rajahmundry', 'Kakinada', 'Amalapuram', 'Peddapuram', 'Rampachodavaram'],
  'West Godavari': ['Eluru', 'Bhimavaram', 'Tadepalligudem', 'Tanuku', 'Narasapuram'],
  'Anantapur': ['Anantapur', 'Dharmavaram', 'Hindupur', 'Guntakal', 'Penukonda'],
  'Chittoor': ['Tirupati', 'Chittoor', 'Madanapalle', 'Srikalahasti', 'Pileru'],
  'Kadapa': ['Kadapa', 'Proddatur', 'Rajampet', 'Jammalamadugu', 'Rayachoti'],
  'Srikakulam': ['Srikakulam', 'Palasa', 'Amadalavalasa', 'Narasannapeta'],
  'Vizianagaram': ['Vizianagaram', 'Bobbili', 'Parvathipuram', 'Rajam'],
};

const CROP_OPTIONS = [
  { id: 'paddy',      name: 'Paddy (Rice)',  icon: '🌾', season: ['Kharif', 'Rabi'] },
  { id: 'cotton',     name: 'Cotton',        icon: '🌿', season: ['Kharif'] },
  { id: 'chilli',     name: 'Chilli',        icon: '🌶️', season: ['Kharif', 'Rabi'] },
  { id: 'maize',      name: 'Maize',         icon: '🌽', season: ['Kharif', 'Rabi'] },
  { id: 'groundnut',  name: 'Groundnut',     icon: '🥜', season: ['Kharif', 'Rabi'] },
  { id: 'sugarcane',  name: 'Sugarcane',     icon: '🎋', season: ['Year-round'] },
  { id: 'wheat',      name: 'Wheat',         icon: '🌾', season: ['Rabi'] },
  { id: 'sunflower',  name: 'Sunflower',     icon: '🌻', season: ['Rabi'] },
  { id: 'banana',     name: 'Banana',        icon: '🍌', season: ['Year-round'] },
  { id: 'mango',      name: 'Mango',         icon: '🥭', season: ['Year-round'] },
  { id: 'tomato',     name: 'Tomato',        icon: '🍅', season: ['Rabi', 'Kharif'] },
  { id: 'turmeric',   name: 'Turmeric',      icon: '🟡', season: ['Kharif'] },
  { id: 'coconut',    name: 'Coconut',       icon: '🥥', season: ['Year-round'] },
  { id: 'tobacco',    name: 'Tobacco',       icon: '🍃', season: ['Rabi'] },
  { id: 'pulses',     name: 'Pulses',        icon: '🫘', season: ['Rabi', 'Kharif'] },
  { id: 'vegetables', name: 'Vegetables',    icon: '🥬', season: ['Rabi', 'Kharif', 'Zaid'] },
];

export function OnboardingProvider({ children }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...INITIAL_DATA, ...JSON.parse(saved) } : { ...INITIAL_DATA };
    } catch { return { ...INITIAL_DATA }; }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch { /* quota exceeded */ }
  }, [formData]);

  const updateField = useCallback((key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateFields = useCallback((updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((index) => {
    if (index >= 0 && index < STEPS.length) setCurrentStep(index);
  }, []);

  const resetOnboarding = useCallback(() => {
    setCurrentStep(0);
    setFormData({ ...INITIAL_DATA });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const progress = Math.round(((currentStep + 1) / STEPS.length) * 100);

  const value = {
    currentStep,
    setCurrentStep,
    stepInfo: STEPS[currentStep],
    steps: STEPS,
    totalSteps: STEPS.length,
    progress,
    formData,
    updateField,
    updateFields,
    nextStep,
    prevStep,
    goToStep,
    resetOnboarding,
    isSubmitting,
    setIsSubmitting,
    // Reference data
    AP_DISTRICTS,
    AP_MANDALS,
    CROP_OPTIONS,
  };

  return React.createElement(OnboardingContext.Provider, { value }, children);
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}

export { STEPS, INITIAL_DATA, AP_DISTRICTS, AP_MANDALS, CROP_OPTIONS };
export default useOnboarding;
