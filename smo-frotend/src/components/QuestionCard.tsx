import { Link } from 'react-router-dom';
import type { QuestionSummary } from '../types';
import TagPill from './tagPill';

interface QuestionCardProps {
    question: QuestionSummary;
}

function QuestionCard({ question }: QuestionCardProps) {
    return (
        <Link to={`/questions/${question.id}`} className="qcard__link">
            <article className="qcard">

                <div className="qcard__top">
                    <span className={`status ${question.is_solved ? 'status--solved' : 'status--open'}`}>
                        {question.is_solved && (
                            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 1 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        )}
                        {question.is_solved ? 'Solved' : 'Open'}
                    </span>
                    <span className="qcard__date">{question.created_at}</span>
                </div>

                <h3 className="qcard__title">{question.title}</h3>

                <div className="qcard__tags">
                    {question.question_tags.map((tagItem, index) => (
                        <TagPill key={index} questionTag={tagItem} />
                    ))}
                </div>

                <div className="qcard__foot">
                    <div className="author">
                        <div className="author__avatar">
                            {question.author?.username?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="author__info">
                            <span className="author__name">
                                {question.author?.username ?? 'anonymous'}
                            </span>
                            <span className="author__role">Community member</span>
                        </div>
                    </div>

                    <div className="stats">
                        <span className="stat" title="Votes">
                            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path d="M3.172 5.172a4 4 0 0 1 5.656 0L10 6.343l1.172-1.171a4 4 0 1 1 5.656 5.656L10 17.657l-6.828-6.829a4 4 0 0 1 0-5.656z" />
                            </svg>
                            {question.vote_count}
                        </span>
                        <span className="stat" title="Answers">
                            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M18 5v8a2 2 0 0 1-2 2h-5l-5 4v-4H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" clipRule="evenodd" />
                            </svg>
                            {question.answer_count}
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}

export default QuestionCard;
