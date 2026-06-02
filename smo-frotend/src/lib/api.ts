/* ─────────────────────────────────────────────
   SMOverflow API Client
   All requests go through the Express backend — never directly to Supabase.
   ───────────────────────────────────────────── */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface ApiResponse<T = unknown> {
    data?: T;
    error?: string;
}

/* ─────────────────────────────────────────────
   Token storage
   ───────────────────────────────────────────── */
const TOKEN_KEY = 'smo_access_token';
const REFRESH_KEY = 'smo_refresh_token';

export function getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string): void {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
}

/* ─────────────────────────────────────────────
   Core fetch wrapper with auto-refresh
   ───────────────────────────────────────────── */

// Track whether a refresh is in progress to avoid concurrent refresh storms
let refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;

        const data: AuthSuccessResponse = await res.json();
        if (data.accessToken && data.refreshToken) {
            setTokens(data.accessToken, data.refreshToken);
            return true;
        }
        return false;
    } catch {
        return false;
    }
}

async function request<T = unknown>(
    path: string,
    options: RequestInit = {},
    isRetry = false,
): Promise<ApiResponse<T>> {
    const token = getAccessToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    let res: Response;
    try {
        res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    } catch (err) {
        return { error: err instanceof Error ? err.message : 'Network error' };
    }

    // If we get a 401 and haven't retried yet, try to refresh the token
    if (res.status === 401 && !isRetry) {
        // Deduplicate concurrent refresh attempts
        if (!refreshPromise) {
            refreshPromise = attemptRefresh().finally(() => {
                refreshPromise = null;
            });
        }
        const refreshed = await refreshPromise;

        if (refreshed) {
            // Retry the original request with the new token
            return request<T>(path, options, true);
        }

        // Refresh failed — clear tokens so the user gets redirected to login
        clearTokens();
        return { error: 'Session expired. Please sign in again.' };
    }

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: res.statusText }));
        return { error: errorData.error || `HTTP ${res.status}` };
    }

    // 204 No Content
    if (res.status === 204) return { data: undefined };

    const data = await res.json();
    return { data };
}

/* ─────────────────────────────────────────────
   Auth types & endpoints
   ───────────────────────────────────────────── */
export interface AuthUser {
    id: string;
    email: string;
}

export interface AuthSuccessResponse {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface AuthRegisterResponse extends AuthSuccessResponse {
    confirmation_required?: boolean;
    message?: string;
}

export interface MeResponse {
    id: string;
    email: string;
    username: string | null;
}

export async function register(params: {
    email: string;
    password: string;
    username: string;
}): Promise<ApiResponse<AuthRegisterResponse>> {
    return request<AuthRegisterResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(params),
    });
}

export async function login(params: {
    email: string;
    password: string;
}): Promise<ApiResponse<AuthSuccessResponse>> {
    return request<AuthSuccessResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(params),
    });
}

export async function refreshSession(): Promise<ApiResponse<AuthSuccessResponse>> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return { error: 'No refresh token available' };
    return request<AuthSuccessResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
    });
}

export async function getMe(): Promise<ApiResponse<MeResponse>> {
    return request<MeResponse>('/auth/me');
}

/* ─────────────────────────────────────────────
   Questions types & endpoints
   ───────────────────────────────────────────── */
export interface QuestionListItem {
    id: string;
    title: string;
    is_solved: boolean;
    vote_count: number;
    created_at: string;
    author: { id: string; username: string } | null;
    question_tags: Array<{ tag: { name: string } }>;
    answers: Array<{ count: number }>;
}

export interface AnswerItem {
    id: string;
    body: string;
    question_id: string;
    author_id: string;
    vote_count: number;
    is_accepted: boolean;
    created_at: string;
    author: { id: string; username: string } | null;
}

export interface QuestionDetail {
    id: string;
    title: string;
    description: string;
    author_id: string;
    is_solved: boolean;
    vote_count: number;
    created_at: string;
    author: { id: string; username: string } | null;
    question_tags: Array<{ tag: { name: string } }>;
    answers: AnswerItem[];
}

export async function getQuestions(): Promise<ApiResponse<QuestionListItem[]>> {
    return request<QuestionListItem[]>('/questions');
}

export async function getQuestion(id: string): Promise<ApiResponse<QuestionDetail>> {
    return request<QuestionDetail>(`/questions/${id}`);
}

export async function createQuestion(params: {
    title: string;
    description: string;
    tags?: string[];
}): Promise<ApiResponse<{ id: string }>> {
    return request<{ id: string }>('/questions', {
        method: 'POST',
        body: JSON.stringify(params),
    });
}

export async function voteQuestion(
    id: string,
    value: 1 | -1,
): Promise<ApiResponse<{ vote_count: number }>> {
    return request<{ vote_count: number }>(`/questions/${id}/vote`, {
        method: 'PATCH',
        body: JSON.stringify({ value }),
    });
}

/* ─────────────────────────────────────────────
   Answers types & endpoints
   ───────────────────────────────────────────── */
export async function createAnswer(
    questionId: string,
    body: string,
): Promise<ApiResponse<AnswerItem>> {
    return request<AnswerItem>(`/questions/${questionId}/answers`, {
        method: 'POST',
        body: JSON.stringify({ body }),
    });
}

export async function acceptAnswer(
    answerId: string,
): Promise<ApiResponse<AnswerItem>> {
    return request<AnswerItem>(`/answers/${answerId}/accept`, {
        method: 'PATCH',
    });
}

export async function voteAnswer(
    id: string,
    value: 1 | -1,
): Promise<ApiResponse<{ vote_count: number }>> {
    return request<{ vote_count: number }>(`/answers/${id}/vote`, {
        method: 'PATCH',
        body: JSON.stringify({ value }),
    });
}
