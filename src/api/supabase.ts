import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

const AUTH_STORAGE_KEY = "supabase_auth_session";

interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface AuthResponse {
  data: { user: User | null; session: Session | null } | null;
  error: { message: string } | null;
}

// Store session
const storeSession = async (session: Session | null) => {
  if (session) {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } else {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  }
};

// Get stored session
export const getSession = async (): Promise<Session | null> => {
  const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;

  const session = JSON.parse(stored) as Session;

  // Check if expired (with 60s buffer)
  if (session.expires_at * 1000 < Date.now() + 60000) {
    // Try to refresh
    const refreshed = await refreshSession(session.refresh_token);
    if (refreshed.error) {
      await storeSession(null);
      return null;
    }
    return refreshed.data?.session || null;
  }

  return session;
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  const session = await getSession();
  return session?.user || null;
};

// Sign up with email and password
export const signUp = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseAnonKey,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { data: null, error: { message: data.error_description || data.msg || "Sign up failed" } };
    }

    // For email confirmation flow, user might not have session yet
    if (data.access_token) {
      const session: Session = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
        user: data.user,
      };
      await storeSession(session);
      return { data: { user: data.user, session }, error: null };
    }

    return { data: { user: data.user || data, session: null }, error: null };
  } catch (err) {
    return { data: null, error: { message: "Network error. Please try again." } };
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseAnonKey,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { data: null, error: { message: data.error_description || data.msg || "Sign in failed" } };
    }

    const session: Session = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
      user: data.user,
    };

    await storeSession(session);
    return { data: { user: data.user, session }, error: null };
  } catch (err) {
    return { data: null, error: { message: "Network error. Please try again." } };
  }
};

// Refresh session
const refreshSession = async (refreshToken: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseAnonKey,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { data: null, error: { message: data.error_description || "Session expired" } };
    }

    const session: Session = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
      user: data.user,
    };

    await storeSession(session);
    return { data: { user: data.user, session }, error: null };
  } catch (err) {
    return { data: null, error: { message: "Network error" } };
  }
};

// Sign out
export const signOut = async (): Promise<{ error: { message: string } | null }> => {
  try {
    const session = await getSession();
    if (session) {
      await fetch(`${supabaseUrl}/auth/v1/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseAnonKey,
          "Authorization": `Bearer ${session.access_token}`,
        },
      });
    }
    await storeSession(null);
    return { error: null };
  } catch (err) {
    await storeSession(null);
    return { error: null };
  }
};

// Database query helper
export const supabaseQuery = async <T>(
  table: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: Record<string, unknown>;
    filters?: string;
    select?: string;
    single?: boolean;
  } = {}
): Promise<{ data: T | null; error: { message: string } | null }> => {
  const session = await getSession();
  const { method = "GET", body, filters = "", select = "*", single = false } = options;

  try {
    let url = `${supabaseUrl}/rest/v1/${table}?select=${select}`;
    if (filters) url += `&${filters}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "apikey": supabaseAnonKey,
      "Prefer": single ? "return=representation,count=exact" : "return=representation",
    };

    if (session) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return { data: null, error: { message: data.message || "Query failed" } };
    }

    return { data: single && Array.isArray(data) ? data[0] : data, error: null };
  } catch (err) {
    return { data: null, error: { message: "Network error" } };
  }
};

// Insert helper
export const supabaseInsert = async <T>(
  table: string,
  data: Record<string, unknown>
): Promise<{ data: T | null; error: { message: string } | null }> => {
  return supabaseQuery<T>(table, { method: "POST", body: data, single: true });
};

// Update helper
export const supabaseUpdate = async <T>(
  table: string,
  data: Record<string, unknown>,
  filters: string
): Promise<{ data: T | null; error: { message: string } | null }> => {
  return supabaseQuery<T>(table, { method: "PATCH", body: data, filters, single: true });
};

// Delete helper
export const supabaseDelete = async (
  table: string,
  filters: string
): Promise<{ error: { message: string } | null }> => {
  const result = await supabaseQuery(table, { method: "DELETE", filters });
  return { error: result.error };
};

// Export types
export type { Session, User, AuthResponse };
