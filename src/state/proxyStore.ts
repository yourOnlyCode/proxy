import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  UserProfile,
  SocialLinks,
  NearbyUser,
  Connection,
  CrossedPath,
  ConnectionLocation,
  ProximityLevel,
} from "../types/proxy";

// Mock data for nearby users - expanded with location info and varied distances
const mockNearbyUsers: NearbyUser[] = [
  // Same Venue (0-15m / ~50ft) - People at your exact location
  {
    id: "1",
    name: "Alex Rivera",
    age: 24,
    bio: "Music lover. Coffee enthusiast. Always down for spontaneous adventures.",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    socials: { instagram: "alexrivera", snapchat: "alexr" },
    isActive: true,
    lastSeen: new Date(),
    distance: 5,
    latitude: 40.7484,
    longitude: -73.9857,
    venue: "The Rooftop Bar",
    neighborhood: "Chelsea",
    city: "New York City",
  },
  {
    id: "2",
    name: "Jordan Chen",
    age: 26,
    bio: "Photographer by day, DJ by night. Let's create memories!",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
    socials: { instagram: "jordanshots", twitter: "jchen" },
    isActive: true,
    lastSeen: new Date(),
    distance: 8,
    latitude: 40.7484,
    longitude: -73.9857,
    venue: "The Rooftop Bar",
    neighborhood: "Chelsea",
    city: "New York City",
  },
  {
    id: "3",
    name: "Sam Taylor",
    age: 23,
    bio: "Art student. Dog parent. Looking for good vibes only.",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=face",
    socials: { instagram: "samtaylor.art", tiktok: "samtaylor" },
    isActive: true,
    lastSeen: new Date(),
    distance: 12,
    latitude: 40.7484,
    longitude: -73.9857,
    venue: "The Rooftop Bar",
    neighborhood: "Chelsea",
    city: "New York City",
  },

  // Nearby (15-50m / ~50-165ft) - People very close by
  {
    id: "4",
    name: "Riley Morgan",
    age: 25,
    bio: "Tech nerd who loves dancing. Yes, both can coexist.",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face",
    socials: { instagram: "rileymorgan", snapchat: "riley_m" },
    isActive: true,
    lastSeen: new Date(),
    distance: 25,
    latitude: 40.7486,
    longitude: -73.9855,
    venue: "Lobby Lounge",
    neighborhood: "Chelsea",
    city: "New York City",
  },
  {
    id: "5",
    name: "Casey Williams",
    age: 27,
    bio: "Foodie exploring the city. Always hungry, always curious.",
    photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face",
    socials: { instagram: "caseyfoodie", twitter: "caseyw" },
    isActive: true,
    lastSeen: new Date(),
    distance: 35,
    latitude: 40.7486,
    longitude: -73.9855,
    venue: "Lobby Lounge",
    neighborhood: "Chelsea",
    city: "New York City",
  },
  {
    id: "6",
    name: "Morgan Blake",
    age: 24,
    bio: "Startup founder by day, karaoke star by night.",
    photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    socials: { instagram: "morganblake", twitter: "mblake" },
    isActive: true,
    lastSeen: new Date(),
    distance: 42,
    latitude: 40.7487,
    longitude: -73.9854,
    venue: "Street Corner",
    neighborhood: "Chelsea",
    city: "New York City",
  },

  // Same Neighborhood (50-500m / ~0.3 miles) - People in your area
  {
    id: "7",
    name: "Taylor Kim",
    age: 28,
    bio: "Yoga instructor. Plant mom. Sunset chaser.",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    socials: { instagram: "taylorkimyoga", tiktok: "taykim" },
    isActive: true,
    lastSeen: new Date(),
    distance: 120,
    latitude: 40.7490,
    longitude: -73.9850,
    venue: "High Line Park",
    neighborhood: "Chelsea",
    city: "New York City",
  },
  {
    id: "8",
    name: "Jamie Cruz",
    age: 26,
    bio: "Aspiring chef. Netflix connoisseur. Dog person.",
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
    socials: { instagram: "jamiecruz", snapchat: "jcruz" },
    isActive: true,
    lastSeen: new Date(),
    distance: 250,
    latitude: 40.7495,
    longitude: -73.9845,
    venue: "Chelsea Market",
    neighborhood: "Chelsea",
    city: "New York City",
  },
  {
    id: "9",
    name: "Avery Thompson",
    age: 25,
    bio: "Writer. Coffee addict. Looking for my next adventure.",
    photoUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face",
    socials: { instagram: "averywrites", twitter: "averyt" },
    isActive: true,
    lastSeen: new Date(),
    distance: 380,
    latitude: 40.7500,
    longitude: -73.9840,
    venue: "Think Coffee",
    neighborhood: "Chelsea",
    city: "New York City",
  },
  {
    id: "10",
    name: "Drew Patel",
    age: 29,
    bio: "Finance by day, stand-up comedy by night. Laugh with me!",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    socials: { instagram: "drewpatel", twitter: "drewp" },
    isActive: true,
    lastSeen: new Date(),
    distance: 450,
    latitude: 40.7505,
    longitude: -73.9835,
    venue: "Comedy Cellar Chelsea",
    neighborhood: "Chelsea",
    city: "New York City",
  },

  // Same City (500m+) - People elsewhere in the city
  {
    id: "11",
    name: "Skyler James",
    age: 27,
    bio: "Fashion designer. Vintage collector. Brunch enthusiast.",
    photoUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=face",
    socials: { instagram: "skylerjames", tiktok: "skylerj" },
    isActive: true,
    lastSeen: new Date(),
    distance: 1200,
    latitude: 40.7580,
    longitude: -73.9855,
    venue: "Midtown Loft",
    neighborhood: "Midtown",
    city: "New York City",
  },
  {
    id: "12",
    name: "Quinn Anderson",
    age: 24,
    bio: "Medical student. Gym rat. Looking for study buddies or dance partners.",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    socials: { instagram: "quinnanderson", snapchat: "quinn_a" },
    isActive: true,
    lastSeen: new Date(),
    distance: 2500,
    latitude: 40.7282,
    longitude: -73.9942,
    venue: "NYU Medical Center",
    neighborhood: "East Village",
    city: "New York City",
  },
  {
    id: "13",
    name: "Reese Cooper",
    age: 26,
    bio: "Music producer. Vinyl collector. Night owl.",
    photoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop&crop=face",
    socials: { instagram: "reesecooper", twitter: "reesec" },
    isActive: true,
    lastSeen: new Date(),
    distance: 3800,
    latitude: 40.7168,
    longitude: -73.9861,
    venue: "Output Brooklyn",
    neighborhood: "Williamsburg",
    city: "New York City",
  },
  {
    id: "14",
    name: "Finley Martinez",
    age: 28,
    bio: "Architect. Museum hopper. Always sketching something.",
    photoUrl: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop&crop=face",
    socials: { instagram: "finleymartinez", twitter: "finleym" },
    isActive: true,
    lastSeen: new Date(),
    distance: 5200,
    latitude: 40.7794,
    longitude: -73.9632,
    venue: "The Met",
    neighborhood: "Upper East Side",
    city: "New York City",
  },
  {
    id: "15",
    name: "Parker Lee",
    age: 25,
    bio: "Bartender with too many hobbies. Ask me about my plants.",
    photoUrl: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=400&fit=crop&crop=face",
    socials: { instagram: "parkerlee", snapchat: "parklee" },
    isActive: true,
    lastSeen: new Date(),
    distance: 8500,
    latitude: 40.6892,
    longitude: -74.0445,
    venue: "Brooklyn Heights Bar",
    neighborhood: "Brooklyn Heights",
    city: "New York City",
  },
];

interface ProxyState {
  // User profile
  currentUser: UserProfile | null;
  isOnboarded: boolean;
  isProxyActive: boolean;

  // Proximity settings
  proximityLevel: ProximityLevel;

  // Nearby users
  nearbyUsers: NearbyUser[];

  // Connections
  connections: Connection[];
  pendingRequests: Connection[];

  // History
  crossedPaths: CrossedPath[];

  // Current location
  currentLocation: ConnectionLocation | null;

  // Actions
  setCurrentUser: (user: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateSocials: (socials: SocialLinks) => void;
  completeOnboarding: () => void;
  toggleProxyActive: () => void;
  setCurrentLocation: (location: ConnectionLocation) => void;
  setProximityLevel: (level: ProximityLevel) => void;

  sendInterest: (userId: string) => void;
  respondToInterest: (connectionId: string, accept: boolean) => void;

  addCrossedPath: (user: NearbyUser) => void;
  clearHistory: () => void;

  reset: () => void;
}

const initialState = {
  currentUser: null,
  isOnboarded: false,
  isProxyActive: false,
  proximityLevel: "nearby" as ProximityLevel,
  nearbyUsers: mockNearbyUsers,
  connections: [],
  pendingRequests: [],
  crossedPaths: [],
  currentLocation: null as ConnectionLocation | null,
};

export const useProxyStore = create<ProxyState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentUser: (user) => set({ currentUser: user }),

      updateProfile: (updates) =>
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, ...updates }
            : null,
        })),

      updateSocials: (socials) =>
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, socials: { ...state.currentUser.socials, ...socials } }
            : null,
        })),

      completeOnboarding: () => set({ isOnboarded: true }),

      toggleProxyActive: () =>
        set((state) => ({ isProxyActive: !state.isProxyActive })),

      setCurrentLocation: (location) => set({ currentLocation: location }),

      setProximityLevel: (level) => set({ proximityLevel: level }),

      sendInterest: (userId) => {
        const { nearbyUsers, currentUser, connections, currentLocation } = get();
        const targetUser = nearbyUsers.find((u) => u.id === userId);

        if (!targetUser || !currentUser) return;

        // Check if connection already exists
        const existingConnection = connections.find(
          (c) => c.user.id === userId
        );
        if (existingConnection) return;

        const newConnection: Connection = {
          id: `conn_${Date.now()}`,
          fromUserId: currentUser.id,
          toUserId: userId,
          status: "pending",
          timestamp: new Date(),
          user: targetUser,
          location: currentLocation || undefined,
        };

        set((state) => ({
          connections: [...state.connections, newConnection],
        }));

        // Simulate response after 2-5 seconds for demo
        setTimeout(() => {
          const shouldAccept = Math.random() > 0.3;
          get().respondToInterest(newConnection.id, shouldAccept);
        }, 2000 + Math.random() * 3000);
      },

      respondToInterest: (connectionId, accept) =>
        set((state) => ({
          connections: state.connections.map((conn) =>
            conn.id === connectionId
              ? { ...conn, status: accept ? "accepted" : "declined" }
              : conn
          ),
        })),

      addCrossedPath: (user) => {
        const crossedPath: CrossedPath = {
          id: `path_${Date.now()}`,
          user,
          location: "Current Location",
          timestamp: new Date(),
          distance: user.distance,
        };

        set((state) => ({
          crossedPaths: [crossedPath, ...state.crossedPaths].slice(0, 50),
        }));
      },

      clearHistory: () => set({ crossedPaths: [] }),

      reset: () => set(initialState),
    }),
    {
      name: "proxy-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        isOnboarded: state.isOnboarded,
        connections: state.connections,
        crossedPaths: state.crossedPaths,
        proximityLevel: state.proximityLevel,
      }),
    }
  )
);
