import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from 'react';

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */
export interface AuthUser {
    id: string;
    username: string;
    email: string;
    avatarInitial: string;
    reputation: number;
    joinedAt: string;
}

interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (username: string, email: string, password: string) => Promise<void>;
    signOut: () => void;
}

/* ─────────────────────────────────────────────
   Mock user — pretend this came back from the API
   ───────────────────────────────────────────── */
const MOCK_USER: AuthUser = {
    id: 'u_titus',
    username: 'Titus_AC_LABS',
    email: 'titus@smoverflow.dev',
    avatarInitial: 'T',
    reputation: 1284,
    joinedAt: '2026-01-14',
};

/* ─────────────────────────────────────────────
   Context
   ───────────────────────────────────────────── */
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    // Start logged in with the mock user. Change to `null` to test the logged-out state.
    const [user, setUser] = useState<AuthUser | null>(MOCK_USER);

    const signIn: AuthContextValue['signIn'] = async (_email, _password) => {
        // Pretend we hit an API
        await new Promise((r) => setTimeout(r, 400));
        setUser(MOCK_USER);
    };

    const signUp: AuthContextValue['signUp'] = async (username, email, _password) => {
        await new Promise((r) => setTimeout(r, 400));
        setUser({
            ...MOCK_USER,
            id: `u_${username.toLowerCase()}`,
            username,
            email,
            avatarInitial: username[0]?.toUpperCase() ?? '?',
            reputation: 1,
        });
    };

    const signOut = () => setUser(null);

    const value: AuthContextValue = {
        user,
        isAuthenticated: user !== null,
        signIn,
        signUp,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
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
