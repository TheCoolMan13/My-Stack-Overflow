const express = require('express');

const router = express.Router();

const URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// All auth routes use raw fetch instead of supabase-js because
// supabase.auth.signInWithPassword / signUp / refreshSession mutate the
// shared singleton's session — after one user logs in via the backend, every
// subsequent INSERT via supabase-js singleton runs under their JWT and gets
// filtered by RLS instead of using service-role.
async function gotrue(path, body) {
    const res = await fetch(`${URL}/auth/v1${path}`, {
        method: 'POST',
        headers: { apikey: SERVICE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
}

async function rest(path, opts = {}) {
    const res = await fetch(`${URL}/rest/v1${path}`, {
        ...opts,
        headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
            ...(opts.headers || {}),
        },
    });
    if (res.status === 204) return { ok: res.ok, status: res.status, data: null };
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
}

function shapeSession(d) {
    if (!d?.access_token) return null;
    return {
        access_token: d.access_token,
        refresh_token: d.refresh_token,
        expires_in: d.expires_in,
        token_type: d.token_type,
    };
}

/**
 * POST /auth/register
 * body: { email, password, username }
 *
 * Pipeline: validate fields -> check username free -> signup -> return session
 * or confirmation_required. Profile row is created by the handle_new_user
 * trigger on auth.users insert.
 */
router.post('/register', async (req, res) => {
    const { email, password, username } = req.body || {};
    if (!email || !password || !username) {
        return res.status(400).json({ error: 'email, password, username required' });
    }
    if (password.length < 8) {
        return res.status(400).json({ error: 'password must be at least 8 characters' });
    }
    if (username.length < 3) {
        return res.status(400).json({ error: 'username must be at least 3 characters' });
    }

    const lookup = await rest(
        `/profiles?username=eq.${encodeURIComponent(username)}&select=id`,
    );
    if (!lookup.ok) {
        return res
            .status(500)
            .json({ error: `username lookup failed: ${lookup.data?.message ?? lookup.status}` });
    }
    if (lookup.data.length > 0) {
        return res.status(409).json({ error: 'username already taken' });
    }

    const signup = await gotrue('/signup', {
        email,
        password,
        data: { username },
    });
    if (!signup.ok) {
        return res
            .status(400)
            .json({ error: signup.data?.msg ?? signup.data?.error_description ?? 'signup failed' });
    }

    const session = shapeSession(signup.data);
    const user = signup.data.user ?? { id: signup.data.id, email: signup.data.email };

    // Ensure the profile row exists. Normally created by the handle_new_user
    // trigger, but we upsert here as a safety net in case the trigger isn't
    // configured in the Supabase project.
    if (user.id) {
        await rest(`/profiles`, {
            method: 'POST',
            headers: { Prefer: 'resolution=ignore-duplicates' },
            body: JSON.stringify({
                id: user.id,
                username,
            }),
        });
    }

    if (!session) {
        // Email confirmation required — no tokens yet
        return res.status(201).json({
            user,
            confirmation_required: true,
            message: 'check your email to confirm, then call /auth/login',
        });
    }

    return res.status(201).json({
        user,
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresIn: session.expires_in,
    });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ error: 'email and password required' });
    }
    const result = await gotrue('/token?grant_type=password', { email, password });
    if (!result.ok) {
        return res
            .status(401)
            .json({ error: result.data?.error_description ?? result.data?.msg ?? 'invalid credentials' });
    }
    const session = shapeSession(result.data);
    return res.json({
        user: result.data.user,
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresIn: session.expires_in,
    });
});

router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
        return res.status(400).json({ error: 'refreshToken required' });
    }
    const result = await gotrue('/token?grant_type=refresh_token', { refresh_token: refreshToken });
    if (!result.ok) {
        return res
            .status(401)
            .json({ error: result.data?.error_description ?? result.data?.msg ?? 'refresh failed' });
    }
    const session = shapeSession(result.data);
    return res.json({
        user: result.data.user,
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresIn: session.expires_in,
    });
});

/**
 * GET /auth/me
 * Protected. Returns the authenticated user's profile row.
 * Used by the frontend to restore session state on page load.
 */
router.get('/me', async (req, res) => {
    const header = req.headers.authorization || '';
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) return res.status(401).json({ error: 'missing bearer token' });
    const token = match[1];

    // Validate the token and get the user from Supabase Auth
    const authRes = await fetch(`${URL}/auth/v1/user`, {
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${token}` },
    });
    if (!authRes.ok) return res.status(401).json({ error: 'invalid or expired token' });
    const authUser = await authRes.json();
    if (!authUser?.id) return res.status(401).json({ error: 'invalid token payload' });

    // Fetch the profile row to get the username
    const profileRes = await rest(`/profiles?id=eq.${authUser.id}&select=id,username`);
    const profile = profileRes.data?.[0] ?? null;

    return res.json({
        id: authUser.id,
        email: authUser.email,
        username: profile?.username ?? authUser.user_metadata?.username ?? null,
    });
});

module.exports = router;
