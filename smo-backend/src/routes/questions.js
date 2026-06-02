const express = require('express');
const supabase = require('../supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const LIST_SELECT =
    'id,title,is_solved,vote_count,created_at,' +
    'author:profiles(id,username),' +
    'question_tags(tag:tags(name)),' +
    'answers(count)';

const DETAIL_SELECT =
    'id,title,description,author_id,is_solved,vote_count,created_at,' +
    'author:profiles(id,username),' +
    'question_tags(tag:tags(name)),' +
    'answers(id,body,question_id,author_id,vote_count,is_accepted,created_at,author:profiles(id,username))';

/**
 * GET /questions
 * Public. Returns all questions ordered newest first, with author, tags, and
 * answer count embedded.
 */
router.get('/', async (_req, res) => {
    const { data, error } = await supabase
        .from('questions')
        .select(LIST_SELECT)
        .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

/**
 * GET /questions/:id
 * Public. Returns one question with its full thread (answers + their authors).
 * 404 if not found.
 */
router.get('/:id', async (req, res) => {
    const { data, error } = await supabase
        .from('questions')
        .select(DETAIL_SELECT)
        .eq('id', req.params.id)
        .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'question not found' });
    res.json(data);
});

/**
 * POST /questions
 * Protected. Creates a question for the authenticated user.
 * body: { title, description, tags?: string[] }
 *
 * Pipeline:
 *   1. validate fields
 *   2. insert question with author_id = req.user.id
 *   3. for each tag: upsert into tags(name) (onConflict: name), collect ids
 *   4. insert question_tags links
 *   5. return the created question
 */
router.post('/', requireAuth, async (req, res) => {
    const { title, description, tags } = req.body || {};
    if (!title || !description) {
        return res.status(400).json({ error: 'title and description required' });
    }

    const { data: created, error: insertError } = await supabase
        .from('questions')
        .insert({
            title: String(title).trim(),
            description: String(description).trim(),
            author_id: req.user.id,
        })
        .select('id')
        .single();
    if (insertError) return res.status(500).json({ error: insertError.message });

    const tagNames = Array.isArray(tags)
        ? tags
              .map((t) => String(t).trim().toLowerCase())
              .filter((t) => t.length > 0)
        : [];

    if (tagNames.length > 0) {
        const { data: tagRows, error: tagError } = await supabase
            .from('tags')
            .upsert(
                tagNames.map((name) => ({ name })),
                { onConflict: 'name' },
            )
            .select('id, name');
        if (tagError) return res.status(500).json({ error: tagError.message });

        const links = tagRows.map((t) => ({
            question_id: created.id,
            tag_id: t.id,
        }));
        const { error: linkError } = await supabase.from('question_tags').insert(links);
        if (linkError) return res.status(500).json({ error: linkError.message });
    }

    res.status(201).json({ id: created.id });
});

/**
 * PATCH /questions/:id/vote
 * Protected. Reddit-style vote (toggle / switch). body: { value: 1 | -1 }
 *
 * Pipeline:
 *   1. look up existing vote for (user, question)
 *   2. compute delta based on existing vs clicked
 *      - no prior vote    → insert,  delta = clicked
 *      - same vote again  → delete,  delta = -clicked   (toggle off)
 *      - opposite vote    → update,  delta = 2 * clicked (switch direction)
 *   3. update questions.vote_count by delta
 */
router.patch('/:id/vote', requireAuth, async (req, res) => {
    const questionId = req.params.id;
    const clicked = Number(req.body?.value);
    if (clicked !== 1 && clicked !== -1) {
        return res.status(400).json({ error: 'value must be 1 or -1' });
    }

    // Look up any existing vote this user cast on this question
    const { data: existing, error: lookupError } = await supabase
        .from('votes')
        .select('id, value')
        .eq('user_id', req.user.id)
        .eq('question_id', questionId)
        .maybeSingle();
    if (lookupError) return res.status(500).json({ error: lookupError.message });

    let delta;
    if (!existing) {
        // New vote
        delta = clicked;
        const { error } = await supabase.from('votes').insert({
            user_id: req.user.id,
            question_id: questionId,
            value: clicked,
        });
        if (error) return res.status(500).json({ error: error.message });
    } else if (existing.value === clicked) {
        // Same direction — toggle off
        delta = -clicked;
        const { error } = await supabase.from('votes').delete().eq('id', existing.id);
        if (error) return res.status(500).json({ error: error.message });
    } else {
        // Opposite direction — switch vote (+1 → -1 or vice versa)
        delta = 2 * clicked;
        const { error } = await supabase
            .from('votes')
            .update({ value: clicked })
            .eq('id', existing.id);
        if (error) return res.status(500).json({ error: error.message });
    }

    // Read current vote_count then apply the delta (read-modify-write).
    // This is safe for a hackathon-scale app; for high concurrency you'd use
    // a Postgres function (UPDATE questions SET vote_count = vote_count + delta).
    const { data: qRow, error: qErr } = await supabase
        .from('questions')
        .select('vote_count')
        .eq('id', questionId)
        .single();
    if (qErr) return res.status(500).json({ error: qErr.message });

    const newCount = (qRow.vote_count ?? 0) + delta;
    const { error: patchErr } = await supabase
        .from('questions')
        .update({ vote_count: newCount })
        .eq('id', questionId);
    if (patchErr) return res.status(500).json({ error: patchErr.message });

    res.json({ vote_count: newCount });
});

/**
 * GET /questions/:id/comments
 * Public. Returns all comments for this question AND its answers, with author
 * usernames embedded. Used by the question detail page.
 */
router.get('/:id/comments', async (req, res) => {
    const questionId = req.params.id;
    const { data: answerRows, error: ansErr } = await supabase
        .from('answers')
        .select('id')
        .eq('question_id', questionId);
    if (ansErr) return res.status(500).json({ error: ansErr.message });
    const targetIds = [questionId, ...(answerRows ?? []).map((a) => a.id)];
    const { data, error } = await supabase
        .from('comments')
        .select('id,body,target_id,target_type,created_at,author:profiles(username)')
        .in('target_id', targetIds)
        .order('created_at', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data ?? []);
});

/**
 * GET /questions/:id/my-votes
 * Protected. Returns the authenticated user's votes on this question + answers.
 * Shape: [{ id, target_id, target_type, value }]
 */
router.get('/:id/my-votes', requireAuth, async (req, res) => {
    const questionId = req.params.id;
    const { data: answerRows, error: ansErr } = await supabase
        .from('answers')
        .select('id')
        .eq('question_id', questionId);
    if (ansErr) return res.status(500).json({ error: ansErr.message });
    const targetIds = [questionId, ...(answerRows ?? []).map((a) => a.id)];
    const { data, error } = await supabase
        .from('votes')
        .select('id, target_id, target_type, value')
        .eq('user_id', req.user.id)
        .in('target_id', targetIds);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data ?? []);
});

/**
 * POST /questions/:id/comments
 * Protected. Adds a comment to the question.
 * body: { body: string }
 */
router.post('/:id/comments', requireAuth, async (req, res) => {
    const body = req.body?.body;
    if (!body || String(body).trim().length === 0) {
        return res.status(400).json({ error: 'body required' });
    }
    const { data, error } = await supabase
        .from('comments')
        .insert({
            author_id: req.user.id,
            target_id: req.params.id,
            target_type: 'question',
            body: String(body).trim(),
        })
        .select('id,body,target_id,target_type,created_at,author:profiles(username)')
        .single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
});

/**
 * POST /questions/:id/answers
 * Protected. Adds an answer to the question.
 * body: { body: string }
 */
router.post('/:id/answers', requireAuth, async (req, res) => {
    const body = req.body?.body;
    if (!body || String(body).trim().length === 0) {
        return res.status(400).json({ error: 'body required' });
    }

    // Confirm the parent question exists before inserting, so a bad
    // question_id surfaces as a clean 404 instead of a foreign-key 500.
    const { data: parent, error: parentError } = await supabase
        .from('questions')
        .select('id')
        .eq('id', req.params.id)
        .maybeSingle();
    if (parentError) return res.status(500).json({ error: parentError.message });
    if (!parent) return res.status(404).json({ error: 'question not found' });

    const { data, error } = await supabase
        .from('answers')
        .insert({
            question_id: req.params.id,
            author_id: req.user.id,
            body: String(body).trim(),
        })
        .select(
            'id,body,question_id,author_id,vote_count,is_accepted,created_at,author:profiles(id,username)',
        )
        .single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
});

module.exports = router;
