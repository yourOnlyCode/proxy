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

export interface Connection {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: ConnectionStatus;
  timestamp: Date;
  user: UserProfile; // The other user in the connection
}

export interface CrossedPath {
  id: string;
  user: UserProfile;
  location: string;
  timestamp: Date;
  distance: number;
}
