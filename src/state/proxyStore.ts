import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  UserProfile,
  SocialLinks,
  NearbyUser,
  Connection,
  CrossedPath,
  ConnectionStatus,
} from "../types/proxy";

// Mock data for nearby users
const mockNearbyUsers: NearbyUser[] = [
  {
    id: "1",
    name: "Alex Rivera",
    age: 24,
    bio: "Music lover. Coffee enthusiast. Always down for spontaneous adventures.",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    socials: { instagram: "alexrivera", snapchat: "alexr" },
    isActive: true,
    lastSeen: new Date(),
    distance: 12,
    latitude: 0,
    longitude: 0,
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
    distance: 25,
    latitude: 0,
    longitude: 0,
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
    distance: 8,
    latitude: 0,
    longitude: 0,
  },
  {
    id: "4",
    name: "Riley Morgan",
    age: 25,
    bio: "Tech nerd who loves dancing. Yes, both can coexist.",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face",
    socials: { instagram: "rileymorgan", snapchat: "riley_m" },
    isActive: true,
    lastSeen: new Date(),
    distance: 45,
    latitude: 0,
    longitude: 0,
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
    distance: 32,
    latitude: 0,
    longitude: 0,
  },
];

interface ProxyState {
  // User profile
  currentUser: UserProfile | null;
  isOnboarded: boolean;
  isProxyActive: boolean;

  // Nearby users
  nearbyUsers: NearbyUser[];

  // Connections
  connections: Connection[];
  pendingRequests: Connection[];

  // History
  crossedPaths: CrossedPath[];

  // Actions
  setCurrentUser: (user: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateSocials: (socials: SocialLinks) => void;
  completeOnboarding: () => void;
  toggleProxyActive: () => void;

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
  nearbyUsers: mockNearbyUsers,
  connections: [],
  pendingRequests: [],
  crossedPaths: [],
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

      sendInterest: (userId) => {
        const { nearbyUsers, currentUser, connections } = get();
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
      }),
    }
  )
);
