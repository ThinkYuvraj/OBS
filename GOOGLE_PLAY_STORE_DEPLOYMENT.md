# MarketinGlu OBS — Google Play Store Deployment & Mobile Guide

This document outlines how to build, test, and release the **MarketinGlu OBS Live Sports ScoreBug** app to the **Google Play Store** as an official Android App Bundle (`.aab`) or standalone APK.

---

## 1. App Identifiers & Metadata

- **Package Name (Application ID)**: `com.marketinglu.obs.scorebug`
- **App Name**: MarketinGlu OBS - Live Sports ScoreBug
- **Short Name**: MarketinGlu
- **Theme Color**: `#070b14` (Deep Space Dark)
- **Primary Accent**: `#06b6d4` (Neon Cyan)
- **Category**: Sports / Video Players & Editors / Utilities
- **Content Rating**: Everyone (PEGI 3)

---

## 2. Option A: Build Android App Bundle (.aab) via Capacitor (Recommended)

Capacitor bridges the production-tested React/Vite/TypeScript web application into an official native Android Studio project with full hardware-accelerated WebViews, splash screens, and Android status bar controls.

### Prerequisites:
- Node.js 18+
- Android Studio Iguana+ / Ladybug+
- Android SDK 34+ (Android 14 / 15)

### Steps to Build:
```bash
# 1. Build the production client bundle
npm run build:client

# 2. Install Capacitor CLI & Android platform (if not already installed)
npm install @capacitor/core
npm install -D @capacitor/cli @capacitor/android

# 3. Add Android native project platform
npx cap add android

# 4. Sync web assets (dist/) into the Android project
npx cap sync android

# 5. Open project in Android Studio
npx cap open android
```

### In Android Studio:
1. Go to **Build** -> **Generate Signed Bundle / APK**.
2. Select **Android App Bundle (`.aab`)**.
3. Choose your release keystore (or create a new keystore: `keytool -genkey -v -keystore release-key.jks -alias marketinglu -keyalg RSA -keysize 2048 -validity 10000`).
4. Select build variant: **release**.
5. Output location: `android/app/release/app-release.aab`.

---

## 3. Option B: React Native Android Native Wrapper

A standalone React Native wrapper shell is provided in the `mobile/` directory:

```bash
cd mobile
npm install

# Run on Android Emulator or connected device
npm run android

# Build production Android App Bundle via Gradle
npm run build:android
```

The output `.aab` will be generated at:
`mobile/android/app/build/outputs/bundle/release/app-release.aab`

---

## 4. Google Play Console Submission Checklist

1. **Create App in Google Play Console**:
   - Go to [Google Play Console](https://play.google.com/console).
   - Click **Create app**.
   - App Name: `MarketinGlu OBS - Live Sports ScoreBug`.
   - Default language: English (United States) / English (India).
   - App or game: **App**.
   - Free or paid: **Free** (with In-App Passes / Razorpay integration).

2. **Store Listing Assets**:
   - **App Icon**: 512 x 512 px 32-bit PNG (`public/marketinglu-emblem-dark.png`).
   - **Feature Graphic**: 1024 x 500 px JPEG or 24-bit PNG.
   - **Screenshots**: At least 4 phone screenshots (16:9 or 9:16) capturing:
     - ICC Cricket Scoring Console with DLS calculator.
     - Multi-Sport Engine (Football, Basketball, Kabaddi).
     - Movable OBS Browser Source Scorebug.
     - Rate Us & Community Reviews showcase.

3. **App Content & Policies**:
   - **Privacy Policy URL**: `https://marketinglu.com/privacy` or your deployed URL `/policies`.
   - **App Access**: All functionality is available without special credentials (or supply test login credentials).
   - **Ads**: Declare whether your app contains ads (No).
   - **Target Audience**: 13 and older / General sports audiences.
   - **Data Safety**:
     - Data collected: User email & name (for support tickets and reviews).
     - Encrypted in transit: Yes (HTTPS / WSS).

4. **Upload Release**:
   - Navigate to **Release** -> **Production** -> **Create new release**.
   - Upload `app-release.aab`.
   - Release notes:
     ```
     v1.0.0 Release Notes:
     - Real-time sub-second sports scoring engine for OBS & vMix
     - 11 supported sports including Cricket, Football, Basketball & Kabaddi
     - Movable broadcast scorebug with URL position queries (?pos=...)
     - Official rule books, team rosters, and client help desk
     - Google Play in-app review and community rating system
     ```
   - Click **Review release** and **Start rollout to Production**.

---

## 5. Mobile Responsiveness Improvements Implemented

- Added Android-style **Native Bottom Navigation Bar** on mobile devices (`Home`, `Cricket`, `Sports`, `Rules`, `Rate Us`).
- Added responsive **Mobile Slide-Over Drawer** for fast access to operator profile, passes, overlay controls, and help desk.
- Added viewport configuration `viewport-fit=cover`, `user-scalable=no`, and safe area insets `pb-safe`.
- Prevented horizontal scrolling overflow across all screens (`overflow-x-hidden`).
- Wrapped scorecard tables with horizontal swipe containers.
- Re-flowed situation boards and scoring keypads into touch-friendly mobile grids.
