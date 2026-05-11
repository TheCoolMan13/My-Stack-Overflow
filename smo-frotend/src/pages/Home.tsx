import type { QuestionSummary } from '../types';
import TagPill from '../components/tagPill';
import NavBar from '../components/NavBar';

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
        <div className="min-h-screen bg-white">
            <NavBar />

            <main className="max-w-6xl mx-auto px-6 py-10">

                {/* Page heading */}
                <div className="flex items-end justify-between mb-8 pb-6 border-b border-[#e8eaed]">
                    <div>
                        <h1 className="text-[28px] font-normal text-[#202124] tracking-tight leading-tight">
                            All Questions
                        </h1>
                        <p className="text-sm text-[#5f6368] mt-1">
                            {mockQuestionSummaries.length} questions from the community
                        </p>
                    </div>
                    <button className="bg-[#1a73e8] text-white text-sm px-5 py-2.5 rounded-full font-medium hover:bg-[#1765cc] hover:shadow-md transition-all cursor-pointer">
                        Ask a question
                    </button>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-1 mb-6">
                    {filters.map((f, i) => (
                        <button
                            key={f}
                            className={`text-sm px-4 py-2 rounded-full font-medium transition cursor-pointer ${
                                i === 0
                                    ? 'bg-[#e8f0fe] text-[#1967d2]'
                                    : 'text-[#5f6368] hover:bg-[#f1f3f4]'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Question list */}
                <div className="flex flex-col">
                    {mockQuestionSummaries.map((question, idx) => (
                        <article
                            key={question.id}
                            className={`flex gap-5 py-5 px-2 -mx-2 rounded-lg hover:bg-[#f8f9fa] transition cursor-pointer ${
                                idx !== mockQuestionSummaries.length - 1 ? 'border-b border-[#e8eaed]' : ''
                            }`}
                        >
                            {/* Stats column */}
                            <div className="flex flex-col items-end gap-2 min-w-[72px] text-right pt-1">
                                <div className="text-sm text-[#5f6368]">
                                    <span className="text-[#202124] font-medium">{question.vote_count}</span> votes
                                </div>
                                <div className={`text-sm px-2 py-0.5 rounded ${
                                    question.is_solved
                                        ? 'bg-[#e6f4ea] text-[#188038] font-medium'
                                        : 'text-[#5f6368]'
                                }`}>
                                    <span className={question.is_solved ? '' : 'text-[#202124] font-medium'}>{question.answer_count}</span> {question.is_solved ? '✓' : 'answers'}
                                </div>
                            </div>

                            {/* Content column */}
                            <div className="flex-1 min-w-0">
                                <h2 className="text-base font-medium text-[#1a73e8] hover:underline leading-snug mb-2">
                                    {question.title}
                                </h2>

                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {question.question_tags.map((tagItem, index) => (
                                        <TagPill key={index} questionTag={tagItem} />
                                    ))}
                                </div>

                                <div className="flex items-center gap-2 text-xs text-[#5f6368]">
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#1a73e8] to-[#174ea6] flex items-center justify-center text-white text-[10px] font-semibold">
                                        {question.author?.username?.[0]?.toUpperCase() ?? '?'}
                                    </div>
                                    <span className="font-medium text-[#202124]">
                                        {question.author?.username ?? 'anonymous'}
                                    </span>
                                    <span className="text-[#80868b]">asked on {question.created_at}</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default Home;
