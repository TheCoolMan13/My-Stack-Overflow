/**
 * requireAuth middleware: verifies the caller's Supabase access token and
 * attaches { id, email, ... } to req.user.
 *
 * Frontend sends: `Authorization: Bearer <access_token>` where the token comes
 * from supabase.auth.getSession() on the client.
 *
 * We validate by calling Supabase's GoTrue /auth/v1/user endpoint with the
 * token. This is done via raw fetch instead of supabase.auth.getUser(token)
 * because supabase-js v2 mutates the shared client's auth context when you
 * pass a token to getUser — subsequent service-role REST calls would then
 * run under the user's JWT and be filtered by RLS, breaking writes.
 */

const URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) {
        return res.status(401).json({ error: 'missing bearer token' });
    }
    const token = match[1];

    try {
        const response = await fetch(`${URL}/auth/v1/user`, {
            headers: {
                apikey: SERVICE_KEY,
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            return res.status(401).json({ error: 'invalid or expired token' });
        }
        const user = await response.json();
        if (!user?.id) {
            return res.status(401).json({ error: 'invalid token payload' });
        }
        req.user = user;
        req.token = token;
        next();
    } catch (err) {
        return res.status(500).json({ error: `auth check failed: ${err.message}` });
    }
}

module.exports = { requireAuth };
