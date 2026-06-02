import { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import TagPill from '../components/tagPill';
import VoteButton from '../components/VoteButton';
import { useAuth } from '../hooks/useAuth';
import * as api from '../lib/api';
import type { QuestionDetail, AnswerItem } from '../lib/api';

/* ─────────────────────────────────────────────
   Main page component
   ───────────────────────────────────────────── */
function QuestionDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [question, setQuestion] = useState<QuestionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Answer submission state
    const [answerBody, setAnswerBody] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [answerError, setAnswerError] = useState<string | null>(null);

    // Track the user's own votes keyed by item id so VoteButton can show active state
    const [myVotes, setMyVotes] = useState<Record<string, 1 | -1>>({});

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        api.getQuestion(id).then((result) => {
            if (result.error || !result.data) {
                setError(result.error ?? 'Question not found');
            } else {
                setQuestion(result.data);
            }
            setLoading(false);
        });
    }, [id]);

    /* ── Vote on question ── */
    async function handleQuestionVote(value: 1 | -1) {
        if (!isAuthenticated) {
            navigate('/signin');
            return;
        }
        if (!question) return;

        // Optimistic update: apply the vote delta immediately
        const prevCount = question.vote_count;
        const prevVote = myVotes[question.id] ?? 0;

        // Compute the optimistic delta
        let delta: number;
        if (prevVote === 0) delta = value;
        else if (prevVote === value) delta = -value; // toggle off
        else delta = 2 * value;                       // switch direction

        const optimisticCount = prevCount + delta;

        setQuestion((q) => q ? { ...q, vote_count: optimisticCount } : q);
        setMyVotes((v) => ({
            ...v,
            [question.id]: prevVote === value ? 0 : value,
        } as Record<string, 1 | -1>));

        const result = await api.voteQuestion(question.id, value);
        if (result.error || result.data === undefined) {
            // Revert on failure
            setQuestion((q) => q ? { ...q, vote_count: prevCount } : q);
            setMyVotes((v) => ({ ...v, [question.id]: prevVote as 1 | -1 }));
        } else {
            // Sync with server's authoritative count
            setQuestion((q) => q ? { ...q, vote_count: result.data!.vote_count } : q);
        }
    }

    /* ── Vote on answer ── */
    async function handleAnswerVote(answerId: string, value: 1 | -1) {
        if (!isAuthenticated) {
            navigate('/signin');
            return;
        }
        if (!question) return;

        const answer = question.answers.find((a) => a.id === answerId);
        if (!answer) return;

        const prevCount = answer.vote_count;
        const prevVote = myVotes[answerId] ?? 0;

        let delta: number;
        if (prevVote === 0) delta = value;
        else if (prevVote === value) delta = -value;
        else delta = 2 * value;

        // Optimistic update
        setQuestion((q) => {
            if (!q) return q;
            return {
                ...q,
                answers: q.answers.map((a) =>
                    a.id === answerId ? { ...a, vote_count: prevCount + delta } : a,
                ),
            };
        });
        setMyVotes((v) => ({
            ...v,
            [answerId]: prevVote === value ? 0 : value,
        } as Record<string, 1 | -1>));

        const result = await api.voteAnswer(answerId, value);
        if (result.error || result.data === undefined) {
            // Revert
            setQuestion((q) => {
                if (!q) return q;
                return {
                    ...q,
                    answers: q.answers.map((a) =>
                        a.id === answerId ? { ...a, vote_count: prevCount } : a,
                    ),
                };
            });
            setMyVotes((v) => ({ ...v, [answerId]: prevVote as 1 | -1 }));
        } else {
            setQuestion((q) => {
                if (!q) return q;
                return {
                    ...q,
                    answers: q.answers.map((a) =>
                        a.id === answerId ? { ...a, vote_count: result.data!.vote_count } : a,
                    ),
                };
            });
        }
    }

    /* ── Accept answer ── */
    async function handleAccept(answerId: string) {
        if (!isAuthenticated || !question) return;
        if (question.author_id !== user?.id) return;

        const result = await api.acceptAnswer(answerId);
        if (result.error || !result.data) return;

        // Update local state: un-accept all, then apply the server response
        setQuestion((q) => {
            if (!q) return q;
            const updatedAnswer = result.data!;
            return {
                ...q,
                is_solved: updatedAnswer.is_accepted,
                answers: q.answers.map((a) =>
                    a.id === answerId
                        ? { ...a, is_accepted: updatedAnswer.is_accepted }
                        : { ...a, is_accepted: false },
                ),
            };
        });
    }

    /* ── Submit new answer ── */
    async function handleSubmitAnswer(e: React.FormEvent) {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/signin');
            return;
        }
        if (!answerBody.trim() || !id) return;

        setSubmitting(true);
        setAnswerError(null);

        const result = await api.createAnswer(id, answerBody.trim());
        if (result.error || !result.data) {
            setAnswerError(result.error ?? 'Failed to post answer');
        } else {
            // Append the new answer to the list
            setQuestion((q) =>
                q ? { ...q, answers: [...q.answers, result.data!] } : q,
            );
            setAnswerBody('');
        }
        setSubmitting(false);
    }

    /* ── Render ── */
    if (loading) {
        return (
            <div className="page">
                <NavBar />
                <main className="detail">
                    <p style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.6 }}>
                        Loading…
                    </p>
                </main>
            </div>
        );
    }

    if (error || !question) {
        return (
            <div className="page">
                <NavBar />
                <main className="detail">
                    <Link to="/" className="detail__back">← All questions</Link>
                    <p style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-error, #f87171)' }}>
                        {error ?? 'Question not found.'}
                    </p>
                </main>
            </div>
        );
    }

    const acceptedAnswer = question.answers.find((a) => a.is_accepted);
    const otherAnswers = question.answers
        .filter((a) => !a.is_accepted)
        .sort((a, b) => b.vote_count - a.vote_count);

    const isQuestionAuthor = isAuthenticated && user?.id === question.author_id;

    return (
        <div className="page">
            <NavBar />

            <main className="detail">

                {/* Breadcrumb */}
                <Link to="/" className="detail__back">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 0 1 0 1.414L9.414 10l3.293 3.293a1 1 0 0 1-1.414 1.414l-4-4a1 1 0 0 1 0-1.414l4-4a1 1 0 0 1 1.414 0z" clipRule="evenodd" />
                    </svg>
                    All questions
                </Link>

                {/* Header */}
                <header className="detail__header">
                    <h1 className="detail__title">{question.title}</h1>
                    <div className="detail__meta">
                        <span>
                            Asked <strong>{new Date(question.created_at).toLocaleDateString()}</strong>
                        </span>
                        <span className="detail__meta-dot">·</span>
                        <span>
                            <strong>{question.answers.length}</strong> {question.answers.length === 1 ? 'answer' : 'answers'}
                        </span>
                        {question.is_solved && (
                            <>
                                <span className="detail__meta-dot">·</span>
                                <span className="status status--solved">
                                    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 1 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Solved
                                </span>
                            </>
                        )}
                    </div>
                </header>

                {/* Question body */}
                <section className="post">
                    <VoteButton
                        count={question.vote_count}
                        userVote={myVotes[question.id] ?? 0}
                        onVote={(v) => handleQuestionVote(v)}
                    />

                    <div className="post__body">
                        <Prose body={question.description} />

                        <div className="post__tags">
                            {question.question_tags.map((t, i) => (
                                <TagPill key={i} questionTag={t} />
                            ))}
                        </div>

                        <div className="post__foot">
                            <div className="post__actions">
                                <button className="link-btn">Share</button>
                            </div>
                            <AuthorCard
                                variant="asked"
                                username={question.author?.username ?? 'anonymous'}
                                date={new Date(question.created_at).toLocaleDateString()}
                            />
                        </div>
                    </div>
                </section>

                {/* Answers section */}
                {question.answers.length > 0 && (
                    <>
                        <div className="answers__head">
                            <h2 className="answers__title">
                                {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
                            </h2>
                        </div>

                        {/* Accepted answer always comes first */}
                        {acceptedAnswer && (
                            <AnswerBlock
                                answer={acceptedAnswer}
                                userVote={myVotes[acceptedAnswer.id] ?? 0}
                                canAccept={isQuestionAuthor}
                                onVote={(v) => handleAnswerVote(acceptedAnswer.id, v)}
                                onAccept={() => handleAccept(acceptedAnswer.id)}
                            />
                        )}
                        {otherAnswers.map((a) => (
                            <AnswerBlock
                                key={a.id}
                                answer={a}
                                userVote={myVotes[a.id] ?? 0}
                                canAccept={isQuestionAuthor}
                                onVote={(v) => handleAnswerVote(a.id, v)}
                                onAccept={() => handleAccept(a.id)}
                            />
                        ))}
                    </>
                )}

                {/* Post an answer */}
                <section className="your-answer">
                    <h3 className="your-answer__title">Your Answer</h3>
                    {!isAuthenticated ? (
                        <p style={{ opacity: 0.7, marginBottom: '1rem' }}>
                            <Link to="/signin" style={{ color: 'var(--color-primary, #6366f1)' }}>Sign in</Link> to post an answer.
                        </p>
                    ) : (
                        <form onSubmit={handleSubmitAnswer}>
                            <textarea
                                className="your-answer__editor"
                                placeholder="Write your answer here… Markdown is supported."
                                value={answerBody}
                                onChange={(e) => setAnswerBody(e.target.value)}
                                disabled={submitting}
                                rows={6}
                            />
                            {answerError && (
                                <p style={{ color: 'var(--color-error, #f87171)', marginTop: '0.5rem' }}>
                                    {answerError}
                                </p>
                            )}
                            <div className="your-answer__foot">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting || !answerBody.trim()}
                                >
                                    {submitting ? 'Posting…' : 'Post your answer'}
                                </button>
                            </div>
                        </form>
                    )}
                </section>
            </main>
        </div>
    );
}

/* ─────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────── */

function Prose({ body }: { body: string }) {
    const parts = body.split(/```/g);
    return (
        <div className="prose">
            {parts.map((chunk, i) => {
                if (i % 2 === 1) {
                    const firstBreak = chunk.indexOf('\n');
                    const code = firstBreak === -1 ? chunk : chunk.slice(firstBreak + 1);
                    return (
                        <pre key={i} className="prose__code">
                            <code>{code.trimEnd()}</code>
                        </pre>
                    );
                }
                return chunk
                    .split(/\n\n+/)
                    .filter((p) => p.trim())
                    .map((p, j) => <p key={`${i}-${j}`}>{p}</p>);
            })}
        </div>
    );
}

function AuthorCard({
    username,
    date,
    variant,
}: {
    username: string;
    date: string;
    variant: 'asked' | 'answered';
}) {
    return (
        <div className="authorcard">
            <div className="authorcard__label">{variant === 'asked' ? 'asked' : 'answered'} on {date}</div>
            <div className="authorcard__body">
                <div className="author__avatar">{username[0]?.toUpperCase() ?? '?'}</div>
                <div className="author__info">
                    <span className="author__name">{username}</span>
                </div>
            </div>
        </div>
    );
}

function AnswerBlock({
    answer,
    userVote,
    canAccept,
    onVote,
    onAccept,
}: {
    answer: AnswerItem;
    userVote: 1 | -1 | 0;
    canAccept: boolean;
    onVote: (v: 1 | -1) => Promise<void>;
    onAccept: () => void;
}) {
    return (
        <section className={`post ${answer.is_accepted ? 'post--accepted' : ''}`}>
            <VoteButton
                count={answer.vote_count}
                userVote={userVote}
                onVote={onVote}
                accepted={answer.is_accepted}
            />

            <div className="post__body">
                {answer.is_accepted && (
                    <div className="post__badge post__badge--accepted">
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z" clipRule="evenodd" />
                        </svg>
                        Accepted answer
                    </div>
                )}

                <Prose body={answer.body} />

                <div className="post__foot">
                    <div className="post__actions">
                        <button className="link-btn">Share</button>
                        {canAccept && (
                            <button
                                className="link-btn"
                                onClick={onAccept}
                                style={answer.is_accepted ? { color: 'var(--color-success, #4ade80)' } : {}}
                            >
                                {answer.is_accepted ? '✓ Accepted' : 'Accept'}
                            </button>
                        )}
                    </div>
                    <AuthorCard
                        variant="answered"
                        username={answer.author?.username ?? 'anonymous'}
                        date={new Date(answer.created_at).toLocaleDateString()}
                    />
                </div>
            </div>
        </section>
    );
}

export default QuestionDetails;
