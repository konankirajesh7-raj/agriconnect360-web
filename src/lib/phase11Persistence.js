import { supabase, DEFAULT_STATE, DEFAULT_DISTRICT } from './supabase';

export const PHASE11_STORAGE_KEYS = {
    onboardingStatus: 'agri360_onboarding_complete',
    onboardingData: 'agri360_onboarding_data',
    profileData: 'agri360_profile_data',
    fpoActiveMember: 'agri360_fpo_active_member',
};

function hasStorage() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function safeParseJSON(raw, fallback = null) {
    if (!raw) return fallback;
    try {
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

function getStorageItem(key) {
    return hasStorage() ? window.localStorage.getItem(key) : null;
}

function setStorageItem(key, value) {
    if (!hasStorage()) return;
    window.localStorage.setItem(key, value);
}

function removeStorageItem(key) {
    if (!hasStorage()) return;
    window.localStorage.removeItem(key);
}

export function getStoredOnboardingData() {
    return safeParseJSON(getStorageItem(PHASE11_STORAGE_KEYS.onboardingData), null);
}

export function getOnboardingStatus() {
    return getStorageItem(PHASE11_STORAGE_KEYS.onboardingStatus);
}

const NON_FARMER_ROLES = ['admin', 'fpo', 'industrial', 'broker', 'supplier', 'labour'];

export function isOnboardingComplete(profile = {}) {
    // Non-farmer roles skip the farmer onboarding flow entirely
    if (NON_FARMER_ROLES.includes(profile?.role)) return true;
    if (profile?.onboarding_completed) return true;

    const status = getOnboardingStatus();
    return status === 'true' || status === 'skipped';
}

export function saveStoredOnboardingData(data) {
    if (!data) return;
    setStorageItem(PHASE11_STORAGE_KEYS.onboardingData, JSON.stringify(data));
    setStorageItem(PHASE11_STORAGE_KEYS.onboardingStatus, 'true');
}

export function getStoredProfileData() {
    return safeParseJSON(getStorageItem(PHASE11_STORAGE_KEYS.profileData), null);
}

export function saveStoredProfileData(data) {
    if (!data) return;
    setStorageItem(PHASE11_STORAGE_KEYS.profileData, JSON.stringify(data));
}

export function getStoredFPOMember() {
    return safeParseJSON(getStorageItem(PHASE11_STORAGE_KEYS.fpoActiveMember), null);
}

export function setStoredFPOMember(member) {
    if (!member) {
        clearStoredFPOMember();
        return;
    }
    setStorageItem(PHASE11_STORAGE_KEYS.fpoActiveMember, JSON.stringify(member));
}

export function clearStoredFPOMember() {
    removeStorageItem(PHASE11_STORAGE_KEYS.fpoActiveMember);
}

function normalizeCropArray(data = {}) {
    if (Array.isArray(data.selected_crops)) return data.selected_crops;
    if (Array.isArray(data.selectedCrops)) return data.selectedCrops;
    if (Array.isArray(data.preferred_crops)) return data.preferred_crops;
    if (Array.isArray(data.primary_crops)) return data.primary_crops;
    return [];
}

function cleanObject(object) {
    return Object.fromEntries(
        Object.entries(object).filter(([, value]) => value !== undefined)
    );
}

export function getMergedPhase11Profile(baseProfile = {}) {
    const merged = {
        ...getStoredOnboardingData(),
        ...getStoredProfileData(),
        ...baseProfile,
    };
    const selectedCrops = normalizeCropArray(merged);
    const acres = Number(merged.farm_area_acres ?? merged.total_land_acres ?? 0) || 0;

    return {
        state: DEFAULT_STATE,
        district: DEFAULT_DISTRICT,
        ...merged,
        farm_area_acres: acres,
        total_land_acres: acres,
        selected_crops: selectedCrops,
        selectedCrops,
    };
}

function buildFullFarmerPayload(data = {}) {
    const selectedCrops = normalizeCropArray(data);
    const acres = Number(data.farm_area_acres ?? data.total_land_acres ?? 0) || 0;
    const age = data.age === '' || data.age === null || data.age === undefined
        ? null
        : Number(data.age);

    return cleanObject({
        name: data.name || 'Farmer',
        mobile: data.mobile || '',
        email: data.email || null,
        state: data.state || DEFAULT_STATE,
        district: data.district || DEFAULT_DISTRICT,
        mandal: data.mandal || null,
        village: data.village || null,
        age: Number.isNaN(age) ? null : age,
        gender: data.gender || null,
        language: data.language || 'te',
        farm_area_acres: acres,
        total_land_acres: acres,
        soil_type: data.soil_type || null,
        irrigation_type: data.irrigation_type || null,
        aadhaar_last4: data.aadhaar_last4 || null,
        kisan_id: data.kisan_id || null,
        referral_code: data.referral_code || null,
        selected_crops: selectedCrops,
        onboarding_completed: data.onboarding_completed ?? null,
        onboarding_date: data.onboarding_date || null,
        updated_at: new Date().toISOString(),
    });
}

function buildSlimFarmerPayload(data = {}) {
    const acres = Number(data.farm_area_acres ?? data.total_land_acres ?? 0) || 0;
    return cleanObject({
        name: data.name || 'Farmer',
        mobile: data.mobile || '',
        state: data.state || DEFAULT_STATE,
        district: data.district || DEFAULT_DISTRICT,
        mandal: data.mandal || null,
        village: data.village || null,
        total_land_acres: acres,
        kisan_id: data.kisan_id || null,
        updated_at: new Date().toISOString(),
    });
}

async function tryFindFarmerByColumn(column, authId) {
    try {
        const { data, error } = await supabase
            .from('farmers')
            .select('*')
            .eq(column, authId)
            .maybeSingle();

        if (error) throw error;
        return data || null;
    } catch {
        return null;
    }
}

export async function findFarmerByAuthId(authId) {
    if (!authId) return null;
    const byProfileId = await tryFindFarmerByColumn('profile_id', authId);
    if (byProfileId) return byProfileId;
    return tryFindFarmerByColumn('user_id', authId);
}

async function tryUpdateFarmer(farmerId, payload) {
    try {
        const { data, error } = await supabase
            .from('farmers')
            .update(payload)
            .eq('id', farmerId)
            .select('*')
            .maybeSingle();

        if (error) throw error;
        return data || null;
    } catch {
        return null;
    }
}

async function tryInsertFarmer(payload) {
    try {
        const { data, error } = await supabase
            .from('farmers')
            .insert(payload)
            .select('*')
            .maybeSingle();

        if (error) throw error;
        return data || null;
    } catch {
        return null;
    }
}

export async function upsertFarmerForAuthUser(authId, data = {}, existingFarmerId = null) {
    if (!authId) return null;

    const payloadVariants = [
        buildFullFarmerPayload(data),
        buildSlimFarmerPayload(data),
    ];

    const existingFarmer = existingFarmerId
        ? { id: existingFarmerId }
        : await findFarmerByAuthId(authId);

    if (existingFarmer?.id) {
        for (const payload of payloadVariants) {
            const updated = await tryUpdateFarmer(existingFarmer.id, payload);
            if (updated) return updated;
        }
    }

    const linkColumns = ['profile_id', 'user_id'];
    for (const linkColumn of linkColumns) {
        for (const payload of payloadVariants) {
            const inserted = await tryInsertFarmer({ ...payload, [linkColumn]: authId });
            if (inserted) return inserted;
        }
    }

    return existingFarmer?.id
        ? { ...existingFarmer, ...payloadVariants[0] }
        : { id: authId, ...payloadVariants[0] };
}

export async function upsertFarmerPreferences(farmerId, data = {}) {
    if (!farmerId) return null;

    const crops = normalizeCropArray(data);
    const modernPayload = cleanObject({
        farmer_id: farmerId,
        language: data.language || 'te',
        district: data.district || DEFAULT_DISTRICT,
        preferred_crops: crops,
        notification_weather: data.notification_weather ?? true,
        notification_prices: data.notification_prices ?? true,
        notification_schemes: data.notification_schemes ?? true,
        notification_crops: data.notification_crops ?? true,
        updated_at: new Date().toISOString(),
    });

    const legacyPayload = cleanObject({
        farmer_id: farmerId,
        language: data.language || 'te',
        district: data.district || DEFAULT_DISTRICT,
        preferred_crops: crops,
        notification_prefs: {
            priceAlerts: data.notification_prices ?? true,
            weatherAlerts: data.notification_weather ?? true,
            cropReminders: data.notification_crops ?? true,
        },
    });

    const primaryCropVariants = [
        modernPayload,
        { ...modernPayload, primary_crops: crops },
        legacyPayload,
        { ...legacyPayload, primary_crops: crops },
    ];

    for (const payload of primaryCropVariants) {
        try {
            const { data: saved, error } = await supabase
                .from('farmer_preferences')
                .upsert(payload, { onConflict: 'farmer_id' })
                .select('*')
                .maybeSingle();

            if (error) throw error;
            return saved || payload;
        } catch {
            // Try the next payload shape for schema compatibility.
        }
    }

    return modernPayload;
}