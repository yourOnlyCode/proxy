-- Proxy App Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor)

-- Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  bio TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT false,
  proximity_level TEXT DEFAULT 'nearby' CHECK (proximity_level IN ('venue', 'nearby', 'neighborhood', 'city')),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  venue TEXT,
  neighborhood TEXT,
  city TEXT,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SOCIALS TABLE
-- ============================================
CREATE TABLE socials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  instagram TEXT,
  twitter TEXT,
  snapchat TEXT,
  tiktok TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- CONNECTIONS TABLE (Interest requests)
-- ============================================
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  location_name TEXT,
  location_city TEXT,
  location_neighborhood TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CROSSED PATHS TABLE (History)
-- ============================================
CREATE TABLE crossed_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  crossed_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  location_name TEXT,
  location_city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, crossed_user_id, DATE(created_at))
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX idx_profiles_active ON profiles(is_active) WHERE is_active = true;
CREATE INDEX idx_profiles_location ON profiles(latitude, longitude) WHERE is_active = true;
CREATE INDEX idx_connections_sender ON connections(sender_id);
CREATE INDEX idx_connections_receiver ON connections(receiver_id);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_messages_connection ON messages(connection_id);
CREATE INDEX idx_messages_unread ON messages(connection_id, read) WHERE read = false;
CREATE INDEX idx_crossed_paths_user ON crossed_paths(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE socials ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crossed_paths ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view active profiles" ON profiles
  FOR SELECT USING (is_active = true OR id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- SOCIALS policies
CREATE POLICY "Users can view socials of connected users" ON socials
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM connections
      WHERE status = 'accepted'
      AND ((sender_id = auth.uid() AND receiver_id = socials.user_id)
        OR (receiver_id = auth.uid() AND sender_id = socials.user_id))
    )
  );

CREATE POLICY "Users can manage own socials" ON socials
  FOR ALL USING (user_id = auth.uid());

-- CONNECTIONS policies
CREATE POLICY "Users can view own connections" ON connections
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can create connections" ON connections
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update connections they received" ON connections
  FOR UPDATE USING (receiver_id = auth.uid());

-- MESSAGES policies
CREATE POLICY "Users can view messages in their connections" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.id = messages.connection_id
      AND (connections.sender_id = auth.uid() OR connections.receiver_id = auth.uid())
      AND connections.status = 'accepted'
    )
  );

CREATE POLICY "Users can send messages in accepted connections" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.id = messages.connection_id
      AND (connections.sender_id = auth.uid() OR connections.receiver_id = auth.uid())
      AND connections.status = 'accepted'
    )
  );

CREATE POLICY "Users can mark own messages as read" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.id = messages.connection_id
      AND (connections.sender_id = auth.uid() OR connections.receiver_id = auth.uid())
    )
  );

-- CROSSED PATHS policies
CREATE POLICY "Users can view own crossed paths" ON crossed_paths
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert crossed paths" ON crossed_paths
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER socials_updated_at
  BEFORE UPDATE ON socials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER connections_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, age, bio)
  VALUES (NEW.id, '', 0, '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- HELPFUL VIEWS
-- ============================================

-- View for nearby users (example - adjust distance calculation as needed)
CREATE OR REPLACE VIEW nearby_users AS
SELECT
  p.*,
  s.instagram,
  s.twitter,
  s.snapchat,
  s.tiktok
FROM profiles p
LEFT JOIN socials s ON s.user_id = p.id
WHERE p.is_active = true;
