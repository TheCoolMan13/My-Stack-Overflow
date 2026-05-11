import { Link, useParams } from 'react-router-dom';
import type { Question } from '../types';
import NavBar from '../components/NavBar';
import TagPill from '../components/tagPill';

// Mock — in the real app this would come from an API call using the :id param
const mockQuestion: Question = {
    id: 'q1',
    title: 'How do I center a div in CSS?',
    description:
        "I've been struggling with centering a div both horizontally and vertically for a while now. I've tried using `margin: 0 auto` for horizontal centering, but I can't figure out the vertical part.\n\nWhat's the modern, preferred way to do this in 2026? I've heard Flexbox and Grid are good options but I'm not sure which to choose.\n\nHere's what I've tried so far:\n\n```css\n.container {\n  margin: 0 auto;\n  text-align: center;\n}\n```\n\nBut this doesn't vertically center anything. Any help would be appreciated!",
    author_id: 'u1',
    is_solved: true,
    allow_ai_companion: true,
    vote_count: 12,
    created_at: '2026-05-11',
    author: { id: 'u1', username: 'titus' },
    question_tags: [{ tag: { name: 'css' } }, { tag: { name: 'html' } }, { tag: { name: 'flexbox' } }],
    answers: [
        {
            id: 'a1',
            body:
                "The cleanest modern way is to use Flexbox. Three lines on the parent and you're done:\n\n```css\n.parent {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n```\n\nThis centers the child both horizontally and vertically regardless of its size. Works in every modern browser.",
            question_id: 'q1',
            author_id: 'u2',
            vote_count: 24,
            is_accepted: true,
            is_ai_generated: false,
            created_at: '2026-05-11',
            author: { id: 'u2', username: 'alex_dev' },
            comments: [
                {
                    id: 'c1',
                    body: 'This is the way. Flexbox all the way in 2026.',
                    target_id: 'a1',
                    target_type: 'answer',
                    created_at: '2026-05-11',
                    author: { id: 'u3', username: 'rob' },
                },
            ],
        },
        {
            id: 'a2',
            body:
                'You can also use CSS Grid if you prefer:\n\n```css\n.parent {\n  display: grid;\n  place-items: center;\n}\n```\n\n`place-items: center` is a shorthand for `align-items: center` + `justify-items: center`. Even more concise than Flexbox for pure centering.',
            question_id: 'q1',
            author_id: 'u3',
            vote_count: 8,
            is_accepted: false,
            is_ai_generated: false,
            created_at: '2026-05-11',
            author: { id: 'u3', username: 'rob' },
            comments: [],
        },
        {
            id: 'a3',
            body:
                "Both Flexbox and CSS Grid will work well here. A quick rule of thumb:\n\n- Use **Flexbox** when you're centering one item or laying out content in one dimension\n- Use **Grid** when you're working with a two-dimensional layout or want the `place-items: center` shorthand\n\nFor your specific case, either approach is idiomatic.",
            question_id: 'q1',
            author_id: 'ai',
            vote_count: 3,
            is_accepted: false,
            is_ai_generated: true,
            created_at: '2026-05-11',
            author: { id: 'ai', username: 'AI Companion' },
            comments: [],
        },
    ],
    comments: [
        {
            id: 'c2',
            body: "Have you tried Flexbox? It's the easiest solution.",
            target_id: 'q1',
            target_type: 'question',
            created_at: '2026-05-11',
            author: { id: 'u2', username: 'alex_dev' },
        },
    ],
};

function QuestionDetails() {
    useParams<{ id: string }>(); // stub — would fetch by id in the real app
    const question = mockQuestion;

    const acceptedAnswer = question.answers.find((a) => a.is_accepted);
    const otherAnswers = question.answers.filter((a) => !a.is_accepted);

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
                            Asked <strong>{question.created_at}</strong>
                        </span>
                        <span className="detail__meta-dot">·</span>
                        <span>
                            Viewed <strong>1,284 times</strong>
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

                {/* Body: vote sidebar + content */}
                <section className="post">
                    <VoteColumn count={question.vote_count} />

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
                                <button className="link-btn">Edit</button>
                                <button className="link-btn">Follow</button>
                            </div>
                            <AuthorCard
                                variant="asked"
                                username={question.author?.username ?? 'anonymous'}
                                date={question.created_at}
                            />
                        </div>

                        {question.comments.length > 0 && (
                            <CommentList comments={question.comments} />
                        )}
                    </div>
                </section>

                {/* Answers header */}
                <div className="answers__head">
                    <h2 className="answers__title">
                        {question.answers.length} Answers
                    </h2>
                    <div className="segmented">
                        <button className="segmented__btn segmented__btn--active">Highest score</button>
                        <button className="segmented__btn">Newest</button>
                        <button className="segmented__btn">Oldest</button>
                    </div>
                </div>

                {/* Accepted answer first */}
                {acceptedAnswer && <AnswerBlock answer={acceptedAnswer} />}
                {otherAnswers.map((a) => (
                    <AnswerBlock key={a.id} answer={a} />
                ))}

                {/* Your answer */}
                <section className="your-answer">
                    <h3 className="your-answer__title">Your Answer</h3>
                    <textarea
                        className="your-answer__editor"
                        placeholder="Write your answer here... Markdown is supported."
                    />
                    <div className="your-answer__foot">
                        <button className="btn btn-ghost">
                            ✨ Ask AI Companion
                        </button>
                        <button className="btn btn-primary">Post your answer</button>
                    </div>
                </section>
            </main>
        </div>
    );
}

/* ──────────────── Sub-components ──────────────── */

function VoteColumn({ count, accepted = false }: { count: number; accepted?: boolean }) {
    return (
        <aside className="vote">
            <button className="vote__btn" aria-label="Upvote">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 4 4 14h5v6h6v-6h5z" strokeLinejoin="round" />
                </svg>
            </button>
            <span className="vote__count">{count}</span>
            <button className="vote__btn" aria-label="Downvote">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20 4 10h5V4h6v6h5z" strokeLinejoin="round" />
                </svg>
            </button>
            {accepted && (
                <div className="vote__accepted" title="Accepted answer">
                    <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z" clipRule="evenodd" />
                    </svg>
                </div>
            )}
        </aside>
    );
}

function Prose({ body }: { body: string }) {
    // Minimal renderer: split on ``` blocks and render as <pre>, paragraphs otherwise
    const parts = body.split(/```/g);
    return (
        <div className="prose">
            {parts.map((chunk, i) => {
                if (i % 2 === 1) {
                    const firstLineBreak = chunk.indexOf('\n');
                    const code = firstLineBreak === -1 ? chunk : chunk.slice(firstLineBreak + 1);
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
    aiGenerated,
}: {
    username: string;
    date: string;
    variant: 'asked' | 'answered';
    aiGenerated?: boolean;
}) {
    return (
        <div className={`authorcard ${aiGenerated ? 'authorcard--ai' : ''}`}>
            <div className="authorcard__label">{variant === 'asked' ? 'asked' : 'answered'} on {date}</div>
            <div className="authorcard__body">
                <div className="author__avatar">
                    {aiGenerated ? '✨' : username[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="author__info">
                    <span className="author__name">{username}</span>
                    <span className="author__role">
                        {aiGenerated ? 'AI Companion' : '1,284 rep'}
                    </span>
                </div>
            </div>
        </div>
    );
}

function AnswerBlock({ answer }: { answer: Question['answers'][number] }) {
    return (
        <section className={`post ${answer.is_accepted ? 'post--accepted' : ''}`}>
            <VoteColumn count={answer.vote_count} accepted={answer.is_accepted} />

            <div className="post__body">
                {answer.is_accepted && (
                    <div className="post__badge post__badge--accepted">
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z" clipRule="evenodd" />
                        </svg>
                        Accepted answer
                    </div>
                )}
                {answer.is_ai_generated && (
                    <div className="post__badge post__badge--ai">✨ AI-generated</div>
                )}

                <Prose body={answer.body} />

                <div className="post__foot">
                    <div className="post__actions">
                        <button className="link-btn">Share</button>
                        <button className="link-btn">Comment</button>
                    </div>
                    <AuthorCard
                        variant="answered"
                        username={answer.author?.username ?? 'anonymous'}
                        date={answer.created_at}
                        aiGenerated={answer.is_ai_generated}
                    />
                </div>

                {answer.comments.length > 0 && <CommentList comments={answer.comments} />}
            </div>
        </section>
    );
}

function CommentList({ comments }: { comments: Question['comments'] }) {
    return (
        <ul className="comments">
            {comments.map((c) => (
                <li key={c.id} className="comment">
                    <span className="comment__body">{c.body}</span>
                    <span className="comment__meta">
                        – <span className="comment__author">{c.author?.username ?? 'anonymous'}</span>{' '}
                        <span className="comment__date">{c.created_at}</span>
                    </span>
                </li>
            ))}
            <li>
                <button className="comment__add">+ Add a comment</button>
            </li>
        </ul>
    );
}

export default QuestionDetails;
