// Proxy App Types

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
