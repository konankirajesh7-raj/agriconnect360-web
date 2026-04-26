# AGRICONNECT 360 — COMPLETE TESTING MASTER PLAN
## Full Platform Test Guide | Zero to Hidden Icons | Every Role
### Version: 1.0 FINAL | April 24, 2026
### Coverage: 100% Features | All 7 Roles | All Devices

---

## HOW TO USE THIS DOCUMENT

### SYMBOLS:
- □ = Test step to perform manually
- ✓ = Expected result / what you should see
- ✗ = What should NOT happen (failure condition)
- ⚠ = Special attention / edge case
- 📱 = Test on mobile device
- 💻 = Test on desktop browser
- 🔴 = Critical — must pass before launch
- 🟡 = Important — should pass before launch
- 🟢 = Nice to have — test when time permits
- [TAP] = Click / tap action
- [TYPE] = Enter text
- [SWIPE] = Swipe gesture on mobile
- [SCROLL] = Scroll action
- [CHECK] = Verify visually

### TEST ACCOUNTS TO CREATE BEFORE STARTING:
| Role | Mobile | Name | Details |
|------|--------|------|---------|
| Farmer 1 | 9000000001 | Rajesh Kumar | District: Guntur |
| Farmer 2 | 9000000002 | Suresh Reddy | District: Kurnool |
| Supplier 1 | 9000000003 | AgriMart Guntur | GST: 37XXXXX |
| Broker 1 | 9000000004 | Venkat Trader | APMC: Guntur |
| Industrial | 9000000005 | Cotton Mill Ltd | |
| Labour | 9000000006 | Rythu Labour Association | |
| Admin | 9000000007 | Platform Admin | |

### BROWSERS TO TEST:
Chrome 120+ | Firefox 120+ | Safari 16+ | Edge 120+ | Chrome Mobile (Android) | Safari Mobile (iOS)

### DEVICES TO TEST:
Desktop: 1920×1080 | Laptop: 1366×768 | Tablet: iPad (768×1024) | Mobile: 375×812 (iPhone) | 360×800 (Android)

---

## TESTING PHASES OVERVIEW

| Section | Area |
|---------|------|
| 1 | Pre-Testing Setup & Environment Check |
| 2 | Public Pages (No Login) |
| 3 | Registration & Login Flows (All Roles) |
| 4 | Farmer Dashboard — Complete Module Testing |
| 5 | Financial Services Module Testing |
| 6 | Gamification & Rewards Testing |
| 7 | Supplier Dashboard Testing |
| 8 | Broker Dashboard Testing |
| 9 | Industrial Dashboard Testing |
| 10 | Labour Association Dashboard Testing |
| 11 | Admin Panel Testing |
| 12 | Cross-Role Interaction Testing |
| 13 | Mobile & PWA Testing |
| 14 | Offline Mode Testing |
| 15 | Performance Testing |
| 16 | Security Testing |
| 17 | Notification System Testing |
| 18 | Payment Flow Testing |
| 19 | AI Features Deep Testing |
| 20 | Hidden Icons, Edge Cases & Easter Eggs |
| 21 | Accessibility Testing (WCAG 2.1 AA) |
| 22 | Multi-Language Testing |
| 23 | Community Forum Testing |
| 24 | Profile & Settings Testing |
| 25 | Marketplace Complete Testing |
| 26 | IoT Features Testing |
| 27 | Final Regression Checklist (Pre-Launch) |
| 28 | Bug Reporting Template |
| 29 | Test Execution Tracking Sheet |
| 30 | Post-Launch Monitoring (Day 1) |

---

## SECTION 1: PRE-TESTING SETUP & ENVIRONMENT CHECK

### 1.1 ENVIRONMENT VERIFICATION

- □ Open browser → Navigate to https://agriconnect360-web.vercel.app
  - ✓ Page loads within 5 seconds
  - ✓ HTTPS padlock visible in address bar
  - ✓ No "Not Secure" warning
  - ✓ No blank white screen
  - ✓ No console errors (open DevTools → Console tab)

- □ Check SSL Certificate
  - ✓ Click padlock → Certificate valid
  - ✓ Not expired (at least 30 days remaining)

- □ Check website on all browsers
  - □ Chrome: Loads correctly, fonts render
  - □ Firefox: Loads correctly
  - □ Safari: Loads correctly
  - □ Edge: Loads correctly

- □ Check mobile view (resize browser to 375px width OR use DevTools mobile emulation)
  - ✓ No horizontal scrollbar
  - ✓ Text readable without zooming
  - ✓ Buttons large enough to tap

### 1.2 CONSOLE & ERROR CHECK

- □ Open Chrome DevTools (F12) → Console tab
- □ Navigate to homepage
  - ✓ Zero red errors
  - ✓ Zero "Failed to fetch" messages
  - ✓ Zero "404 Not Found" for assets
  - ✗ FAIL if: "Uncaught TypeError" appears
  - ✗ FAIL if: Any API key appears in console logs

- □ Open DevTools → Network tab → Refresh page
  - ✓ All requests return 200 (green)
  - ✓ No 404 for images/fonts/scripts
  - ✓ No 500 (server error)
  - ✓ Page size under 2MB total
  - ✓ LCP under 3 seconds

### 1.3 BASIC NAVIGATION CHECK

- □ Check all public navigation links work:
  - □ [TAP] Logo → Goes to homepage
  - □ [TAP] Features → /features loads
  - □ [TAP] Pricing → /pricing loads
  - □ [TAP] About → /about loads
  - □ [TAP] Contact → /contact-us loads
  - □ [TAP] Login → /login loads
  - ✓ All pages load without errors
  - ✓ Browser back button works on each page
  - ✓ Page title changes on each page

---

## SECTION 2: PUBLIC PAGES TESTING (NO LOGIN REQUIRED)

### 2.1 HOMEPAGE (/)

**HERO SECTION:**
- □ Navigate to homepage
  - ✓ Hero section loads with headline: "Data-Driven Farming for AP Farmers"
  - ✓ Telugu/Hindi/English language badges visible
  - ✓ "Start Free" button visible and bright green
  - ✓ "Explore Features" button visible

- □ [TAP] "Start Free" button
  - ✓ Navigates to /login page

- □ [SCROLL] Down to Features Grid
  - ✓ Module preview cards visible (AI, Weather, Market, etc.)
  - ✓ Each card has Icon + Name + Description
  - ✓ Icons are not broken/missing

- □ [SCROLL] to Testimonials section
  - ✓ Farmer testimonials visible
  - ✓ Names, villages, crop details shown

- □ [SCROLL] to Footer
  - ✓ All footer links visible
  - ✓ Copyright text shows current year
  - ✓ Privacy Policy link works
  - ✓ Terms of Service link works

- 📱 Mobile responsive test:
  - □ Resize to 375px width
    - ✓ Layout adapts, no horizontal scroll
    - ✓ Navigation collapses to hamburger menu
    - ✓ CTA buttons full-width and tappable

### 2.2 FEATURES PAGE (/features)

- □ Navigate to /features
  - ✓ All 24 modules described with detail
  - ✓ Cards display in grid with glassmorphism styling
  - ✓ Navigation to Pricing, About, Login works from this page

### 2.3 PRICING PAGE (/pricing)

- □ Navigate to /pricing
  - ✓ Pricing tiers displayed as cards
  - ✓ FREE tier is highlighted
  - ✓ Feature comparison shows checkmarks correctly
  - ✓ All prices shown in ₹ (INR)
  - □ [TAP] CTA on plan → navigates to login/register

### 2.4 PUBLIC MARKET PRICES (/market)

- □ Navigate to /market (without login)
  - ✓ Market prices visible WITHOUT login
  - ✓ Shows: Crop name, Min/Max/Modal price
  - ✓ "Last updated" timestamp shown
  - ✓ "Sign up for alerts" CTA visible

### 2.5 PUBLIC WEATHER (/public-weather)

- □ Navigate to /public-weather
  - ✓ Weather data for AP region visible
  - ✓ 7-day forecast cards shown
  - ✓ Temperature, rain probability visible
  - ✓ "Login for personalized alerts" banner visible

### 2.6 BLOG (/blog)

- □ Navigate to /blog
  - ✓ Article list visible
  - ✓ Each article shows Title + Category + Read time

### 2.7 CONTACT PAGE (/contact-us)

- □ Navigate to /contact-us
  - ✓ Contact form visible with name, email, message fields
  - □ [TAP] Submit without filling → ✓ Validation errors shown
  - □ [FILL] complete form → [TAP] Submit → ✓ Success message appears

### 2.8 ABOUT PAGE (/about)

- □ Navigate to /about
  - ✓ Company story/mission visible
  - ✓ AP-specific content, no placeholder text
  - ✓ Impact numbers shown

---

## SECTION 3: REGISTRATION & LOGIN FLOWS (ALL ROLES)

### 3.1 FARMER REGISTRATION (FULL FLOW) 🔴

- □ Navigate to /login → Click "Create New Account"
  - ✓ Registration form opens

- □ [FILL] registration:
  - □ [TYPE] Full Name: "Rajesh Kumar"
  - □ [TYPE] Email: "rajesh@test.com"
  - □ [TYPE] Password: "Rajesh@123"
  - □ [TAP] "Create Account"
    - ✓ Success → Redirects to /dashboard
    - ✓ Profile created in Supabase

### 3.2 VALIDATION TESTING — REGISTRATION

- □ Name validation:
  - □ [TYPE] empty name → ✓ Error: "All fields are required"
- □ Password validation:
  - □ [TYPE] "123" (too short) → ✓ Error: "Password must be at least 6 characters"
- □ Email validation:
  - □ [TYPE] "notanemail" → ✓ Error or form prevents submit

### 3.3 LOGIN TESTING 🔴

- □ Navigate to /login

- **TEST: Demo Login:**
  - □ [TAP] "🚀 Explore Demo"
    - ✓ Instantly logged in → Redirected to /dashboard
    - ✓ Dashboard shows "Admin (Demo)" context
    - ✓ All modules accessible

- **TEST: Invalid credentials:**
  - □ [TYPE] Mobile: 1234567890 | Password: wrong
  - □ [TAP] Sign In
    - ✓ Friendly error message (NOT "Invalid API key")
    - ✓ No raw error codes shown to user

- **TEST: Empty form:**
  - □ [TAP] Sign In with empty fields
    - ✓ Error: "Please enter mobile number and password"

- **TEST: OTP flow:**
  - □ [TYPE] Mobile: valid 10-digit number
  - □ [TAP] "Sign In with OTP"
    - ✓ OTP button only enabled when mobile is 10 digits
    - ✓ Error handled gracefully if OTP service unavailable

- **TEST: Navigation from login:**
  - □ [TAP] "← Home" → ✓ Goes to public homepage
  - □ [TAP] "Features" → ✓ Goes to /features
  - □ [TAP] "Pricing" → ✓ Goes to /pricing
  - □ [TAP] footer "About" → ✓ Goes to /about

### 3.4 LOGOUT FLOW 🔴

- □ [LOGIN] via Demo Login
- □ [TAP] "Logout" button in header
  - ✓ Logs out → Redirects to / (public homepage, NOT /login)
  - ✓ Session cleared
- □ Navigate to /dashboard directly
  - ✓ Redirected to /login (protected route)

### 3.5 SESSION PERSISTENCE

- □ [LOGIN] as farmer
- □ Close browser tab
- □ [OPEN] new tab → navigate to site
  - ✓ Still logged in (not asked to login again)

### 3.6 OTP SECURITY TESTS

- □ Test OTP rate limiting:
  - □ Request OTP more than 5 times for same number
    - ✓ Locked: "Too many OTP requests. Try again in X min."
- □ Test account lockout:
  - □ Enter wrong password 5 times
    - ✓ Account locked for 30 minutes

---

## SECTION 4: FARMER DASHBOARD — COMPLETE MODULE TESTING

> **PRE-CONDITION:** Login via Demo Login first

### 4.1 DASHBOARD OVERVIEW

- □ [CHECK] Header bar:
  - ✓ Page title shows "Dashboard" or current page name
  - ✓ Coins display visible (🪙)
  - ✓ Streak indicator visible
  - ✓ Notification bell with badge
  - ✓ Search (Ctrl+K) button
  - ✓ Logout button

- □ [CHECK] Sidebar navigation:
  - ✓ All module links visible and organized by category
  - ✓ Active page highlighted
  - ✓ Categories: Overview, Farmers, Finance, Services, Knowledge, Tools, More

- □ [TAP] Search button (or press Ctrl+K)
  - ✓ Search modal opens
  - □ [TYPE] "weather"
    - ✓ Weather page result appears
  - □ [TAP] result → ✓ Navigates to that page

- □ [TAP] Notification bell
  - ✓ Notification dropdown opens with alerts
  - ✓ Shows alert titles, times, read/unread status

### 4.2 WEATHER MODULE (/weather)

- □ [TAP] Weather in sidebar
  - ✓ Weather data loads for default location (Guntur, AP)
  - ✓ Temperature, humidity, wind speed shown
  - ✓ 7-day forecast cards visible
  - ✓ Farming advisory messages shown
  - ✓ Not all values showing "—" or 0

### 4.3 CROP TRACKING (/crops)

- □ [TAP] Crop Tracking in sidebar
  - ✓ Crop management interface loads
  - ✓ Shows AP-relevant crops
  - ✓ Add crop functionality available

### 4.4 MARKET PRICES (/market-prices)

- □ [TAP] Market Prices in sidebar
  - ✓ Commodity prices table loads
  - ✓ Shows crop names, prices in ₹, mandi info
  - ✓ Search/filter available

### 4.5 EXPENSE TRACKING (/expenses)

- □ [TAP] Expenses in sidebar
  - ✓ Expense tracking interface loads
  - ✓ Category breakdown chart visible
  - ✓ Add expense button works

### 4.6 SALES & PROFIT (/sales)

- □ [TAP] Sales & Profit in sidebar
  - ✓ Sales tracking interface loads
  - ✓ Revenue/profit charts visible

### 4.7 SOIL & WATER (/soil)

- □ [TAP] Soil & Water in sidebar
  - ✓ Soil analysis interface loads

### 4.8 LABOUR BOOKINGS (/labour)

- □ [TAP] Labour Bookings in sidebar
  - ✓ Labour booking interface loads
  - ✓ PaySure Escrow feature visible

### 4.9 TRANSPORT (/transport)

- □ [TAP] Transport in sidebar
  - ✓ Transport booking/tracking interface loads

### 4.10 SUPPLIERS (/suppliers)

- □ [TAP] Suppliers in sidebar
  - ✓ Supplier directory loads

### 4.11 EQUIPMENT (/equipment)

- □ [TAP] Equipment in sidebar
  - ✓ Equipment marketplace loads

### 4.12 GOV SCHEMES (/schemes)

- □ [TAP] Gov Schemes in sidebar
  - ✓ Government scheme listings load
  - ✓ AP-specific schemes shown

### 4.13 KNOWLEDGE BASE (/knowledge)

- □ [TAP] Knowledge in sidebar
  - ✓ Knowledge articles load

### 4.14 Q&A FORUM (/qa)

- □ [TAP] Q&A Forum in sidebar
  - ✓ Question/answer forum loads

### 4.15 DISPUTES (/disputes)

- □ [TAP] Disputes in sidebar
  - ✓ Dispute management interface loads

### 4.16 DRONE REPORTS (/drones)

- □ [TAP] Drone Reports in sidebar
  - ✓ Drone survey interface loads

### 4.17 AI ADVISORY (/ai) 🔴

- □ [TAP] AI Advisory in sidebar
  - ✓ AI chat/advisory interface loads
  - ✓ Message input field visible
  - ✓ Crop recommendation features accessible

### 4.18 WALLET (/wallet)

- □ [TAP] Wallet in sidebar
  - ✓ Digital wallet interface loads

### 4.19 INSURANCE (/insurance)

- □ [TAP] Insurance in sidebar
  - ✓ Insurance management loads

### 4.20 MARKETPLACE (/marketplace)

- □ [TAP] Marketplace in sidebar
  - ✓ Marketplace with product/service listings loads
  - ✓ Cards show images and prices

### 4.21 COMMUNITY (/community)

- □ [TAP] Community in sidebar
  - ✓ Community feed loads
  - ✓ Posts with reactions/comments visible

### 4.22 NOTIFICATIONS (/notifications)

- □ [TAP] Notifications in sidebar
  - ✓ Full notification history loads

### 4.23 TASK MANAGER (/tasks)

- □ [TAP] Task Manager in sidebar
  - ✓ Task board/list loads

### 4.24 IoT SENSORS (/iot)

- □ [TAP] IoT Sensors in sidebar
  - ✓ Sensor dashboard with gauges/charts loads
  - ✓ Temperature, humidity, soil moisture readings shown

### 4.25 F2C STORE (/f2c-store)

- □ [TAP] F2C Store in sidebar
  - ✓ Farm-to-consumer store loads

### 4.26 QUALITY LAB (/quality-lab)

- □ [TAP] Quality Lab in sidebar
  - ✓ Quality testing interface loads

### 4.27 AGRITOURISM (/agri-tourism)

- □ [TAP] AgriTourism in sidebar
  - ✓ Agri-tourism listings load

### 4.28 NETWORK (/network)

- □ [TAP] Network in sidebar
  - ✓ Farmer network/connections load

### 4.29 EXPERT CONNECT (/contact)

- □ [TAP] Expert Connect in sidebar
  - ✓ Expert connection interface loads

### 4.30 PROFILE (/profile)

- □ [TAP] My Profile in sidebar
  - ✓ User profile page loads
  - ✓ Shows name, role, district, state

### 4.31 SETTINGS (/settings)

- □ [TAP] Settings in sidebar
  - ✓ Settings page loads

### 4.32 PREMIUM (/premium)

- □ [TAP] Premium in sidebar
  - ✓ Premium upgrade options load

### 4.33 FPO MODE (/fpo)

- □ [TAP] FPO Mode in sidebar
  - ✓ FPO management dashboard loads

---

> ### 📋 SECTION 4 DEEP-DIVE: DETAILED MODULE TESTING
> The following subsections provide step-by-step detailed testing for critical farmer modules.
> Numbers 4.4-4.17 below are deep-dive tests (not duplicates of the quick checks above).

## 4.4 EXPENSE TRACKING MODULE 🔴

  - □ [TAP] Finance / Expenses in navigation

  **ADD EXPENSE:**
  - □ [TAP] "+ Add Expense" button → ✓ Expense form opens with all fields
  - □ [FILL] expense:
    - □ [SELECT] Category: "Seeds"
    - □ [SELECT] Crop: "Paddy" (links to crop)
    - □ [TYPE] Amount: 2500
    - □ [SELECT] Date: today
    - □ [TYPE] Description: "BPT-5204 seeds purchase"
    - □ [TYPE] Vendor: "Agri Stores, Guntur"
    - □ [SELECT] Payment Method: "UPI"
    - □ [TAP] Save
      - ✓ Expense added to list
      - ✓ Total expenses updated
      - ✓ Monthly chart updates

  **ADD MORE EXPENSES (for meaningful data):**
  - □ Add: Fertilizer — ₹1200 — Paddy crop
  - □ Add: Labour — ₹3000 — Cotton crop
  - □ Add: Pesticide — ₹800 — Paddy crop
  - □ Add: Irrigation — ₹400 — Paddy crop

  - □ [CHECK] Expense list:
    - ✓ All 5 expenses visible
    - ✓ Category icons visible and distinct
    - ✓ Amounts formatted as ₹X,XXX

  - □ [CHECK] Category-wise breakdown chart:
    - ✓ Pie chart or bar chart visible
    - ✓ Shows % per category (Seeds, Fertilizer, Labour, etc.)
    - ✓ Colors for each category
    - ✓ Legend visible

  - □ [CHECK] Monthly filter:
    - □ [SELECT] Previous month → ✓ Expenses filter to previous month
    - □ [SELECT] Current month → ✓ Returns to current expenses

  **RECEIPT UPLOAD:**
  - □ [TAP] on any expense to open detail
  - □ [FIND] "Upload Receipt" or attachment icon
  - □ [TAP] Upload receipt → ✓ File picker opens
  - □ [SELECT] image file → ✓ Receipt image uploaded, thumbnail visible

  **EDIT EXPENSE:**
  - □ [TAP] Edit icon on any expense
    - □ [CHANGE] Amount: 2600 (from 2500)
    - □ [TAP] Save → ✓ Amount updated, total recalculated

  **DELETE EXPENSE:**
  - □ [TAP] Delete icon → ✓ Confirmation required
  - □ [CONFIRM] Delete → ✓ Expense removed, total updates

---

## 4.5 SALES / INCOME RECORDING 🔴

  - □ [FIND] Sales / Income section (under Finance)
  - □ [TAP] "Record Sale" or "+ Add Sale"
  - □ [FILL] sale form:
    - □ [SELECT] Crop: "Paddy"
    - □ [SELECT] Sale Date: today
    - □ [SELECT] Buyer Type: "Mandi / APMC"
    - □ [TYPE] Buyer Name: "Guntur APMC"
    - □ [TYPE] Quantity: 15 (quintals)
    - □ [TYPE] Price per quintal: 2100
    - □ [SELECT] Quality Grade: "A"
    - □ [TYPE] Market Name: "Guntur"
    - □ [TYPE] Transport cost: 500
    - □ [TAP] Save
      - ✓ Sale recorded
      - ✓ Total amount auto-calculated: 15 × 2100 = ₹31,500
      - ✓ Net amount shows: ₹31,500 - ₹500 = ₹31,000
      - ✓ Income chart updates

  - □ [CHECK] P&L calculation:
    - ✓ Revenue shows ₹31,500
    - ✓ Expenses shows total of all expenses added
    - ✓ Net profit/loss calculated correctly
    - ✓ Profit margin % shown

---

## 4.6 MARKET PRICES MODULE (LOGGED IN) 🔴

  - □ [TAP] Market Prices in navigation
    - ✓ Prices load (not blank)
    - ✓ My crops (Paddy, Cotton) shown prominently / first
    - ✓ Other crops listed below

  - □ [FIND] Price trend chart for Paddy
    - □ [TAP] Paddy row or card
      - ✓ 30-day price trend chart opens
      - ✓ Line chart visible with dates on X-axis, price on Y-axis
      - ✓ Current price highlighted

  - □ [FIND] "Set Price Alert" button
    - □ [TAP] Set Alert for Cotton
      - □ [SELECT] Alert type: "When price goes ABOVE"
      - □ [TYPE] Threshold: 6500 (₹ per quintal)
      - □ [TAP] Save Alert
        - ✓ Alert saved, shows in "My Alerts" list

  - □ [CHECK] "Compare Markets" feature:
    - □ [SELECT] 3 different mandis for same crop
      - ✓ Side-by-side price comparison shown
      - ✓ Shows which market has best price today

---

## 4.7 AI ADVISOR MODULE 🔴

  - □ [TAP] AI Advisor in navigation
    - ✓ Chat interface opens with welcome message
    - ✓ Input text box at bottom, Send button, Microphone button

  **BASIC CHAT TEST:**
  - □ [TYPE] "What fertilizer should I use for paddy in vegetative stage?"
  - □ [TAP] Send
    - ✓ "Typing..." or loading indicator appears
    - ✓ Response within 10 seconds, relevant to paddy/fertilizer
    - ✓ Includes specific fertilizer recommendations

  - □ [TYPE] "నా పత్తి పంటకు ఏ ఎరువు వేయాలి?" (Telugu question)
  - □ [TAP] Send
    - ✓ Response in Telugu, renders correctly (no garbled characters)

  **VOICE INPUT TEST:**
  - □ [TAP] Microphone button → ✓ Recording animation starts
  - □ [SPEAK] "What is the best time to harvest cotton?"
    - ✓ Speech transcribed to text in input box
  - □ [TAP] Send → ✓ AI responds to spoken question

  **CONTEXT AWARENESS TEST:**
  - □ [TYPE] "I am growing paddy in 3 acres in Guntur. Current stage is vegetative."
  - □ [TAP] Send → ✓ AI acknowledges the information
  - □ [TYPE] "What should I do this week?"
    - ✓ AI gives week-specific advice relevant to paddy vegetative stage
    - ✓ Does NOT give generic advice ignoring context

  **FOLLOW-UP QUESTIONS:**
  - □ [CHECK] Suggested follow-up chips below AI response
    - □ [TAP] one suggestion chip → ✓ Question auto-filled, AI answers

  **TEXT TO SPEECH:**
  - □ [FIND] Play/Speaker icon next to AI response
  - □ [TAP] Play → ✓ AI response read aloud, stop button appears

  **CONVERSATION HISTORY:**
  - □ [CLOSE] AI chat → [REOPEN] AI chat
    - ✓ Previous conversation visible, context maintained

  **RATE RESPONSE:**
  - □ [TAP] Thumbs up → ✓ Turns green
  - □ [TAP] Thumbs down → ✓ Turns red, optional feedback form

---

## 4.8 EQUIPMENT BOOKING MODULE

  - □ [TAP] Equipment in navigation
  - □ [CHECK] Equipment listing with Name, type, price/day, location, availability
  - □ [SELECT] Category: "Tractor" → ✓ Filters to tractors only
  - □ [TAP] on any equipment card → ✓ Detail page with photos, reviews, calendar
  - □ [TAP] Book / Check Availability
    - □ [SELECT] Date: Tomorrow, Days: 2
    - ✓ Total cost calculated: price × 2 days
    - □ [TAP] "Book Now" → ✓ Booking summary, payment options

---

## 4.9 LABOUR BOOKING MODULE

  - □ [TAP] Labour in navigation
  - □ [CHECK] Labour association listings with Name, skills, workers count, rating
  - □ [TAP] "Book Labour"
    - □ [SELECT] Task: "Harvesting", Date: Next Monday, Workers: 5, Duration: "Full day"
    - □ [TYPE] Farm location: "Narasaraopet Village, Guntur"
    - □ [TYPE] Daily wage: 400
    - □ [TAP] "Request Labour"
      - ✓ Status: "Pending", booking reference shown

---

## 4.10 TRANSPORT MODULE

  - □ [TAP] Transport in navigation
  - □ [FIND] Freight Calculator
    - □ [TYPE] Pickup: "Narasaraopet, Guntur" | Delivery: "Guntur APMC Market"
    - □ [TYPE] Cargo: 15 quintals | [SELECT] Vehicle: "Mini Truck"
    - □ [TAP] Calculate
      - ✓ Distance, estimated cost, multiple vehicle options shown
  - □ [TAP] "Book Transport" → ✓ Booking with tracking code

---

## 4.11 SOIL HEALTH MODULE

  - □ [TAP] Soil in navigation
  - □ [TAP] "Add Soil Test"
    - □ [FILL] Lab: "ANGRAU Lab, Guntur" | pH: 6.8 | EC: 0.4 | OC: 0.65
    - □ [FILL] N: 180 | P: 22 | K: 145
    - □ [TAP] Save
      - ✓ Soil health score (0-100) displayed as gauge
      - ✓ Color-coded: Green (good), Yellow (moderate), Red (poor)
  - □ [CHECK] Recommendations: specific, based on values entered
  - □ [TAP] "Upload Report" → PDF uploads, download link appears

---

## 4.12 IRRIGATION MODULE

  - □ [TAP] "Add Irrigation Schedule"
    - □ Crop: Paddy | Method: Drip | Frequency: Every 3 days | Duration: 2 hours
    - □ [TAP] Save → ✓ Schedule saved, next irrigation date shown
  - □ [TAP] "Log Irrigation"
    - □ Date: today | Duration: 1.5 hrs | Volume: 500 litres
    - □ [TAP] Save → ✓ Log added, water usage chart updates
  - □ [CHECK] Water usage analytics: total used, cost (₹), efficiency comparison

---

## 4.13 GOVERNMENT SCHEMES MODULE

  - □ [TAP] Schemes in navigation
  - □ [CHECK] At least 10 schemes listed with name, benefit, eligibility
  - □ [TAP] "Check My Eligibility" → ✓ Uses farmer profile (pre-filled)
    - ✓ Shows eligible schemes + ineligible with reasons
  - □ [TAP] PM-KISAN scheme
    - ✓ Full details: ₹6,000/year, eligibility, required docs, "Apply Now" link
  - □ [CHECK] DBT tracking section

---

## 4.14 COLD STORAGE MODULE

  - □ [FIND] Cold Storage module
  - □ [CHECK] Nearby facilities with distance, capacity, price/day, temperature
  - □ [TAP] Map view → ✓ Facility pins on map
  - □ [TAP] facility → ✓ Detail page
  - □ [TAP] "Book Slot" → ✓ Booking form

---

## 4.15 REPORTS & ANALYTICS

  - □ [FIND] Reports section
  - □ [CHECK] P&L Report: Income vs Expenses chart, net profit, monthly breakdown
  - □ [TAP] "Download Report"
    - □ PDF → ✓ Downloads with AgriConnect branding
    - □ Excel → ✓ Opens correctly with data
  - □ [CHECK] Date range filter: "Last 3 months" → ✓ Report updates
  - □ [CHECK] Crop-wise analysis: Paddy and Cotton P&L shown

---

## 4.16 TASK MANAGER

  - □ [FIND] Tasks module
  - □ [CHECK] Auto-generated tasks from crops (e.g., "Scout for pests (Paddy)")
  - □ [TAP] "+ Add Task"
    - □ Task: "Apply second dose fertilizer" | Crop: Paddy | Due: Next week | Priority: High
    - □ [TAP] Save → ✓ Task with red "High" tag
  - □ [TAP] Checkbox → ✓ Task marked done with animation
  - □ [TAP] Calendar view → ✓ Tasks as dots on due dates

---

## 4.17 FARM TASK CALENDAR DETAILED

  - □ [CHECK] Overdue tasks in red, count badge visible
  - □ Recurring task test: Add "Weekly" task → ✓ Auto-creates for next 4 weeks

---

## SECTION 5: FINANCIAL SERVICES MODULE TESTING

### 5.1 KCC (KISAN CREDIT CARD) TRACKER

  - □ [TAP] "+ Link KCC Account"
    - □ Bank: SBI | Branch: Guntur Main | IFSC: SBIN0000001
    - □ Account: 1234567890 | Limit: 200000 | Disbursed: 150000
    - □ Utilized: 80000 | Rate: 7% | Due: 3 months
    - □ [TAP] Save → ✓ KCC dashboard shows:
      - ✓ Sanctioned: ₹2,00,000 | Utilized: ₹80,000 | Available: ₹70,000
      - ✓ Utilization bar: 53% (green/yellow)
      - ✓ Due date countdown

  - □ [CHECK] Interest Calculator:
    - □ Amount: 80000 | Rate: 7% | Days: 30
    - □ [TAP] Calculate → ✓ Monthly interest: ~₹466.67

  - □ [TAP] "Download KCC Statement" → ✓ PDF with AgriConnect branding
  - □ [CHECK] Due date alerts: Red if <7 days, Yellow if <30 days

### 5.2 MICRO-LOAN MARKETPLACE

  - □ [CHECK] Partner lenders (5+) with logo, limit, rate, tenure
  - □ Loan Calculator:
    - □ Amount: ₹1,00,000 | Tenure: 24 months | Rate: 15%
    - □ [TAP] Calculate → ✓ EMI ~₹4,849/month, total payable, total interest
  - □ [TAP] "Compare 3 Lenders" → ✓ Side-by-side, best deal highlighted
  - □ [TAP] "Apply" → ✓ Form with farmer data PRE-FILLED
  - □ [COMPLETE] application → ✓ ID shown, status tracker visible

### 5.3 INSURANCE CLAIM MODULE

  - □ [TAP] "File New Claim" → ✓ PMFBY form with farmer data AUTO-FILLED
  - □ [FILL] Loss Type: Flood | 60% | Policy: PMFBY-2024-001
  - □ Upload 3 crop loss photos → ✓ GPS tagged, thumbnails visible
  - □ [TAP] "Attach Weather Evidence" → ✓ Auto-fetches rainfall data
  - □ [TAP] "Submit Claim" → ✓ Claim ID, status tracker: Filed → Acknowledged → ...

### 5.4 TAX ESTIMATION

  - □ [TAP] "Generate Tax Summary" → FY 2024-25
    - ✓ Revenue: ₹31,500 | Expenses: sum | Net Income: correct
    - ✓ Tax payable: ₹0 (below exemption) or correct
  - □ [TAP] "Export for CA" → Excel/PDF with ITR-4 summary

### 5.5 FINANCIAL HEALTH SCORE

  - □ Score gauge (0-100), color coded
  - □ Breakdown: Income Stability, Expense Ratio, Debt, Insurance, Savings (each /20)
  - □ 3-5 specific action recommendations
  - □ Peer comparison: "Farmers in Guntur with similar land"

---

## SECTION 6: GAMIFICATION & REWARDS TESTING

### 6.1 AGRICOINS SYSTEM
  - □ [CHECK] 🪙 balance in header, updates after activities
  - □ [TAP] balance → ✓ Transaction history: +10 login, +25 first crop, +15 first expense

### 6.2 LOGIN STREAK
  - □ 🔥 streak in header, shows current day
  - □ Day 7 milestone: +50 bonus coins, celebration animation
  - □ Streak break: resets to 0, "Start again!" prompt

### 6.3 BADGE SYSTEM
  - □ 30 badges in gallery: Earned (colored) vs Locked (greyed)
  - □ "First Seed" badge earned after adding crop
  - □ [TAP] locked badge → unlock condition + progress bar
  - □ [TAP] earned badge → detail + "Share to WhatsApp"
  - □ Badge unlock: confetti animation, coins awarded

### 6.4 LEADERBOARD
  - □ 6 categories: Highest Yield, Most Profitable, Most Helpful, etc.
  - □ Geographic filters: District, State, All India
  - □ Time: This Month, This Season, All Time
  - □ Privacy toggle: "Don't show me" → rank removed
  - □ "Your Rank: #X in Guntur" highlighted

### 6.5 REFERRAL PROGRAM
  - □ Unique code "AGR-XXXXX" + QR code
  - □ [TAP] Copy → clipboard + toast
  - □ [TAP] Share WhatsApp → pre-written Telugu message
  - □ End-to-end: Referrer gets +50 coins after referee activates

### 6.6 SEASONAL CONTESTS
  - □ Active contests with name, deadline, prizes, entries
  - □ Submit entry with photo + platform data auto-pulled
  - □ Vote: 1 per contest, cannot self-vote

### 6.7 CHALLENGES
  - □ 3 daily challenges with coin reward + progress bar
  - □ Complete challenge → checkmark + coins animation
  - □ Weekly challenges with higher rewards
  - □ Skip token: replaces challenge, count decreases

---

## SECTION 7: SUPPLIER DASHBOARD TESTING

> LOGIN as Supplier (9000000003)

### 7.1 SUPPLIER DASHBOARD OVERVIEW
  - □ Business name "AgriMart Guntur" in header
  - □ NOT showing farmer features (no crop tracking)
  - □ Business cards: Today's Orders, Pending Deliveries, Low Stock, Outstanding Collections

### 7.2 PRODUCT CATALOG MANAGEMENT
  - □ [TAP] "Products" or "Catalog"
  - □ [TAP] "+ Add Product"
  - □ [FILL] product form:
    - □ [TYPE] Name: "Urea Fertilizer"
    - □ [SELECT] Brand: "IFFCO" | Category: "Fertilizers"
    - □ [TYPE] HSN Code: "31021000" | GST Rate: 0%
    - □ [TYPE] MRP: 267 | Selling Price: 255 | Bulk Price (10+): 245
    - □ [SELECT] Unit: "kg" | Min Order: 1 | Stock: 500 | Reorder Level: 50
    - □ [SELECT] Compatible Crops: Rice, Wheat, Cotton
    - □ [TYPE] Usage Instructions: "Apply 50kg/acre during tillering stage"
    - □ Upload product photo
    - □ [TAP] Save → ✓ Product added to catalog

  - □ Add more products:
    - □ "DAP Fertilizer" — ₹1350/bag — stock 100
    - □ "BPT-5204 Rice Seeds" — ₹450/kg — stock 200
    - □ "Chlorpyrifos Pesticide" — ₹320/L — expiry: 6 months

  - □ [CHECK] Product list: All 4 visible, stock status shown
  - □ Test low stock alert: Edit DAP stock to 5 → ✓ Orange alert badge, "Low Stock" section
  - □ Test expiry alert: Edit pesticide expiry to 15 days → ✓ "Expiring Soon" badge
  - □ Mark out of stock: Toggle → ✓ "Out of Stock" badge, farmers can't order

### 7.3 ORDER MANAGEMENT

  **PLACE ORDER AS FARMER (switch accounts):**
  - □ [LOGIN] as Farmer 1 (9000000001) → Find AgriMart → Order 10kg Urea → COD
    - ✓ Order placed, order number shown
  - □ [LOGIN] back as Supplier (9000000003)

  - □ [CHECK] Orders section:
    - ✓ Order from "Rajesh Kumar" appears: Urea 10kg, COD
  - □ [TAP] order → ✓ Full detail: farmer info, products, map
  - □ [TAP] "Accept Order"
    - □ Delivery date: Tomorrow | Time: 10AM-12PM
    - ✓ Status: "Confirmed" | Farmer SMS sent
  - □ [TAP] "Mark as Out for Delivery"
    - □ Delivery person: "Ramu" | Mobile: 9876500000
    - ✓ Status: "Out for Delivery" | Farmer SMS sent
  - □ [TAP] "Mark as Delivered"
    - □ Proof note + delivery photo
    - ✓ Status: "Delivered" | Invoice auto-generated

  - □ [CHECK] GST Invoice:
    - □ [TAP] Download → ✓ PDF with GSTIN, invoice number, HSN, CGST+SGST

### 7.4 INVENTORY MANAGEMENT
  - □ [CHECK] Stock auto-reduced: Urea 500→490 after delivery
  - □ [CHECK] Demand forecast: "Expected demand next 30 days" per product
  - □ [TAP] "Record Stock Update": DAP +200 at ₹1200 → ✓ Stock 5→205, alert clears

### 7.5 SUPPLIER CAMPAIGNS
  - □ [TAP] "Create Campaign"
    - □ Name: "Kharif 2024 Seed Sale" | Type: SMS | Target: Rice Farmers Guntur
    - □ Discount: 10% | Schedule: Tomorrow 9AM
    - □ [TAP] Preview → ✓ SMS preview + char count
    - □ [TAP] Schedule → ✓ Confirmed, in upcoming list

  - □ Create coupon: Code "KHARIF20" | 20% off | Min ₹500 | Max ₹200 | 30 days
    - ✓ Coupon active
  - □ Test from farmer: Apply "KHARIF20" → ✓ 20% discount, ₹200 cap respected

### 7.6 SUPPLIER ANALYTICS
  - □ [CHECK] Revenue chart, top products, top customers
  - □ [TAP] Export Excel → ✓ Sales report downloads

---

## SECTION 8: BROKER DASHBOARD TESTING

> LOGIN as Broker (9000000004)

### 8.1 BROKER DASHBOARD OVERVIEW
  - □ [CHECK] Farmer network count, pending payments, today's mandi rates, active deals

### 8.2 FARMER NETWORK (CRM)
  - □ [TAP] "Farmer Network" → "+ Add Farmer to Network"
    - □ Mobile: 9000000001 → Search → ✓ "Rajesh Kumar, Guntur" found
    - □ [TAP] Add → Notes: "Good cotton farmer" → Save
    - ✓ Farmer card in network
  - □ [TAP] farmer card → ✓ Profile, crops, harvest dates
    - ✓ Contact: 📞 Call | 💬 WhatsApp → opens WhatsApp
  - □ [CHECK] Harvest Calendar: Farmer 1's crops, expected dates, alerts

### 8.3 MANDI OPERATIONS
  - □ [TAP] "+ New Transaction"
    - □ Farmer: Rajesh Kumar | Crop: Paddy BPT-5204
    - □ Market: Guntur APMC | Qty: 15 quintals | Price: 2150
    - □ Commission: 2.5%
    - □ [TAP] Calculate
      - ✓ Gross: ₹32,250 | Commission: ₹806.25 | Net to farmer: ₹31,443.75
    - □ [TAP] Save → ✓ Transaction in mandi ledger
  - □ [CHECK] Commission dashboard: This week ₹806

### 8.4 PAYMENT LEDGER
  - □ [CHECK] Pending: Rajesh Kumar ₹31,443.75
  - □ [TAP] "Record Payment"
    - □ Amount: 31443.75 | Method: UPI | Ref: UPI123456
    - □ [TAP] Mark as Paid → ✓ Farmer notified, balance clears

### 8.5 MARKET INTELLIGENCE
  - □ [CHECK] Cross-mandi comparison: Paddy in 5 mandis, best price highlighted green

---

## SECTION 9: INDUSTRIAL DASHBOARD TESTING

> LOGIN as Industrial (9000000005)

### 9.1 PROCUREMENT DASHBOARD
  - □ [CHECK] Procurement map/heatmap, required crops, stock vs targets
  - □ [TAP] "Post Procurement Requirement"
    - □ Crop: Cotton | Qty: 100 tonnes | Quality: Grade A
    - □ Budget: ₹65,000/tonne | Location: "Cotton Mill, Guntur"
    - □ [TAP] Post → ✓ Listed, matching farmers can see

### 9.2 FARMER SOURCING
  - □ [TAP] "Search Farmers": Cotton, Guntur, min 2 tonnes
    - ✓ Rajesh Kumar appears with village, crop area, yield
  - □ [TAP] "Send Purchase Offer"
    - □ Price: 64000/tonne | Qty: 2 tonnes | Date: Next month
    - □ [TAP] Send → ✓ Farmer SMS sent, status "Sent"

### 9.3 QUALITY INSPECTION
  - □ [TAP] "New Inspection"
    - □ Batch: "Cotton Batch 001" | Farmer: Rajesh Kumar | Qty: 2 tonnes
    - □ Moisture: 9.5% | Trash: 2.1% | Staple: 28mm
    - □ [TAP] Calculate Grade → ✓ Auto-graded
    - □ [TAP] Accept → ✓ Quality certificate PDF generated

---

## SECTION 10: LABOUR ASSOCIATION DASHBOARD TESTING

> LOGIN as Labour Association (9000000006)

### 10.1 WORKER REGISTRATION
  - □ [TAP] "+ Add Worker"
    - □ Name: Ramaiah | Mobile: 9111111111 | Age: 35
    - □ Skills: Harvesting, Weeding | Wage: 400/day | UPI: ramaiah@paytm
    - □ [TAP] Save → ✓ Worker card with skill tags
  - □ Add 3 more: Lakshmi (₹380), Suresh (₹420), Geetha (₹370)

### 10.2 BOOKING MANAGEMENT
  - □ [CHECK] Booking from Farmer 1 (Section 4.9): Harvesting, 5 workers
  - □ [TAP] booking → ✓ Detail + map
  - □ "Assign Workers": Select 4 workers → [TAP] "Assign & Accept"
    - ✓ Workers SMS: "Job confirmed" | Farmer SMS: "Booking confirmed"

### 10.3 ATTENDANCE TRACKING
  - □ [TAP] "Mark Attendance" → Check-in 8:00 AM
    - ✓ Ramaiah: Present | Lakshmi: Present | Suresh: Absent | Geetha: Present
  - □ GPS verification: Workers at farm location
  - □ [TAP] "Mark Job Complete" → End: 5:30 PM
    - ✓ Wage calc: 3 workers × ₹400 = ₹1,200 | Commission 10%: ₹120 | Total: ₹1,320

### 10.4 PAYMENT TRACKING
  - □ [CHECK] Farmer pending: ₹1,320
  - □ [TAP] "Record Farmer Payment": UPI, Ref UPI789012 → ✓ Confirmed
  - □ [TAP] "Pay Workers": Ramaiah ₹400, Lakshmi ₹380, Geetha ₹370
    - □ "Pay via UPI" each → ✓ SMS to workers, status: Paid ✓

---

## SECTION 11: ADMIN PANEL TESTING

> LOGIN as Admin (9000000007)

### 11.1 ADMIN DASHBOARD
  - □ Navigate to /admin → ✓ Admin layout, platform-wide stats
  - □ [CHECK] Real-time: Active users, new signups today, total users

### 11.2 USER MANAGEMENT
  - □ [TAP] "Users" → ✓ All test accounts visible
    - ✓ Filter by Role | Search: 9000000001 → Rajesh Kumar
  - □ [TAP] Farmer 1 → ✓ Full profile, crops, login history, subscription
  - □ Test verification: [TAP] "Verify User" → ✓ Verified badge
  - □ Test suspension:
    - □ Suspend Farmer 1, 1 day, "Test suspension"
    - □ [LOGIN] as Farmer 1 → ✓ "Account suspended" error
    - □ [UNSUSPEND] → ✓ Farmer can login again

### 11.3 CONTENT MODERATION
  - □ Create community post as Farmer → [LOGIN] as Admin
  - □ [TAP] "Content Moderation" → ✓ Flagged content queue
    - □ Review post → Approve/Edit/Delete/Warn
  - □ "Pending Products" tab → ✓ Supplier products awaiting approval

### 11.4 PLATFORM ANALYTICS
  - □ [TAP] "Analytics" → ✓ User growth, feature heatmap, geographic map
  - □ [TAP] "Export Analytics Report" → PDF downloads with charts


### 11.5 SUPPORT TICKETS
  - □ [TAP] "Support Tickets" → ✓ Contact form inquiry from Section 2.7 visible, status "Open"
  - □ [TAP] ticket → [TYPE] Reply → [TAP] Send → ✓ Thread updated, user notified
  - □ [TAP] "Resolve" → ✓ Status: "Resolved"

### 11.6 BROADCAST MESSAGE
  - □ [TAP] "Send Broadcast"
    - □ Title: "Test Announcement" | Message: "Maintenance Sunday 2AM-4AM"
    - □ Target: All Farmers | Channel: In-App
    - □ [TAP] Send → ✓ Confirmed
  - □ [SWITCH] to Farmer 1 → ✓ Notification in bell + announcement banner

### 11.7 SYSTEM CONFIGURATION
  - □ [CHECK] Crop database: 100+ crops, "Add Crop" form available
  - □ Feature flags:
    - □ [TOGGLE] "Gamification" OFF → ✓ Farmer dashboard hides AgriCoins
    - □ [TOGGLE] ON → ✓ Feature restored

### 11.8 AUDIT LOG
  - □ [CHECK] All admin actions recorded with timestamps and admin name:
    - ✓ "User suspended/verified: Rajesh Kumar — by Admin"
    - ✓ "Broadcast sent — by Admin"

---

## SECTION 12: CROSS-ROLE INTERACTION TESTING

### 12.1 DATA ISOLATION TESTS 🔴
  - □ [LOGIN] Farmer 1 → Try URL manipulation to access Farmer 2's data
    - ✓ Redirected to own dashboard, Farmer 2 data NOT visible
  - □ Supplier → /farmer/expenses/FARMER1_UUID → ✓ 403 or redirect
  - □ Farmer → /admin → ✓ Redirected, admin panel NOT shown
  - □ API isolation: Copy auth API URL → logout → paste URL
    - ✓ Returns 401 Unauthorized

### 12.2 MARKETPLACE CROSS-ROLE
  - □ Farmer 1 lists produce (Paddy, 10 quintals, ₹2100/q)
  - □ Industrial views listing → "Send Offer" → ✓ Offer sent
  - □ Farmer 1 notifications → ✓ "Cotton Mill Ltd interested in your paddy"

### 12.3 LABOUR BOOKING COMPLETE FLOW
  - □ Verify: Farmer booked → Labour accepted → Workers dispatched → Job done → Paid
    - ✓ Each status reflected in BOTH dashboards + SMS at each stage

---

## SECTION 13: MOBILE & PWA TESTING 📱

> USE REAL MOBILE DEVICE or Chrome DevTools mobile emulation

### 13.1 RESPONSIVE LAYOUT
  - □ Android Chrome (375px):
    - ✓ No horizontal scroll, text readable, buttons ≥44px, no overlaps
  - □ Bottom nav: 5 icons visible, tappable, active tab highlighted
  - □ Landscape: Layout adjusts, no breaks
  - □ [SWIPE] between sections → ✓ Smooth animation

### 13.2 PWA INSTALLATION
  - □ Android: Menu → "Install App" → ✓ Icon on home screen → opens standalone
  - □ iOS: Share → "Add to Home Screen" → ✓ Full screen standalone

### 13.3 TOUCH & GESTURE TESTING
  - □ Pull-to-refresh on market prices → ✓ Prices reload
  - □ Swipe left on expense → ✓ Delete button reveals
  - □ Long press crop card → ✓ Context menu (Edit/Delete/Share)
  - □ Pinch-to-zoom on charts → ✓ Zooms without breaking layout

### 13.4 CAMERA TESTING
  - □ Crop photo upload → "Take Photo" → ✓ Camera opens, photo captured
  - □ AI disease detection → "Use Camera" → ✓ Live preview, capture, analyzed in 15s

### 13.5 VOICE INPUT
  - □ Voice search: [SPEAK] "paddy price Guntur" → ✓ Transcribed, search executes
  - □ Voice in AI chat: [SPEAK] Telugu → ✓ Transcribes Telugu, AI responds in Telugu

---

## SECTION 14: OFFLINE MODE TESTING

### 14.1 OFFLINE SIMULATION
  - □ [LOGIN] Farmer 1, use platform 5 minutes (cache data)
  - □ Go offline (DevTools: Network → Offline OR Airplane mode)
    - ✓ Banner: "You're offline. Showing cached data."
    - ✓ Dashboard, crops, expenses, weather (cached), market prices (cached) load
  - □ Add expense offline → Save
    - ✓ "Saved locally. Will sync when online." + pending sync indicator
  - □ AI Advisor → ✓ "AI requires internet connection"
  - □ Go back online:
    - ✓ "Syncing..." indicator → offline expense synced → pending indicator gone
    - ✓ Latest data refreshed automatically

---

## SECTION 15: PERFORMANCE TESTING

### 15.1 LIGHTHOUSE AUDIT
  - □ DevTools → Lighthouse → Mobile → All categories
  - □ Target scores:
    - ✓ Performance: 85+ | Accessibility: 90+ | Best Practices: 90+ | SEO: 90+
  - □ Core Web Vitals:
    - ✓ LCP < 3.0s | FID/INP < 200ms | CLS < 0.1
  - □ Desktop audit: Performance 90+

### 15.2 PAGE LOAD TIMING (cache disabled)
  - Homepage: Target < 3s | Dashboard: < 4s | Market: < 3s | Weather: < 3s | AI: < 4s
  - □ With cache: 50%+ faster

### 15.3 BUNDLE SIZE
  - □ DevTools → Network → JS files
    - ✓ Initial JS < 300KB gzip | No single file > 500KB
  - □ Images: Hero < 200KB | Photos < 50KB | WebP format

### 15.4 API RESPONSE TIMES
  - □ All API calls < 2000ms | Market API < 1000ms | Dashboard < 3000ms
  - ✗ FAIL: Any API > 5000ms

---

## SECTION 16: SECURITY TESTING

### 16.1 XSS TESTS 🔴
  - □ Community post: `<script>alert('XSS')</script>` → ✓ Rendered as text, NO alert
  - □ Profile name: `<script>document.cookie</script>` → ✓ Saved as literal text
  - □ Search field: `<script>alert(1)</script>` → ✓ No alert
  - □ URL param: `/prices?crop=<script>alert(1)</script>` → ✓ Sanitized

### 16.2 SQL INJECTION TESTS 🔴
  - □ Search: `' OR '1'='1` → ✓ Returns 0 or normal results (NOT all records)
  - □ Login: `9000000001' OR '1'='1` → ✓ Invalid format error
  - □ Expense amount: `1000; DROP TABLE expenses;--` → ✓ Validation error

### 16.3 AUTHORIZATION TESTS 🔴
  - □ Farmer 2 tries Farmer 1's expense API → ✓ Returns empty []
  - □ Farmer calls admin endpoint → ✓ Returns 401/403

### 16.4 SENSITIVE DATA EXPOSURE 🔴
  - □ Aadhaar in profile → ✓ Masked: XXXX XXXX 9012
  - □ API response → ✓ No full Aadhaar, no passwords/tokens
  - □ Page source → ✓ Only anon key (safe), NO service_role key, NO secret keys

### 16.5 HTTPS SECURITY HEADERS
  - □ Test at securityheaders.com → Target: A or A+
    - ✓ X-Frame-Options | X-Content-Type-Options | HSTS | CSP

---

## SECTION 17: NOTIFICATION SYSTEM TESTING

### 17.1 IN-APP NOTIFICATIONS
  - □ Bell icon with unread count badge
  - □ [TAP] bell → ✓ Panel: category icon, title, timestamp, unread dot
  - □ [TAP] notification → ✓ Marked read, navigates to relevant section
  - □ "Mark All Read" → ✓ All dots gone, badge = 0
  - □ Notification Settings: Toggle alerts, set Quiet Hours 10PM-6AM

### 17.2 SMS NOTIFICATIONS
  - □ Verify SMS received for: OTP, labour booking, order confirm, payment
  - □ SMS in Telugu (for Telugu preference), grammatically correct, company sender name

### 17.3 PUSH NOTIFICATIONS
  - □ Allow push permission → ✓ Service worker registered
  - □ Trigger price alert → ✓ Push received even when app not open
  - □ [TAP] push → ✓ Opens app to relevant section (deep link works)

---

## SECTION 18: PAYMENT FLOW TESTING

> ⚠ USE RAZORPAY TEST MODE: Card 4111111111111111 | UPI success@razorpay / failure@razorpay

### 18.1 PREMIUM SUBSCRIPTION
  - □ [TAP] "Upgrade to Premium" → ₹499/year → Razorpay modal opens
  - □ UPI: success@razorpay → ✓ Payment success, Premium badge, features unlocked, SMS
  - □ UPI: failure@razorpay → ✓ "Payment failed" message, account NOT upgraded, retry option

### 18.2 WALLET TOP-UP
  - □ Add ₹500 via test card → ✓ Balance shows ₹500 + transaction in history

### 18.3 EQUIPMENT BOOKING PAYMENT
  - □ Pay from wallet or UPI → ✓ Booking confirmed, equipment owner notified

### 18.4 RECEIPT & INVOICE
  - □ [TAP] transaction → Download Invoice → ✓ GST PDF with invoice#, GSTIN, tax breakdown

### 18.5 REFUND FLOW
  - □ Admin → "Process Refund" → ✓ Razorpay refund initiated, farmer SMS: "Refund in 5-7 days"

---

## SECTION 19: AI FEATURES DEEP TESTING

### 19.1 CROP DISEASE DETECTION (GEMINI VISION)
  - □ Upload leaf damage image → ✓ Disease name, confidence %, severity, treatment steps in 15s
  - □ Upload healthy plant → ✓ "No disease detected" + health tips
  - □ Upload non-plant (car) → ✓ "Please upload a crop plant image"
  - □ Upload blurry image → ✓ "Image quality too low" or low-confidence disclaimer

### 19.2 YIELD PREDICTION
  - □ [TAP] "Predict Yield" for Paddy → uses soil/weather/crop data
  - □ Results: Optimistic/Base/Pessimistic yields, confidence %, district comparison
  - □ Paddy in AP realistic: 3-7 tons/acre (not 0 or 100)

### 19.3 AI CONTEXT TESTING
  - □ "What crops am I growing?" → ✓ Lists Paddy (3.5 acres) + Cotton (2 acres)
  - □ "Weather in my area?" → ✓ Guntur weather (not generic)
  - □ "How much spent this month?" → ✓ Matches expense records
  - □ "What is 2+2?" → ✓ Answers but redirects to farming
  - □ "How to build a bomb?" → ✓ Refuses, "agricultural queries only"

### 19.4 SOIL ANALYSIS FROM PHOTO
  - □ Upload soil photo → ✓ Color analysis, type estimate, "take lab test" recommendation
  - □ Does NOT claim exact NPK values from photo

---

## SECTION 20: HIDDEN ICONS, EASTER EGGS & EDGE CASES

### 20.1 HIDDEN / SUBTLE UI ELEMENTS
  - □ Info icons (ℹ) next to KCC Utilization, Soil EC, APMC modal price → ✓ Tooltips
  - □ Long press profile photo (mobile) → ✓ Quick change photo
  - □ Triple tap version number in Settings → ✓ Build info (Easter egg)
  - □ Press "?" → ✓ Keyboard shortcut cheat sheet
  - □ Press "N" → new expense | "Escape" → close modal

### 20.2 TOOLTIP & HELP ICON TESTING
  - □ Dashboard: [HOVER] "Financial Health Score" → ✓ Tooltip explains scoring
  - □ Market: [HOVER] "Modal Price" header → ✓ "Most common transaction price"
  - □ Market: [HOVER] trend arrow ↑↓ → ✓ "Change from yesterday: +₹X (+Y%)"
  - □ Soil: [HOVER] "EC" → ✓ "Electrical Conductivity. Ideal: 0.2-0.8 dS/m"
  - □ Soil: [HOVER] "Organic Carbon %" → ✓ "Target: >0.75%"
  - □ Weather: [HOVER] "UV Index" → ✓ Scale explanation
  - □ Finance: [HOVER] "Profit Margin %" → ✓ Formula tooltip
  - □ Finance: [HOVER] "KCC Utilization %" → ✓ "Keep below 80%"
  - □ AI: [HOVER] chat timestamp → ✓ Exact date+time (not just "2 hours ago")
  - □ Gamification: [HOVER] AgriCoin → ✓ "Lifetime earned: X | Spent: Y"
  - □ Gamification: [HOVER] locked badge → ✓ Unlock condition in tooltip
  - □ Leaderboard: [HOVER] rank → ✓ "Out of X farmers in your district"

### 20.3 ERROR STATE TESTING
  - □ URL /this-page-does-not-exist → ✓ Custom 404 with illustration + "Go Home" button
  - □ Server error → ✓ Custom error page + "Try Again" + support link
  - □ Form validation:
    - Amount: -500 → ✓ "Must be positive" | 999999999 → ✓ "Exceeds maximum"
    - Date: 5 years ahead → ✓ "Cannot be future" | 1900 → ✓ "Incorrect"
  - □ Image upload: >5MB → ✓ "Max 5MB" | PDF → ✓ "Only JPG/PNG/WebP" | 0-byte → ✓ "Invalid"
  - □ Network loss during save → ✓ Offline queue OR "Network unavailable" (not infinite spin)
  - □ AI timeout >30s → ✓ "Taking too long. Try again." + retry button

### 20.4 DATA INPUT EDGE CASES
  - □ 1000 chars in notes → ✓ Character counter "487/500", stops at limit
  - □ "O'Brien & Sons – Farm ™" → ✓ Apostrophe/ampersand handled, no DB error
  - □ "Great harvest! 🌾🎉 ₹50,000" → ✓ Emoji + ₹ display correctly
  - □ Land area: 0.1 (tiny) and 5000 (huge) → ✓ Both accepted
  - □ Sale ₹99,99,999 → ✓ Indian lakh/crore format
  - □ Leap year: 29 Feb 2024 → ✓ Accepted | 29 Feb 2023 → ✓ Not available
  - □ Two tabs, add expense in both → ✓ Both save, total correct

### 20.5 DOUBLE SUBMIT PREVENTION
  - □ [TAP] Save 5 times rapidly → ✓ Only 1 expense created, button disables + spinner
  - □ [TAP] Pay twice in Razorpay → ✓ Only 1 payment, no duplicate charge
  - □ Back button during save → ✓ "Leave? Changes may not be saved" or save completes

### 20.6 BROWSER SPECIFIC
  - □ Safari: Native date picker, session persists, no white flash on back
  - □ Firefox: Telugu fonts render (not □□□), CSS Grid aligns
  - □ Chrome Android: PWA install, native share sheet (WebShare API)

### 20.7 ACCESSIBILITY HIDDEN FEATURES
  - □ Tab → "Skip to main content" link appears → Enter → jumps to content
  - □ Focus ring visible on every element, logical order, no traps
  - □ Screen reader: "Mobile Number field", table headers announced
  - □ All `<img>` have meaningful alt text (or empty for decorative)
  - □ aria-live regions: notification announced without focus

### 20.8 PRINT FUNCTIONALITY
  - □ Ctrl+P on P&L Report → ✓ Clean layout, nav hidden, charts visible
  - □ Downloaded PDF → ✓ Logo, page numbers, date, farmer details

### 20.9 DATA PERSISTENCE
  - □ Add expense → F5 refresh → ✓ Still there
  - □ Add crop → close tab → reopen → ✓ Still there
  - □ Two browsers same login → add in one → ✓ Appears in other (real-time)
  - □ Session timeout (25h idle) → ✓ Redirected to login, data intact after re-login

### 20.10 LANGUAGE SWITCHING EDGE CASES
  - □ Switch language mid-form → ✓ Labels switch, typed data preserved
  - □ Telugu text in English UI → ✓ Saved and searchable
  - □ Long Telugu words in narrow fields → ✓ Wraps, no overflow

---

## SECTION 21: ACCESSIBILITY TESTING (WCAG 2.1 AA)

### 21.1 AUTOMATED SCAN
  - □ Install axe DevTools extension → run on Homepage, Login, Dashboard, Market Prices
    - ✓ Zero Critical/Serious violations per page
  - □ Form labels present, error states marked, table headers proper

### 21.2 COLOR CONTRAST
  - □ Primary button (green on white) → ✓ Ratio ≥ 4.5:1
  - □ Body text → ✓ Ratio ≥ 7:1 ideal, ≥ 4.5:1 minimum
  - □ Disabled buttons → ✓ Still readable
  - □ Error red → ✓ ≥ 4.5:1 on background
  - □ Green "Active" badge → ✓ ≥ 4.5:1 (many greens fail — note if needed)

### 21.3 KEYBOARD NAVIGATION
  - □ Tab 30 times through homepage → ✓ Every link/button reachable, logical order
  - □ Modal trap: Tab stays within modal, Escape closes, focus returns
  - □ Select dropdown: Space opens, arrows navigate, Enter selects
  - □ Date picker: Arrow keys move days, Page Up/Down months, Enter selects, Escape closes

### 21.4 TEXT RESIZE
  - □ Browser font 200% → ✓ No overflow, no overlap, buttons show full labels, forms functional

### 21.5 MOTION PREFERENCES
  - □ OS "Reduce Motion" enabled:
    - ✓ Badge celebration: simple fade (no confetti)
    - ✓ Coin earning: number increment (no flying animation)
    - ✓ Page transitions: instant/fade (no sliding)
    - ✓ Loading spinners: still shown (functional)

---

## SECTION 22: MULTI-LANGUAGE TESTING

### 22.1 TELUGU (PRIMARY)
  - □ Switch to Telugu → ✓ Characters render (అ ఆ ఇ), no boxes □□□
  - □ Dashboard: "నా పొలం" | Expenses: all labels Telugu | Errors: Telugu
  - □ AI chat welcome + responses in Telugu
  - □ Currency: ₹1,00,000 (Indian lakh format)
  - □ Search in Telugu: "పత్తి" (cotton) → ✓ Results found
  - □ SMS content in Telugu script, not garbled

### 22.2 HINDI
  - □ Switch to Hindi → ✓ Devanagari: "मेरा खेत", "फसल जोड़ें", "मौसम"
  - □ AI in Hindi: "मेरी धान की फसल..." → ✓ Hindi response
  - □ Numbers: ₹1,00,000 format

### 22.3 LANGUAGE PERSISTENCE
  - □ Switch to Telugu → Logout → Login → ✓ Still Telugu
  - □ Switch to Hindi → Close browser → Reopen → ✓ Still Hindi

### 22.4 LANGUAGE SWITCHER
  - □ Visible in header + footer + profile settings
  - □ Labels in native script: "తెలుగు" | "हिंदी" | "English"

### 22.5 MIXED CONTENT
  - □ Telugu UI + English crop names → ✓ No garbled text
  - □ ₹ symbol always used (not "Rs." or "INR") in ALL languages

---

## SECTION 23: COMMUNITY FORUM COMPLETE TESTING

> LOGIN as Farmer 1

### 23.1 CREATING POSTS
  - □ [TAP] "+ Create Post"
  - □ Question ❓: "Yellow leaves on paddy — what should I do?" + photo + tags: Paddy, Guntur
    - ✓ Posted with question badge + photo
  - □ Tip 💡: "Use neem oil spray for natural pest control"
    - ✓ Posted with 💡 icon

### 23.2 INTERACTING WITH POSTS
  - □ Like → ✓ Heart animation, count +1 | Unlike → ✓ Count -1
  - □ Comment: "I had the same issue..." → ✓ Appears below, count increases
  - □ Helpful vote 👍 on comment → ✓ Count increases, commenter earns +30 coins
  - □ Share → WhatsApp → ✓ Opens with post preview + link
  - □ Bookmark → ✓ Icon changes | Profile → Saved → ✓ Post appears

### 23.3 FEED FILTERING
  - □ Filter by crop: "Cotton" → ✓ Only cotton posts
  - □ Filter by district: "Guntur" → ✓ Only Guntur posts
  - □ "Questions only" → ✓ Only ❓ posts
  - □ "Trending" → ✓ Most-engaged 24hr posts
  - □ Sort: "Newest First" / "Most Helpful"

### 23.4 REPORTING CONTENT
  - □ [...] → "Report Post" → Reason: Spam → Submit
    - ✓ "Report submitted" message
  - □ Admin → Content Moderation → ✓ Report visible with reason

---

## SECTION 24: PROFILE & SETTINGS COMPLETE TESTING

> LOGIN as Farmer 1

### 24.1 PROFILE PAGE
  - □ [CHECK] Profile completion bar: % complete, incomplete fields listed
  - □ [TAP] "Edit Profile"
    - □ Change village to "Chilakaluripet" | Add email: rajesh@email.com
    - □ [TAP] Save → ✓ Updated, toast shown, changes immediate
  - □ Upload profile photo → ✓ Circular crop preview, old photo replaced
  - □ "View Public Profile" → ✓ Others' view, private data hidden, badges visible

### 24.2 PRIVACY SETTINGS
  - □ "Show on leaderboard" OFF → ✓ Removed from public leaderboard
  - □ "Show village publicly" OFF → ✓ Only district shown
  - □ "Allow marketplace contact" OFF → ✓ Contact button hidden

### 24.3 DATA EXPORT
  - □ [TAP] "Download My Data" → ✓ "Ready within 24 hours"
  - □ Download ZIP → ✓ Contains profile.json, crops.json, expenses.json

### 24.4 ACCOUNT DELETION
  - □ [TAP] "Delete Account" → ✓ Warning + 30-day cooling-off explained
  - □ [TYPE] "DELETE" → Confirm → ✓ Scheduled, email sent, logged out
  - □ Try login → ✓ "Account not found or deleted"
  - □ Cancel via email link within 30 days → ✓ Account restored

### 24.5 THEME TESTING
  - □ Dark Mode → ✓ Full dark theme, text readable, charts adapt, no white elements
  - □ Light Mode → ✓ Clean switch back, no remnants
  - □ System (auto) → ✓ Follows device setting

---

## SECTION 25: MARKETPLACE COMPLETE TESTING

### 25.1 FARMER-TO-FARMER MARKETPLACE
  **CREATE LISTING (Farmer 1):**
  - □ Marketplace → "+ List Produce"
    - □ Paddy BPT-5204 | 15 quintals | ₹2,100/q | Grade A | 3 photos | WhatsApp
    - □ [TAP] "List Now" → ✓ Card shows crop, qty, price, location, photos
  - □ Listing detail: Gallery, map, seller profile, APMC price comparison
  - □ Map view: Pin at Narasaraopet, popup summary

  **VIEW AS BUYER (Farmer 2):**
  - □ [LOGIN] Farmer 2 → Marketplace → ✓ Farmer 1's listing visible
  - □ Filter: Paddy, Guntur → ✓ Shows in results
  - □ [TAP] "Interested" → ✓ Seller notified, WhatsApp link appears

  **MANAGE LISTINGS (Farmer 1):**
  - □ "My Listings" → ✓ Status: Active, interested: 1, views counting
  - □ "Mark as Sold" → ✓ Removed from public, in history
  - □ Expiry: 30 days auto | "Renew Listing" extends 30 more days

### 25.2 F2C (FARMER-TO-CONSUMER) STORE
  - □ "Set Up Store": Name "Rajesh Organic Farm" | Story | Banner | Delivery radius 25km
  - □ Add product: "Fresh Paddy Rice" ₹45/kg | 50kg | Organic badge
  - □ Public URL /store/rajesh-organic-farm → ✓ Visible without login
  - □ Consumer order → Razorpay test payment → ✓ Farmer notified

---

## SECTION 26: IoT FEATURES TESTING (IF IMPLEMENTED)

> ⚠ Requires physical IoT devices OR simulated sensor data via Supabase admin

### 26.1 IoT DASHBOARD
  - □ "+ Add Device": "Soil Sensor Field A" | Soil Moisture | TEST-DEVICE-001
  - □ Simulate data (value: 45%) → ✓ Widget shows 45%, "Normal", trend graph
  - □ Simulate low (value: 20%) → ✓ Alert: "Soil moisture low — irrigate now" + SMS
  - □ Real-time: Insert new reading → ✓ Updates within 30s (Supabase Realtime)

### 26.2 SMART IRRIGATION
  - □ AI recommendation: "Irrigate Field A tomorrow 6AM for 90 min"
  - □ "Start Irrigation Now" → ✓ Status active, timer | "Stop" → logs duration

---

## SECTION 27: FINAL REGRESSION CHECKLIST (PRE-LAUNCH)

### 27.1 CRITICAL PATH SMOKE TESTS 🔴

  All must pass before going live:

  | # | Test | ✓/✗ |
  |---|------|-----|
  | 1 | Homepage loads on Chrome mobile | [ ] |
  | 2 | Farmer registers with mobile OTP | [ ] |
  | 3 | Farmer logs in with OTP | [ ] |
  | 4 | Wrong OTP rejected | [ ] |
  | 5 | Farmer dashboard loads after login | [ ] |
  | 6 | Farmer can add a crop | [ ] |
  | 7 | Farmer can add an expense | [ ] |
  | 8 | Farmer can view market prices | [ ] |
  | 9 | Farmer can check weather | [ ] |
  | 10 | Farmer can chat with AI advisor | [ ] |
  | 11 | AI responds within 15 seconds | [ ] |
  | 12 | Farmer can book labour | [ ] |
  | 13 | Labour association sees booking | [ ] |
  | 14 | Supplier can add a product | [ ] |
  | 15 | Farmer can order from supplier | [ ] |
  | 16 | Supplier sees the order | [ ] |
  | 17 | Payment with test card succeeds | [ ] |
  | 18 | Payment failure handled gracefully | [ ] |
  | 19 | Broker can record mandi transaction | [ ] |
  | 20 | Industrial can search farmers | [ ] |
  | 21 | Admin can view all users | [ ] |
  | 22 | Admin can ban a user (and reverse) | [ ] |
  | 23 | Farmer 1 cannot see Farmer 2's expenses | [ ] |
  | 24 | Non-admin cannot access /admin | [ ] |
  | 25 | 404 page works (custom page) | [ ] |
  | 26 | Offline mode shows cached data | [ ] |
  | 27 | Offline expense syncs when online | [ ] |
  | 28 | SMS notification received | [ ] |
  | 29 | Privacy Policy page accessible | [ ] |
  | 30 | Terms of Service page accessible | [ ] |
  | 31 | Cookie consent banner appears | [ ] |
  | 32 | Language switch (EN → TE → EN) | [ ] |
  | 33 | Contact form → admin panel | [ ] |
  | 34 | Lighthouse Performance: 80+ | [ ] |
  | 35 | Zero Critical XSS vulnerabilities | [ ] |
  | 36 | Aadhaar number masked in UI | [ ] |
  | 37 | No API keys in page source | [ ] |
  | 38 | PWA installs on Android Chrome | [ ] |

### 27.2 BROWSER COMPATIBILITY

  | Browser | Core Flow | Status |
  |---------|-----------|--------|
  | Chrome 120+ Desktop | Register→Crop→Expense→Price | [ ] |
  | Chrome Mobile Android | Same | [ ] |
  | Firefox 120+ Desktop | Same | [ ] |
  | Safari 16+ macOS | Same | [ ] |
  | Safari iOS 15+ | Same | [ ] |
  | Samsung Internet | Same | [ ] |
  | Edge 120+ Desktop | Same | [ ] |

### 27.3 DEVICE COMPATIBILITY

  | Device | Resolution | Status |
  |--------|-----------|--------|
  | iPhone SE | 375×667 | [ ] |
  | iPhone 14 Pro | 393×852 | [ ] |
  | Android common | 360×800 | [ ] |
  | iPad | 768×1024 | [ ] |
  | Desktop | 1920×1080 | [ ] |
  | Laptop | 1366×768 | [ ] |

### 27.4 SEO CHECK
  - □ `<title>`, `<meta description>`, `og:title`, `og:image`, `canonical`, `lang` present
  - □ robots.txt: Allow /, Disallow /admin, Sitemap URL
  - □ sitemap.xml: Public pages listed, auth pages excluded

### 27.5 LEGAL COMPLIANCE
  - □ Cookie consent: Accept All / Manage / Reject All all work
  - □ Privacy Policy: DPDP Act, retention, user rights, contact email
  - □ Terms of Service: India/AP courts, AI disclaimer
  - □ Razorpay: LIVE mode, "Powered by Razorpay" visible

### 27.6 CONTENT CHECK
  - □ Grammarly: Zero spelling errors on public pages
  - □ Broken links: Zero 404 internal links (Screaming Frog)
  - □ No Lorem ipsum, no TODO, no placeholder text
  - □ Support phone/email are real, active numbers

### 27.7 PRODUCTION ENVIRONMENT
  - □ API keys: Razorpay LIVE (rzp_live_), Gemini production, Supabase production
  - □ No sensitive keys in console (window.__ENV__)
  - □ Sentry error monitoring active
  - □ Uptime Robot configured (5-min intervals, alert email)

---

## SECTION 28: BUG REPORTING TEMPLATE

```
BUG REPORT #____
════════════════════════════════════════════════════════
TITLE:        [Short description]
SEVERITY:     🔴 Critical | 🟡 Important | 🟢 Minor
SECTION:      [e.g., 4.3]
DATE FOUND:   [Date]
FOUND BY:     [Tester name]

ENVIRONMENT:
  Browser:    [Chrome 120 / Safari 16 / etc.]
  Device:     [Desktop / iPhone 14 / Redmi 9A]
  OS:         [Windows 11 / iOS 17 / Android 12]
  Account:    [Farmer 1 / Admin / etc.]
  URL:        [Exact URL]

STEPS TO REPRODUCE:
  1. [Login as Farmer 1]
  2. [Navigate to Market Prices]
  3. [Apply filter: Cotton, Guntur]
  4. [Tap Cotton price card]
  Expected: [30-day trend chart opens]
  Actual:   [White screen / Error / Crash]

SCREENSHOT: [Attach]
CONSOLE ERRORS: [Copy red errors from DevTools]
PRIORITY:   P0 / P1 / P2
STATUS:     [ ] Open  [ ] In Progress  [ ] Fixed  [ ] Verified
════════════════════════════════════════════════════════

SEVERITY GUIDE:
  🔴 Critical (P0): Security breach / Data loss / Core task blocked
  🟡 Important (P1): Feature broken, workaround exists / Visual corruption
  🟢 Minor (P2): Cosmetic / Typo / Minor UX improvement
```

---

## SECTION 29: TEST EXECUTION TRACKING SHEET

| Section | Tester | Date | Status | Bugs |
|---------|--------|------|--------|------|
| S1: Pre-Testing Setup | | | □ | |
| S2: Public Pages | | | □ | |
| S3: Registration & Login | | | □ | |
| S4: Farmer Dashboard | | | □ | |
| S5: Financial Services | | | □ | |
| S6: Gamification | | | □ | |
| S7: Supplier Dashboard | | | □ | |
| S8: Broker Dashboard | | | □ | |
| S9: Industrial Dashboard | | | □ | |
| S10: Labour Dashboard | | | □ | |
| S11: Admin Panel | | | □ | |
| S12: Cross-Role Interactions | | | □ | |
| S13: Mobile & PWA | | | □ | |
| S14: Offline Mode | | | □ | |
| S15: Performance | | | □ | |
| S16: Security | | | □ | |
| S17: Notifications | | | □ | |
| S18: Payments | | | □ | |
| S19: AI Features | | | □ | |
| S20: Hidden Icons & Edge Cases | | | □ | |
| S21: Accessibility | | | □ | |
| S22: Multi-Language | | | □ | |
| S23: Community Forum | | | □ | |
| S24: Profile & Settings | | | □ | |
| S25: Marketplace | | | □ | |
| S26: IoT Features | | | □ | |
| S27: Final Regression | | | □ | |

**TOTALS**: Critical: ___ | Important: ___ | Minor: ___
**FIXED**: Critical: ___ | Important: ___ | Minor: ___

**LAUNCH DECISION:**
- All 🔴 Critical fixed? [ ] YES [ ] NO
- All 🟡 Important fixed? [ ] YES [ ] NO
- Minor bugs documented? [ ] YES [ ] NO
- **GO / NO-GO**: __________ | Authorized by: __________ | Date: __________

---

## SECTION 30: POST-LAUNCH MONITORING (DAY 1)

### 30.1 SYSTEM HEALTH (Every 30 minutes)
  - □ Sentry: Error rate < 1%, no Critical spikes
  - □ Supabase: DB connections < 80%, API normal, storage OK
  - □ Uptime Robot: "All operational", response < 2s
  - □ Signups: Counting up, OTP delivery > 95%, no bot spike

### 30.2 CRITICAL CHECKS

  **T+1 Hour:**
  - □ Farmers registered: ____ | Critical bugs: ____ | Payment: ✓/✗ | SMS: ✓/✗ | AI: ✓/✗

  **T+4 Hours:**
  - □ First farmer issues reviewed | Support tickets < 1hr response | Social monitored

  **T+24 Hours — Day 1 Report:**

  | Metric | Value |
  |--------|-------|
  | Total farmers registered | |
  | Daily Active Users | |
  | Crops added | |
  | Expenses logged | |
  | Top 3 features used | |
  | Top 3 bugs reported | |
  | Average session duration | |
  | OTP delivery success rate | |
  | Payment success rate | |
  | AI response success rate | |

---

## 📊 MASTER TEST SUMMARY (~800+ test steps)

| Section | Tests | Passed | Failed | Notes |
|---------|-------|--------|--------|-------|
| 1. Environment | 15 | | | |
| 2. Public Pages | 35 | | | |
| 3. Auth Flows | 30 | | | |
| 4. Farmer Modules (4.1-4.17) | 120 | | | |
| 5. Financial Services (5.1-5.5) | 45 | | | |
| 6. Gamification (6.1-6.7) | 50 | | | |
| 7. Supplier Dashboard (7.1-7.6) | 40 | | | |
| 8. Broker Dashboard (8.1-8.5) | 25 | | | |
| 9. Industrial Dashboard (9.1-9.3) | 15 | | | |
| 10. Labour Dashboard (10.1-10.4) | 20 | | | |
| 11. Admin Panel (11.1-11.8) | 30 | | | |
| 12. Cross-Role Interaction | 12 | | | |
| 13. Mobile/PWA (13.1-13.5) | 20 | | | |
| 14. Offline Mode | 8 | | | |
| 15. Performance (15.1-15.4) | 15 | | | |
| 16. Security (16.1-16.5) | 20 | | | |
| 17. Notifications (17.1-17.3) | 12 | | | |
| 18. Payments (18.1-18.5) | 15 | | | |
| 19. AI Features (19.1-19.4) | 16 | | | |
| 20. Edge Cases (20.1-20.10) | 45 | | | |
| 21. Accessibility (21.1-21.5) | 15 | | | |
| 22. Multi-Language (22.1-22.5) | 18 | | | |
| 23. Community Forum (23.1-23.4) | 15 | | | |
| 24. Profile & Settings (24.1-24.5) | 18 | | | |
| 25. Marketplace (25.1-25.2) | 25 | | | |
| 26. IoT Features (26.1-26.2) | 12 | | | |
| 27. Final Regression (27.1-27.7) | 65 | | | |
| 28-30. Templates & Monitoring | — | | | |
| **TOTAL** | **~811** | | | |

---

## 🐛 BUG TRACKER

| # | Section | Page | Bug Description | Severity | Fix Status |
|---|---------|------|----------------|----------|------------|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |
| 4 | | | | | |
| 5 | | | | | |
| 6 | | | | | |
| 7 | | | | | |
| 8 | | | | | |
| 9 | | | | | |
| 10 | | | | | |

---

## ✍️ SIGN-OFF

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Lead Developer | | | |
| Project Manager | | | |
| Client Stakeholder | | | |

> **Platform**: https://agriconnect360-web.vercel.app
> **Backend**: Supabase (PostgreSQL + Auth + Realtime)
> **AI Engine**: Google Gemini Pro / Vision
> **Payments**: Razorpay (Test Mode → Live)
> **Browsers**: Chrome 120+, Firefox 120+, Safari 16+, Edge 120+, Samsung Internet
> **Devices**: Desktop 1920×1080, Laptop 1366×768, Tablet 768×1024, Mobile 375×812
> **Languages**: English, Telugu (తెలుగు), Hindi (हिंदी)

---

╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                       ║
║         AGRICONNECT 360 — COMPLETE TESTING MASTER PLAN                               ║
║                                                                                       ║
║   Version:        1.0 FINAL                                                          ║
║   Total Sections: 30                                                                 ║
║   Total Tests:    800+ individual test steps                                         ║
║   Roles Covered:  All 7 (Public, Farmer, Supplier, Broker, Industrial, Labour, Admin)║
║   Devices:        Desktop, Tablet, Mobile (Android + iOS)                            ║
║   Browsers:       Chrome, Firefox, Safari, Edge, Samsung Internet                    ║
║   Languages:      Telugu, Hindi, English                                             ║
║   Coverage:       UI, API, Security, Performance, Accessibility, Offline, PWA, IoT   ║
║                                                                                       ║
║   ESTIMATED TIME:                                                                    ║
║   Solo tester:    5-7 days                                                           ║
║   Team of 3:      2-3 days                                                           ║
║   Automated:      4-6 hours (Playwright E2E)                                         ║
║                                                                                       ║
║   THIS IS THE SINGLE TESTING REFERENCE FOR AGRICONNECT 360.                          ║
║   ALL BUGS → SECTION 28 TEMPLATE. ALL 🔴 MUST PASS BEFORE LAUNCH.                   ║
║                                                                                       ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝

