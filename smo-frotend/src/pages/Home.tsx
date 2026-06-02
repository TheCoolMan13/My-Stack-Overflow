import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import QuestionCard from '../components/QuestionCard';
import type { QuestionSummary } from '../types';
import * as api from '../lib/api';

const filters = ['Newest', 'Active', 'Unanswered', 'Top voted'] as const;
type Filter = (typeof filters)[number];

function Home() {
    const [questions, setQuestions] = useState<QuestionSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<Filter>('Newest');

    useEffect(() => {
        api.getQuestions().then((result) => {
            if (result.error || !result.data) {
                setError(result.error ?? 'Failed to load questions');
            } else {
                // Map the API response to the QuestionSummary shape the UI uses
                setQuestions(
                    result.data.map((q) => ({
                        id: q.id,
                        title: q.title,
                        is_solved: q.is_solved,
                        vote_count: q.vote_count,
                        created_at: q.created_at,
                        author: q.author,
                        question_tags: q.question_tags,
                        // The backend returns answers as [{ count: number }] for the list view
                        answer_count:
                            Array.isArray(q.answers) && q.answers.length > 0
                                ? (q.answers[0] as { count: number }).count
                                : 0,
                    })),
                );
            }
            setLoading(false);
        });
    }, []);

    // Client-side sort so we don't need extra API calls for filter changes
    const sorted = [...questions].sort((a, b) => {
        if (activeFilter === 'Top voted') return b.vote_count - a.vote_count;
        if (activeFilter === 'Unanswered') {
            // Unanswered first, then newest
            if (a.answer_count !== b.answer_count) return a.answer_count - b.answer_count;
        }
        // Default: newest first
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const displayed =
        activeFilter === 'Unanswered' ? sorted.filter((q) => q.answer_count === 0) : sorted;

    return (
        <div className="page">
            <NavBar />

            <section className="hero">
                <div className="hero__inner">
                    <span className="hero__eyebrow">
                        <span className="hero__eyebrow-dot" />
                        Community Q&amp;A
                    </span>
                    <h1 className="hero__title">
                        Questions,<br />
                        <span className="hero__title-accent">answered beautifully.</span>
                    </h1>
                    <p className="hero__subtitle">
                        Ask the community. Get clear answers from people who've been there.
                        A calmer place to get unstuck.
                    </p>
                    <div className="hero__actions">
                        <Link to="/ask" className="btn btn-primary">Ask a question</Link>
                        <button className="btn btn-ghost">Browse tags →</button>
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="section__head">
                    <div>
                        <h2 className="section__title">Latest questions</h2>
                        <p className="section__subtitle">
                            {loading ? 'Loading…' : `${questions.length} questions from the community`}
                        </p>
                    </div>

                    <div className="segmented">
                        {filters.map((f) => (
                            <button
                                key={f}
                                className={`segmented__btn ${f === activeFilter ? 'segmented__btn--active' : ''}`}
                                onClick={() => setActiveFilter(f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <p style={{ color: 'var(--color-error, #f87171)', textAlign: 'center', padding: '2rem 0' }}>
                        {error}
                    </p>
                )}

                {loading && !error && (
                    <p style={{ textAlign: 'center', padding: '2rem 0', opacity: 0.6 }}>
                        Loading questions…
                    </p>
                )}

                {!loading && !error && displayed.length === 0 && (
                    <p style={{ textAlign: 'center', padding: '2rem 0', opacity: 0.6 }}>
                        {activeFilter === 'Unanswered' ? 'No unanswered questions right now.' : 'No questions yet. Be the first to ask one!'}
                    </p>
                )}

                <div className="grid-cards">
                    {displayed.map((question) => (
                        <QuestionCard key={question.id} question={question} />
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Home;
