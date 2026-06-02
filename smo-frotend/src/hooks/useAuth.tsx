import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from 'react';
import * as api from '../lib/api';

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */
export interface AuthUser {
    id: string;
    username: string;
    email: string;
    avatarInitial: string;
}

interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<{ error?: string }>;
    signUp: (username: string, email: string, password: string) => Promise<{ error?: string }>;
    signOut: () => void;
}

/* ─────────────────────────────────────────────
   Context
   ───────────────────────────────────────────── */
const AuthContext = createContext<AuthContextValue | null>(null);

function buildUser(id: string, email: string, username: string | null): AuthUser {
    const name = username || email.split('@')[0];
    return {
        id,
        email,
        username: name,
        avatarInitial: name[0]?.toUpperCase() ?? 'U',
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // On mount, restore session by validating the stored access token
    // against the real /auth/me endpoint. This ensures we never display
    // stale or fabricated user data.
    useEffect(() => {
        const token = api.getAccessToken();
        if (!token) {
            setIsLoading(false);
            return;
        }

        api.getMe().then((result) => {
            if (result.data) {
                setUser(buildUser(result.data.id, result.data.email, result.data.username));
            } else {
                // Token is invalid or expired and refresh failed — clear it
                api.clearTokens();
            }
            setIsLoading(false);
        });
    }, []);

    const signIn: AuthContextValue['signIn'] = async (email, password) => {
        const result = await api.login({ email, password });
        if (result.error || !result.data) {
            return { error: result.error || 'Login failed' };
        }

        const { accessToken, refreshToken, user: authUser } = result.data;
        api.setTokens(accessToken, refreshToken);

        // Fetch the profile to get the username
        const meResult = await api.getMe();
        const username = meResult.data?.username ?? null;
        setUser(buildUser(authUser.id, authUser.email, username));
        return {};
    };

    const signUp: AuthContextValue['signUp'] = async (username, email, password) => {
        const result = await api.register({ username, email, password });
        if (result.error || !result.data) {
            return { error: result.error || 'Registration failed' };
        }

        if (result.data.confirmation_required) {
            return { error: result.data.message || 'Please check your email to confirm your account.' };
        }

        const { accessToken, refreshToken, user: authUser } = result.data;
        api.setTokens(accessToken, refreshToken);
        setUser(buildUser(authUser.id, authUser.email, username));
        return {};
    };

    const signOut = () => {
        api.clearTokens();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: user !== null,
                isLoading,
                signIn,
                signUp,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

/* ─────────────────────────────────────────────
   Hook
   ───────────────────────────────────────────── */
export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an <AuthProvider>');
    }
    return ctx;
}
