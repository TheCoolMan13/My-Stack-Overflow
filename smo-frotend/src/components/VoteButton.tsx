import { useState } from 'react';

interface VoteButtonProps {
    /** Current vote count to display */
    count: number;
    /** The authenticated user's existing vote on this item, or 0 for none */
    userVote?: 1 | -1 | 0;
    /** Called when the user clicks upvote or downvote. Receives the intended vote value. */
    onVote: (value: 1 | -1) => Promise<void>;
    /** If true, shows the accepted-answer checkmark below the vote buttons */
    accepted?: boolean;
    /** Disable both buttons (e.g. when a request is in flight) */
    disabled?: boolean;
}

/**
 * VoteButton — reusable upvote / downvote widget.
 *
 * Handles its own disabled state while a vote is in flight so the parent
 * only needs to implement the async onVote handler. The parent is responsible
 * for optimistic updates and reverting on error.
 */
function VoteButton({
    count,
    userVote = 0,
    onVote,
    accepted = false,
    disabled = false,
}: VoteButtonProps) {
    const [pending, setPending] = useState(false);

    async function handleVote(value: 1 | -1) {
        if (pending || disabled) return;
        setPending(true);
        try {
            await onVote(value);
        } finally {
            setPending(false);
        }
    }

    const isDisabled = pending || disabled;

    return (
        <aside className="vote">
            <button
                className={`vote__btn ${userVote === 1 ? 'vote__btn--active' : ''}`}
                aria-label="Upvote"
                aria-pressed={userVote === 1}
                disabled={isDisabled}
                onClick={() => handleVote(1)}
            >
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill={userVote === 1 ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                >
                    <path d="M12 4 4 14h5v6h6v-6h5z" strokeLinejoin="round" />
                </svg>
            </button>

            <span className="vote__count" aria-label={`${count} votes`}>
                {count}
            </span>

            <button
                className={`vote__btn ${userVote === -1 ? 'vote__btn--active' : ''}`}
                aria-label="Downvote"
                aria-pressed={userVote === -1}
                disabled={isDisabled}
                onClick={() => handleVote(-1)}
            >
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill={userVote === -1 ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                >
                    <path d="M12 20 4 10h5V4h6v6h5z" strokeLinejoin="round" />
                </svg>
            </button>

            {accepted && (
                <div className="vote__accepted" title="Accepted answer">
                    <svg
                        width="22"
                        height="22"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-label="Accepted answer"
                    >
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            )}
        </aside>
    );
}

export default VoteButton;
