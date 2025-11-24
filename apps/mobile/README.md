# OJ Investment Platform - Mobile App

React Native mobile application for the OJ Investment Platform, built with Expo.

## 📱 Features

- **Authentication** with biometric support (Face ID / Touch ID)
- **Dashboard** with portfolio overview and performance metrics
- **Projects** listing and filtering
- **Portfolio** management with investment tracking
- **Secure** token storage using Expo SecureStore
- **Real-time** data with GraphQL and Apollo Client

## 🛠️ Tech Stack

- **React Native** 0.73
- **Expo** ~50.0
- **TypeScript** 5.3
- **Apollo Client** for GraphQL
- **React Navigation** for routing
- **Expo SecureStore** for secure token storage
- **Expo Local Authentication** for biometric auth

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac only) or Android Emulator
- Expo Go app on your physical device (optional)

### Installation

```bash
# Navigate to mobile directory
cd apps/mobile

# Install dependencies
npm install

# Start development server
npm start
```

### Running the App

```bash
# iOS Simulator (Mac only)
npm run ios

# Android Emulator
npm run android

# Web browser
npm run web

# Or scan QR code with Expo Go app
npm start
```

## 📁 Project Structure

```
mobile/
├── src/
│   ├── screens/          # App screens
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── ProjectsScreen.tsx
│   │   └── PortfolioScreen.tsx
│   ├── components/       # Reusable components
│   ├── navigation/       # Navigation configuration
│   ├── services/         # API and services
│   │   └── apollo.ts     # Apollo Client setup
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── assets/           # Images, fonts, etc.
├── App.tsx              # Main app component
├── app.json             # Expo configuration
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript config
```

## 🔧 Configuration

### API Endpoint

Set the backend API URL in `src/services/apollo.ts`:

```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/graphql';
```

Or create a `.env` file:

```bash
EXPO_PUBLIC_API_URL=https://api.example.com/graphql
```

### Biometric Authentication

The app automatically detects and enables biometric authentication (Face ID/Touch ID) if:
1. Device has biometric hardware
2. User has enrolled biometric credentials
3. User enables biometric login in settings

## 📱 Screens

### Login Screen
- Email/password authentication
- Biometric login support
- Remember credentials securely
- Registration link

### Dashboard Screen
- Portfolio overview card
- Available balance display
- Performance metrics
- Active investments preview
- Featured projects
- Pull to refresh

### Projects Screen
- Browse all active projects
- Search and filter projects
- Project cards with key metrics
- Direct investment CTA
- Category badges
- Progress indicators

### Portfolio Screen
- Complete investment list
- Portfolio summary with total invested/returns
- Individual investment cards
- Performance tracking
- Gain/loss calculations
- Investment status badges

## 🎨 Styling

The app uses a consistent color scheme:
- **Primary**: `#0066CC` (Blue)
- **Success**: `#00CC66` (Green)
- **Error**: `#CC0000` (Red)
- **Background**: `#f5f5f5` (Light Gray)
- **Text**: `#333` (Dark Gray)

## 🔐 Security

- JWT tokens stored in Expo SecureStore (encrypted)
- Biometric authentication for quick access
- Automatic token refresh handling
- Secure GraphQL mutations
- No sensitive data in logs

## 📊 GraphQL Queries

### Dashboard Query
```graphql
query Dashboard {
  me {
    id
    firstName
    wallet {
      balance
      totalInvested
      totalReturns
    }
    investments {
      id
      amount
      currentValue
      project {
        name
      }
    }
  }
  projects(limit: 3, status: ACTIVE) {
    id
    name
    progressPercent
  }
}
```

### Projects Query
```graphql
query Projects {
  projects(status: ACTIVE) {
    id
    name
    category
    targetAmount
    raisedAmount
    expectedReturn
  }
}
```

### Portfolio Query
```graphql
query Portfolio {
  me {
    wallet {
      totalInvested
      totalReturns
    }
    investments {
      id
      amount
      currentValue
      status
      project {
        name
      }
    }
  }
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

## 📦 Building for Production

### iOS

```bash
# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Or create production build
npm run build:ios
```

### Android

```bash
# Build for Android
eas build --platform android

# Or create production build
npm run build:android
```

## 🐛 Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache
expo start -c

# Or manually
rm -rf node_modules
npm install
```

### iOS Build Issues
```bash
# Clean iOS build
cd ios && pod install && cd ..
```

### Android Build Issues
```bash
# Clean Android build
cd android && ./gradlew clean && cd ..
```

## 📝 Environment Variables

Create a `.env` file:

```bash
# API Configuration
EXPO_PUBLIC_API_URL=https://api.example.com/graphql

# Feature Flags
EXPO_PUBLIC_ENABLE_BIOMETRIC=true
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true

# Analytics
EXPO_PUBLIC_ANALYTICS_KEY=your-analytics-key
```

## 🚀 Deployment

### Expo Application Services (EAS)

```bash
# Login to Expo
eas login

# Configure project
eas build:configure

# Submit to App Store
eas submit --platform ios

# Submit to Play Store
eas submit --platform android
```

## 📱 App Store Guidelines

### iOS
- Minimum iOS version: 13.0
- Supports iPhone and iPad
- Face ID usage description in Info.plist
- Camera usage description for KYC

### Android
- Minimum SDK: 21 (Android 5.0)
- Target SDK: 33 (Android 13)
- Required permissions: CAMERA, USE_BIOMETRIC

## 🔄 Updates

### Over-the-Air (OTA) Updates

```bash
# Publish update
eas update --branch production

# View updates
eas update:list
```

## 📞 Support

For issues or questions:
- Check the [main README](../../README.md)
- Open an issue on GitHub
- Contact the development team

## 📄 License

This project is part of the OJ Investment Platform.
