# Proxy - Social Discovery App

A location-based social discovery app that helps you connect with people you cross paths with. Perfect for social events, parties, and spontaneous encounters.

## Features

### Core Functionality
- **Discover Nearby Users** - Turn on Proxy to see active users within your range
- **Send Interest** - Express interest in someone you find intriguing
- **Connections** - Track pending, accepted, and declined interests
- **History** - View people you've crossed paths with throughout the evening
- **Profile with Socials** - Link Instagram, Twitter/X, Snapchat, and TikTok

### User Flow
1. **Onboarding** - Create your profile with name, age, bio, and photo
2. **Link Socials** - Optionally connect your social media accounts
3. **Activate Proxy** - Toggle on to become visible and see others nearby
4. **Send Interest** - Tap a user card to view their profile and send interest
5. **Wait for Response** - They can accept or decline
6. **Connect** - If accepted, view their linked socials to connect further

## App Structure

```
src/
├── navigation/
│   └── RootNavigator.tsx      # Main navigation with auth flow
├── screens/
│   ├── WelcomeScreen.tsx      # Landing/splash screen
│   ├── ProfileSetupScreen.tsx # Profile creation
│   ├── SocialsSetupScreen.tsx # Social media linking
│   ├── RadarScreen.tsx        # Main discovery screen
│   ├── ConnectionsScreen.tsx  # View all connections
│   ├── HistoryScreen.tsx      # Crossed paths history
│   ├── ProfileScreen.tsx      # User's own profile
│   └── UserDetailScreen.tsx   # View other user's profile
├── state/
│   └── proxyStore.ts          # Zustand store for app state
├── types/
│   └── proxy.ts               # TypeScript type definitions
└── utils/
    └── cn.ts                  # Tailwind class merge utility
```

## Design System

### Colors
- **Primary Coral**: #FF6B6B
- **Secondary Peach**: #FF8E72
- **Accent Pink**: #FFB4A2
- **Background Warm**: #FFF9F5
- **Text Dark**: #2D2D2D

### UI Components
- Rounded cards with soft shadows
- Gradient headers and buttons
- Pulsing radar animations when active
- Smooth transitions and micro-interactions
- Haptic feedback on interactions

## State Management

Using Zustand with AsyncStorage persistence for:
- User profile data
- Onboarding status
- Proxy active state
- Connections list
- Crossed paths history

## Future Enhancements
- Real-time location tracking
- Push notifications for interest responses
- In-app messaging
- Profile verification
- Event mode for specific venues
