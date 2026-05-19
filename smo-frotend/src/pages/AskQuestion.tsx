import { useState, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { useAuth } from '../hooks/useAuth';

const POPULAR_TAGS = [
    'javascript', 'typescript', 'react', 'css', 'html',
    'node', 'python', 'sql', 'supabase', 'tailwind',
];

const TITLE_MAX = 150;

function AskQuestion() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagDraft, setTagDraft] = useState('');
    const [allowAI, setAllowAI] = useState(true);

    const canSubmit =
        title.trim().length >= 10 &&
        description.trim().length >= 20 &&
        tags.length > 0;

    function addTag(raw: string) {
        const t = raw.trim().toLowerCase().replace(/\s+/g, '-');
        if (!t) return;
        if (tags.includes(t)) return;
        if (tags.length >= 5) return;
        setTags([...tags, t]);
        setTagDraft('');
    }

    function removeTag(t: string) {
        setTags(tags.filter((x) => x !== t));
    }

    function onTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(tagDraft);
        } else if (e.key === 'Backspace' && tagDraft === '' && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
        }
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        // Mock — would POST to API. For now, jump back to home.
        console.log('New question:', { title, description, tags, allowAI });
        navigate('/');
    }

    return (
        <div className="page">
            <NavBar />

            <main className="ask">

                <Link to="/" className="detail__back">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 0 1 0 1.414L9.414 10l3.293 3.293a1 1 0 0 1-1.414 1.414l-4-4a1 1 0 0 1 0-1.414l4-4a1 1 0 0 1 1.414 0z" clipRule="evenodd" />
                    </svg>
                    Cancel
                </Link>

                <header className="ask__header">
                    <h1 className="ask__title">Ask a question</h1>
                    <p className="ask__subtitle">
                        Get help from the community. Be specific, share what you've tried,
                        and the answers will follow.
                    </p>
                </header>

                <div className="ask__layout">

                    <form className="ask__form" onSubmit={onSubmit}>

                        {/* Title */}
                        <div className="field">
                            <div className="field__label-row">
                                <label htmlFor="title" className="field__label">Title</label>
                                <span className={`field__counter ${title.length > TITLE_MAX ? 'is-over' : ''}`}>
                                    {title.length}/{TITLE_MAX}
                                </span>
                            </div>
                            <p className="field__hint">
                                Imagine you're asking a colleague. Be specific.
                            </p>
                            <input
                                id="title"
                                className="input input--lg"
                                value={title}
                                onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX + 20))}
                                placeholder="e.g. How do I debounce a function in React without losing state?"
                                maxLength={TITLE_MAX + 20}
                            />
                        </div>

                        {/* Description */}
                        <div className="field">
                            <label htmlFor="description" className="field__label">
                                What are you trying to do?
                            </label>
                            <p className="field__hint">
                                Include any code you've already tried. Use triple backticks for code blocks.
                            </p>

                            <div className="editor">
                                <div className="editor__toolbar">
                                    <button type="button" className="editor__tool" title="Bold"><strong>B</strong></button>
                                    <button type="button" className="editor__tool" title="Italic"><em>I</em></button>
                                    <button type="button" className="editor__tool" title="Code">{'</>'}</button>
                                    <button type="button" className="editor__tool" title="Link">🔗</button>
                                    <button type="button" className="editor__tool" title="List">≣</button>
                                    <span className="editor__spacer" />
                                    <button type="button" className="editor__tool editor__tool--accent" title="Ask AI to refine">
                                        ✨ Refine with AI
                                    </button>
                                </div>
                                <textarea
                                    id="description"
                                    className="editor__area"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={"Describe your problem in detail.\n\n```js\n// paste your code here\n```\n\nWhat have you tried so far?"}
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="field">
                            <div className="field__label-row">
                                <label htmlFor="tag-input" className="field__label">Tags</label>
                                <span className="field__counter">{tags.length}/5</span>
                            </div>
                            <p className="field__hint">
                                Add up to 5 tags to describe what your question is about.
                            </p>

                            <div className="tag-input">
                                {tags.map((t) => (
                                    <span key={t} className="tag tag--editable">
                                        {t}
                                        <button
                                            type="button"
                                            className="tag__remove"
                                            onClick={() => removeTag(t)}
                                            aria-label={`Remove ${t}`}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                                <input
                                    id="tag-input"
                                    className="tag-input__field"
                                    value={tagDraft}
                                    onChange={(e) => setTagDraft(e.target.value)}
                                    onKeyDown={onTagKeyDown}
                                    placeholder={tags.length === 0 ? 'Type a tag and press Enter' : ''}
                                    disabled={tags.length >= 5}
                                />
                            </div>

                            <div className="suggested">
                                <span className="suggested__label">Popular:</span>
                                {POPULAR_TAGS.filter((t) => !tags.includes(t))
                                    .slice(0, 7)
                                    .map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            className="tag tag--suggest"
                                            onClick={() => addTag(t)}
                                        >
                                            + {t}
                                        </button>
                                    ))}
                            </div>
                        </div>

                        {/* AI toggle */}
                        <div className="field">
                            <label className="ai-toggle">
                                <div className="ai-toggle__icon">✨</div>
                                <div className="ai-toggle__copy">
                                    <span className="ai-toggle__title">Allow AI Companion to answer</span>
                                    <span className="ai-toggle__desc">
                                        Get an instant draft answer from llama-3.1-8b alongside community responses.
                                    </span>
                                </div>
                                <span className="switch">
                                    <input
                                        type="checkbox"
                                        checked={allowAI}
                                        onChange={(e) => setAllowAI(e.target.checked)}
                                    />
                                    <span className="switch__track" />
                                </span>
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="ask__actions">
                            <Link to="/" className="btn btn-ghost">Discard</Link>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={!canSubmit}
                            >
                                Post your question
                            </button>
                        </div>
                    </form>

                    {/* Sidebar guidance */}
                    <aside className="ask__aside">
                        <div className="aside-card">
                            <h3 className="aside-card__title">Writing a good question</h3>
                            <ul className="aside-card__list">
                                <li>Summarize the problem in the title.</li>
                                <li>Describe what you've tried and what you expected.</li>
                                <li>Add tags to help the right people find it.</li>
                                <li>Format code blocks with triple backticks.</li>
                                <li>Proof-read before posting.</li>
                            </ul>
                        </div>

                        {user && (
                            <div className="aside-card aside-card--soft">
                                <span className="aside-card__eyebrow">Posting as</span>
                                <div className="author" style={{ marginTop: 8 }}>
                                    <div className="author__avatar">{user.avatarInitial}</div>
                                    <div className="author__info">
                                        <span className="author__name">{user.username}</span>
                                        <span className="author__role">
                                            {user.reputation.toLocaleString()} rep
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </main>
        </div>
    );
}

export default AskQuestion;
