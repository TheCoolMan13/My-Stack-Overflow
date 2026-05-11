import type { QuestionSummary } from '../types';
import NavBar from '../components/NavBar';
import QuestionCard from '../components/QuestionCard';

const mockQuestionSummaries: QuestionSummary[] = [
    {
        id: 'q1',
        title: 'How do I center a div in CSS?',
        is_solved: true,
        vote_count: 12,
        created_at: '2026-05-11',
        author: { id: 'u1', username: 'titus' },
        question_tags: [{ tag: { name: 'css' } }, { tag: { name: 'html' } }],
        answer_count: 3,
    },
    {
        id: 'q2',
        title: 'Difference between let, const and var in JavaScript',
        is_solved: false,
        vote_count: 7,
        created_at: '2026-05-10',
        author: { id: 'u2', username: 'alex_dev' },
        question_tags: [{ tag: { name: 'javascript' } }, { tag: { name: 'typescript' } }],
        answer_count: 1,
    },
    {
        id: 'q3',
        title: 'How to connect Supabase with React?',
        is_solved: true,
        vote_count: 20,
        created_at: '2026-05-09',
        author: { id: 'u3', username: 'rob' },
        question_tags: [{ tag: { name: 'react' } }, { tag: { name: 'supabase' } }],
        answer_count: 5,
    },
];

const filters = ['Newest', 'Active', 'Unanswered', 'Top voted'] as const;

function Home() {
    return (
        <div className="page">
            <NavBar />

            <section className="hero">
                <div className="hero__inner">
                    <span className="hero__eyebrow">
                        <span className="hero__eyebrow-dot" />
                        Powered by llama-3.1-8b
                    </span>
                    <h1 className="hero__title">
                        Questions,<br />
                        <span className="hero__title-accent">answered beautifully.</span>
                    </h1>
                    <p className="hero__subtitle">
                        Ask the community. Let the AI companion help you think it through.
                        A calmer place to get unstuck.
                    </p>
                    <div className="hero__actions">
                        <button className="btn btn-primary">Ask a question</button>
                        <button className="btn btn-ghost">Browse tags →</button>
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="section__head">
                    <div>
                        <h2 className="section__title">Latest questions</h2>
                        <p className="section__subtitle">
                            {mockQuestionSummaries.length} questions from the community
                        </p>
                    </div>

                    <div className="segmented">
                        {filters.map((f, i) => (
                            <button
                                key={f}
                                className={`segmented__btn ${i === 0 ? 'segmented__btn--active' : ''}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid-cards">
                    {mockQuestionSummaries.map((question) => (
                        <QuestionCard key={question.id} question={question} />
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Home;
