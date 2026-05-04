# Graph Report - .  (2026-05-02)

## Corpus Check
- Large corpus: 161 files · ~540,615 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 584 nodes · 653 edges · 31 communities detected
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 76 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 30 edges
2. `useSupabaseQuery()` - 17 edges
3. `load()` - 11 edges
4. `MemoryCache` - 10 edges
5. `geminiRequest()` - 8 edges
6. `IrrigationController` - 8 edges
7. `log()` - 7 edges
8. `formatCurrency()` - 7 edges
9. `checkAPI()` - 6 edges
10. `App()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `buildProfileForm()` --calls--> `getMergedPhase11Profile()`  [INFERRED]
  src\pages\ProfilePage.jsx → src\lib\phase11Persistence.js
- `AIPage()` --calls--> `useAuth()`  [INFERRED]
  src\pages\AIPage.jsx → src\lib\hooks\useAuth.js
- `FinancialServicesPage()` --calls--> `useAuth()`  [INFERRED]
  src\pages\FinancialServicesPage.jsx → src\lib\hooks\useAuth.js
- `OnboardingPage()` --calls--> `useAuth()`  [INFERRED]
  src\pages\OnboardingPage.jsx → src\lib\hooks\useAuth.js
- `ProfilePage()` --calls--> `useAuth()`  [INFERRED]
  src\pages\ProfilePage.jsx → src\lib\hooks\useAuth.js

## Communities

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (27): BackgroundPhotoUpload(), PostUploadModal(), AuthProvider(), useAuth(), useAuthProvider(), useBugReports(), navT(), tl() (+19 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (20): useSupabaseMutation(), useSupabaseQuery(), CropsPage(), CustomerDashboardPage(), DisputesPage(), EquipmentPage(), FarmersPage(), FieldDetailDrawer() (+12 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (5): DroneNDVI, FieldCamera, IrrigationController, SoilMoistureSensor, WeatherStation

### Community 3 - "Community 3"
Cohesion: 0.14
Nodes (27): buildFullFarmerPayload(), buildSlimFarmerPayload(), cleanObject(), clearStoredFPOMember(), findFarmerByAuthId(), getMergedPhase11Profile(), getOnboardingStatus(), getStorageItem() (+19 more)

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (19): ChallengesTab(), CoinsTab(), ContestsTab(), fmt(), ReferralsTab(), addCoins(), earnBadge(), getChallenges() (+11 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (9): detectXSS(), RateLimiter, sanitizeInput(), sanitizeObject(), validateInput(), sanitize(), sanitizeObject(), validate() (+1 more)

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (18): AssetsSection(), buildSubsidyCatalog(), FinancialServicesPage(), formatCurrency(), getAnnualDepreciation(), getBookValue(), getHealthLabel(), getToneByPercent() (+10 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (1): MemoryCache

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (3): usePushNotifications(), hasCallMeBotKey(), SettingsPage()

### Community 9 - "Community 9"
Cohesion: 0.28
Nodes (11): checkAPI(), checkGemini(), checkGroq(), checkMandiPrices(), checkSupabaseAuth(), checkSupabaseREST(), checkSupabaseStorage(), checkSupabaseTable() (+3 more)

### Community 10 - "Community 10"
Cohesion: 0.17
Nodes (2): getPremiumAuthToken(), premiumApiRequest()

### Community 11 - "Community 11"
Cohesion: 0.28
Nodes (9): buildFallbackFromCoords(), estimateAPDistrict(), getCurrentPosition(), getFullLocation(), reverseGeocode(), translateToHindi(), translateToTelugu(), tryBigDataCloud() (+1 more)

### Community 12 - "Community 12"
Cohesion: 0.17
Nodes (3): useCommunityFeed(), AdminFeedModeration(), CommunityFeed()

### Community 13 - "Community 13"
Cohesion: 0.2
Nodes (6): buildPdfFromJpeg(), buildProfileForm(), fileToDataUrl(), mergeUint8Arrays(), ProfilePage(), uploadProfilePhoto()

### Community 14 - "Community 14"
Cohesion: 0.2
Nodes (4): LanguageSwitcher(), useLanguage(), Dashboard(), VillageExplorer()

### Community 15 - "Community 15"
Cohesion: 0.27
Nodes (5): checkPriceAlerts(), fetchLiveMandiPrices(), getPriceHistory(), getPriceTrends(), refreshMandiPrices()

### Community 17 - "Community 17"
Cohesion: 0.36
Nodes (8): analyzeSoilHealth(), assessPestRisk(), benchmarkFarm(), detectCropDisease(), forecastRevenue(), geminiRequest(), optimizeIrrigation(), predictYield()

### Community 19 - "Community 19"
Cohesion: 0.28
Nodes (4): AIPage(), callAIEngine(), callGemini(), callGroq()

### Community 20 - "Community 20"
Cohesion: 0.29
Nodes (2): DownloadAppPrompt(), useInstallPrompt()

### Community 21 - "Community 21"
Cohesion: 0.25
Nodes (2): FarmScene3D(), useBackgroundPhotos()

### Community 22 - "Community 22"
Cohesion: 0.46
Nodes (6): enqueueWrite(), getQueue(), getQueueLength(), saveQueue(), smartWrite(), syncQueue()

### Community 23 - "Community 23"
Cohesion: 0.33
Nodes (2): networkFirst(), offlineFallback()

### Community 25 - "Community 25"
Cohesion: 0.38
Nodes (3): getAPData(), getDistrictStats(), searchVillages()

### Community 26 - "Community 26"
Cohesion: 0.4
Nodes (2): getConsentStatus(), hasAnalyticsConsent()

### Community 27 - "Community 27"
Cohesion: 0.33
Nodes (1): ErrorBoundary

### Community 28 - "Community 28"
Cohesion: 0.47
Nodes (3): generateOTP(), logOTPDelivery(), sendOTP()

### Community 29 - "Community 29"
Cohesion: 0.47
Nodes (3): fetchLiveMandiPrices(), getMarketPrices(), syncPricesToSupabase()

### Community 34 - "Community 34"
Cohesion: 0.83
Nodes (3): checkTable(), main(), seedData()

### Community 36 - "Community 36"
Cohesion: 0.67
Nodes (2): tips(), WeatherPage()

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (2): log(), run()

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (2): log(), run()

## Knowledge Gaps
- **Thin community `Community 7`** (17 nodes): `createImagePlaceholder()`, `getOptimizedImageUrl()`, `measurePageLoad()`, `MemoryCache`, `.clear()`, `.constructor()`, `.delete()`, `._evict()`, `.get()`, `.getStats()`, `.has()`, `.set()`, `.size()`, `prefetchOnHover()`, `preloadRoute()`, `reportWebVitals()`, `performance.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (13 nodes): `getPremiumAuthToken()`, `getSession()`, `getUser()`, `premiumApiRequest()`, `signInWithOTP()`, `signInWithPassword()`, `signOut()`, `signUpFarmer()`, `subscribeToMarketPrices()`, `subscribeToNotifications()`, `subscribeToWeatherAlerts()`, `withPremiumFallback()`, `supabase.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (8 nodes): `DownloadAppPrompt()`, `DownloadIcon()`, `getPlatform()`, `InstallModal()`, `isStandalone()`, `PhoneIcon()`, `useInstallPrompt()`, `DownloadAppPrompt.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (8 nodes): `AutoCamera()`, `CommunityPhotoWorld()`, `FarmScene3D()`, `Lights()`, `SceneContent()`, `useBackgroundPhotos()`, `FarmScene3D.jsx`, `useBackgroundPhotos.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (7 nodes): `cacheFirst()`, `sw.js`, `networkFirst()`, `offlineFallback()`, `processOfflineQueue()`, `refreshPrices()`, `staleWhileRevalidate()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (6 nodes): `CookieConsentBanner()`, `exportUserData()`, `getConsentStatus()`, `hasAnalyticsConsent()`, `requestAccountDeletion()`, `consent.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (6 nodes): `ErrorBoundary`, `.componentDidCatch()`, `.constructor()`, `.getDerivedStateFromError()`, `.render()`, `ErrorBoundary.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (4 nodes): `RainEffect()`, `tips()`, `WeatherPage()`, `WeatherPage.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (3 nodes): `log()`, `run()`, `cross_role_test.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (3 nodes): `log()`, `run()`, `full_50_test.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `Community 0` to `Community 1`, `Community 3`, `Community 6`, `Community 8`, `Community 12`, `Community 13`, `Community 19`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **Why does `ProtectedRoute()` connect `Community 0` to `Community 3`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Are the 29 inferred relationships involving `useAuth()` (e.g. with `ProtectedRoute()` and `RoleRoute()`) actually correct?**
  _`useAuth()` has 29 INFERRED edges - model-reasoned connections that need verification._
- **Are the 16 inferred relationships involving `useSupabaseQuery()` (e.g. with `CropsPage()` and `CustomerDashboardPage()`) actually correct?**
  _`useSupabaseQuery()` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._