// Proxy App Types

// Proximity levels for discovery
export type ProximityLevel = "venue" | "nearby" | "neighborhood" | "city";

export interface ProximityOption {
  level: ProximityLevel;
  label: string;
  description: string;
  maxDistance: number; // in meters
}

export const PROXIMITY_OPTIONS: ProximityOption[] = [
  {
    level: "venue",
    label: "Same Venue",
    description: "People at your exact location",
    maxDistance: 15, // ~50 feet
  },
  {
    level: "nearby",
    label: "Nearby",
    description: "People within 50 feet",
    maxDistance: 50, // ~165 feet
  },
  {
    level: "neighborhood",
    label: "Same Area",
    description: "People in your neighborhood",
    maxDistance: 500, // ~0.3 miles
  },
  {
    level: "city",
    label: "Same City",
    description: "Everyone in your city",
    maxDistance: 50000, // ~30 miles
  },
];

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  snapchat?: string;
  tiktok?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  photoUrl: string;
  socials: SocialLinks;
  isActive: boolean;
  lastSeen: Date;
}

export interface NearbyUser extends UserProfile {
  distance: number; // in meters
  latitude: number;
  longitude: number;
  venue?: string; // e.g., "The Rooftop Bar"
  neighborhood?: string; // e.g., "Chelsea"
  city?: string; // e.g., "New York City"
}

export type ConnectionStatus = "pending" | "accepted" | "declined";

export interface ConnectionLocation {
  name: string; // e.g., "The Rooftop Bar"
  city: string; // e.g., "San Francisco"
  neighborhood?: string; // e.g., "Mission District"
}

export interface Connection {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: ConnectionStatus;
  timestamp: Date;
  user: UserProfile; // The other user in the connection
  location?: ConnectionLocation; // Where the connection was made
}

export interface CrossedPath {
  id: string;
  user: UserProfile;
  location: string;
  timestamp: Date;
  distance: number;
}
