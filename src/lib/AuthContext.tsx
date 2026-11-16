import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './supabase';
import type { Profile, UserRole } from './types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  signUp: (data: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    phone?: string;
    city?: string;
  }) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: {
    full_name?: string;
    phone?: string | null;
    city?: string | null;
  }) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function friendlyAuthError(message: string): string {
  if (/user already registered/i.test(message)) return 'This email is already registered. Try logging in instead.';
  if (/invalid login credentials/i.test(message)) return 'Incorrect email or password.';
  if (/password/i.test(message) && /least|short/i.test(message)) return 'Password must be at least 6 characters.';
  if (/rate limit/i.test(message)) return 'Too many attempts. Please wait a moment and try again.';
  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!session?.user) {
        setProfile(null);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      if (!cancelled) setProfile(data ?? null);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role: profile?.role ?? null,
      loading,
      async signUp({ email, password, fullName, role, phone, city }) {
        if (!isSupabaseConfigured) return { error: 'Account services are not connected in this preview yet.' };
        try {
          const { error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                full_name: fullName.trim(),
                role,
                phone: phone?.trim() || null,
                city: city?.trim() || null,
              },
            },
          });
          if (error) return { error: friendlyAuthError(error.message) };
          return { error: null };
        } catch {
          return { error: 'Something went wrong. Please try again.' };
        }
      },
      async signIn(email, password) {
        if (!isSupabaseConfigured) return { error: 'Account services are not connected in this preview yet.' };
        try {
          const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (error) return { error: friendlyAuthError(error.message) };
          return { error: null };
        } catch {
          return { error: 'Something went wrong. Please try again.' };
        }
      },
      async signOut() {
        if (isSupabaseConfigured) await supabase.auth.signOut();
      },
      async refreshProfile() {
        if (!isSupabaseConfigured || !session?.user) return;
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        setProfile(data ?? null);
      },
      async updateProfile(updates) {
        if (!isSupabaseConfigured) return { error: 'Account services are not connected in this preview yet.' };
        if (!session?.user) return { error: 'Not signed in.' };
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', session.user.id);
        if (error) return { error: error.message };
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        setProfile(data ?? null);
        return { error: null };
      },
    }),
    [session, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
