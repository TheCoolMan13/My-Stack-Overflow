const express = require('express');
const supabase = require('../supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * PATCH /answers/:id/accept
 * Protected. Toggle accepted status on an answer — Stack Overflow style.
 *
 * Only the QUESTION author can accept an answer (not the answer author).
 *
 * Semantics:
 *   - accepting an unaccepted answer:
 *       * un-accept any currently-accepted answer on this question
 *       * set this answer is_accepted = true
 *       * set question is_solved = true
 *   - toggling off an already-accepted answer:
 *       * set this answer is_accepted = false
 *       * set question is_solved = false
 */
router.patch('/:id/accept', requireAuth, async (req, res) => {
    const answerId = req.params.id;

    // Load the answer we're acting on
    const { data: answer, error: answerErr } = await supabase
        .from('answers')
        .select('id, author_id, is_accepted, question_id')
        .eq('id', answerId)
        .maybeSingle();
    if (answerErr) return res.status(500).json({ error: answerErr.message });
    if (!answer) return res.status(404).json({ error: 'answer not found' });

    // Load the parent question to check ownership
    const { data: question, error: questionErr } = await supabase
        .from('questions')
        .select('id, author_id')
        .eq('id', answer.question_id)
        .maybeSingle();
    if (questionErr) return res.status(500).json({ error: questionErr.message });
    if (!question) return res.status(500).json({ error: 'parent question not found' });

    // Only the question author can accept/unaccept answers
    if (question.author_id !== req.user.id) {
        return res.status(403).json({ error: 'only the question author can accept answers' });
    }

    const willAccept = !answer.is_accepted;

    if (willAccept) {
        // Un-accept any currently accepted answer on this question first
        const { error: unacceptErr } = await supabase
            .from('answers')
            .update({ is_accepted: false })
            .eq('question_id', answer.question_id)
            .eq('is_accepted', true);
        if (unacceptErr) return res.status(500).json({ error: unacceptErr.message });

        // Accept this answer
        const { data: updated, error: acceptErr } = await supabase
            .from('answers')
            .update({ is_accepted: true })
            .eq('id', answerId)
            .select('id, is_accepted, question_id, body, author_id, vote_count, created_at, author:profiles(id,username)')
            .single();
        if (acceptErr) return res.status(500).json({ error: acceptErr.message });

        // Mark the question as solved
        const { error: solveErr } = await supabase
            .from('questions')
            .update({ is_solved: true })
            .eq('id', answer.question_id);
        if (solveErr) return res.status(500).json({ error: solveErr.message });

        return res.json(updated);
    }

    // Toggle off — un-accept this answer
    const { data: updated, error: unacceptErr } = await supabase
        .from('answers')
        .update({ is_accepted: false })
        .eq('id', answerId)
        .select('id, is_accepted, question_id, body, author_id, vote_count, created_at, author:profiles(id,username)')
        .single();
    if (unacceptErr) return res.status(500).json({ error: unacceptErr.message });

    // Mark the question as unsolved
    const { error: unsolveErr } = await supabase
        .from('questions')
        .update({ is_solved: false })
        .eq('id', answer.question_id);
    if (unsolveErr) return res.status(500).json({ error: unsolveErr.message });

    res.json(updated);
});

/**
 * PATCH /answers/:id/vote
 * Protected. Reddit-style vote toggle. body: { value: 1 | -1 }
 *
 * The votes table has: id, question_id (nullable), answer_id (nullable),
 * user_id, value.  For answer votes we use answer_id.
 *
 * Toggle logic (mirrors question voting):
 *   - no prior vote   → insert,  delta = clicked
 *   - same direction  → delete,  delta = -clicked   (toggle off)
 *   - opposite        → update,  delta = 2 * clicked (switch)
 */
router.patch('/:id/vote', requireAuth, async (req, res) => {
    const answerId = req.params.id;
    const clicked = Number(req.body?.value);
    if (clicked !== 1 && clicked !== -1) {
        return res.status(400).json({ error: 'value must be 1 or -1' });
    }

    // Check for an existing vote by this user on this answer
    const { data: existing, error: lookupErr } = await supabase
        .from('votes')
        .select('id, value')
        .eq('user_id', req.user.id)
        .eq('answer_id', answerId)
        .maybeSingle();
    if (lookupErr) return res.status(500).json({ error: lookupErr.message });

    let delta;
    if (!existing) {
        delta = clicked;
        const { error } = await supabase.from('votes').insert({
            user_id: req.user.id,
            answer_id: answerId,
            value: clicked,
        });
        if (error) return res.status(500).json({ error: error.message });
    } else if (existing.value === clicked) {
        // Toggle off
        delta = -clicked;
        const { error } = await supabase.from('votes').delete().eq('id', existing.id);
        if (error) return res.status(500).json({ error: error.message });
    } else {
        // Switch direction
        delta = 2 * clicked;
        const { error } = await supabase
            .from('votes')
            .update({ value: clicked })
            .eq('id', existing.id);
        if (error) return res.status(500).json({ error: error.message });
    }

    // Read-modify-write the answer's cached vote_count
    const { data: aRow, error: aErr } = await supabase
        .from('answers')
        .select('vote_count')
        .eq('id', answerId)
        .single();
    if (aErr) return res.status(500).json({ error: aErr.message });

    const newCount = (aRow.vote_count ?? 0) + delta;
    const { error: patchErr } = await supabase
        .from('answers')
        .update({ vote_count: newCount })
        .eq('id', answerId);
    if (patchErr) return res.status(500).json({ error: patchErr.message });

    res.json({ vote_count: newCount });
});

module.exports = router;
