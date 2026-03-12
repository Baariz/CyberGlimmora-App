# CyberGlimmora Mobile App — Project Guide

## What This Is
React Native (Expo SDK 52) mobile app for the CyberGlimmora cybersecurity platform. Works on both Android and iOS from a single codebase. Currently uses mock data (no real backend).

## Tech Stack
- **Framework:** React Native with Expo SDK 52 (managed workflow)
- **Language:** TypeScript
- **Navigation:** React Navigation v6 (bottom tabs + native stack)
- **State:** React Context (AuthContext, AlertContext)
- **Storage:** AsyncStorage (via src/utils/storage.ts)
- **Icons:** @expo/vector-icons (Ionicons)
- **Charts:** react-native-svg (custom SVG charts)
- **Node.js:** v18 LTS required (use `nvm use 18`)

## Project Structure
```
CyberGlimmora-App/
├── App.tsx                    # Entry point (providers + navigator)
├── app.json                   # Expo config
├── eas.json                   # EAS Build config (APK/iOS)
├── src/
│   ├── theme/colors.ts        # All colors, spacing, shadows, fonts
│   ├── utils/
│   │   ├── storage.ts         # AsyncStorage wrapper
│   │   └── helpers.ts         # timeAgo, formatDate, truncate, etc.
│   ├── types/index.ts         # All TypeScript interfaces (unified)
│   ├── mock-data/             # 20 .ts files with mock data
│   ├── services/              # 10 service files + index.ts barrel
│   ├── contexts/
│   │   ├── AuthContext.tsx     # Login/logout, user state, permissions
│   │   └── AlertContext.tsx    # Scam alerts, threat level
│   ├── components/            # 10 reusable components + index.ts
│   ├── navigation/
│   │   ├── AppNavigator.tsx   # Root: Login vs Main stack
│   │   └── MainTabNavigator.tsx # Bottom tabs + More stack
│   └── screens/
│       ├── auth/LoginScreen.tsx
│       ├── dashboard/DashboardScreen.tsx
│       ├── scam/ScamDetectionScreen.tsx
│       ├── assistant/AssistantScreen.tsx
│       ├── guardian/GuardianScreen.tsx
│       ├── identity/IdentityScreen.tsx
│       ├── risk/RiskScoreScreen.tsx
│       ├── device/DeviceScreen.tsx
│       ├── journey/JourneyScreen.tsx
│       ├── digital-twin/DigitalTwinScreen.tsx
│       └── settings/SettingsScreen.tsx
```

## Theme Colors
- Primary: #059669 (Emerald Green)
- Primary Dark: #065F46
- Primary Mid: #0D9488
- Danger: #DC2626
- Warning: #F59E0B
- Page BG: #F0FDF4
- Card BG: #FFFFFF

## Demo Accounts
- individual@demo.com / demo123 (Basic plan, no Guardian access)
- family@demo.com / demo123 (Family plan, all modules)

## Navigation Structure
Bottom Tabs: Dashboard | Scam Shield | Assistant | Guardian | More
More Stack: Identity, Risk Score, Device, Journey, Digital Twin, Settings

## Key Commands
```bash
nvm use 18                     # Switch to Node 18 (required)
npm install                    # Install dependencies
npx expo start                 # Start dev server (scan QR with Expo Go)
npx eas-cli build -p android --profile preview   # Build APK (cloud)
npx eas-cli build -p ios --profile preview        # Build iOS (cloud)
```

## How to Update & Rebuild APK
1. Make your code changes
2. Run `npx expo start` to test locally with Expo Go app
3. When ready, run: `npx eas-cli build -p android --profile preview`
4. Wait ~10-15 min for cloud build
5. Download APK from the link provided

## EAS Project
- Owner: vaigai
- Project: @vaigai/cyberglimmora
- Project ID: b4dfb717-0e99-4277-a698-58d175167bab

## Important Notes
- All data is mock (services use setTimeout to simulate API calls)
- Maps use placeholder views (no Google Maps API key)
- expo-speech is in dependencies but NOT in plugins (causes build errors)
- Assets are solid emerald green PNGs (replace with real logos later)
- React Navigation v6 (NOT v7) — keep imports from @react-navigation/*
