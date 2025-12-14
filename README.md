# Proxy - Social Discovery App

A location-based social discovery app that helps you connect with people you cross paths with. Perfect for social events, parties, and spontaneous encounters.

## Features

### Core Functionality
- **Discover Nearby Users** - Turn on Proxy to see active users within your range
- **Proximity Settings** - Filter by venue, nearby (~50ft), neighborhood, or city
- **Send Interest** - Express interest in someone you find intriguing
- **Connections** - Track pending, accepted, and declined interests
- **In-App Messaging** - Chat with accepted connections directly in the app
- **History** - View people you've crossed paths with throughout the evening
- **Profile with Socials** - Link Instagram, Twitter/X, Snapchat, and TikTok (visible only after connection)

### User Flow
1. **Onboarding** - Create your profile with name, age, bio, and photo
2. **Link Socials** - Optionally connect your social media accounts
3. **Activate Proxy** - Toggle on to become visible and see others nearby
4. **Set Proximity** - Choose how close people need to be to discover them
5. **Send Interest** - Tap a user card to view their profile and send interest
6. **Wait for Response** - They can accept or decline
7. **Connect & Chat** - If accepted, send messages and view their socials

## App Structure

```
src/
├── navigation/
│   └── RootNavigator.tsx      # Main navigation with auth flow
├── screens/
│   ├── WelcomeScreen.tsx      # Landing/splash screen
│   ├── ProfileSetupScreen.tsx # Profile creation
│   ├── SocialsSetupScreen.tsx # Social media linking
│   ├── RadarScreen.tsx        # Main discovery screen with proximity filter
│   ├── ConnectionsScreen.tsx  # View connections & message history
│   ├── ChatScreen.tsx         # In-app messaging interface
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

## Proximity Levels

- **Same Venue** (~15m) - People at your exact location
- **Nearby** (~50m) - People within about 50 feet
- **Same Area** (~500m) - People in your neighborhood
- **Same City** (~50km) - Everyone in your city

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
- Connections list with location data
- Conversations and messages
- Crossed paths history

## Future Enhancements
- Real-time location tracking
- Push notifications for messages and interest responses
- Profile verification
- Event mode for specific venues
