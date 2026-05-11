import type { QuestionTag } from '../types';

interface TagPillProps {
    questionTag: QuestionTag;
}

function TagPill({ questionTag }: TagPillProps) {
    return <span className="tag">{questionTag.tag.name}</span>;
}

export default TagPill;
