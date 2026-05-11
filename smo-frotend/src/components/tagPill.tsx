import type { QuestionTag } from '../types';

interface TagPillProps {
    questionTag: QuestionTag;
}

function TagPill({ questionTag }: TagPillProps) {
    return (
        <span className="inline-flex items-center bg-[#e8f0fe] text-[#1967d2] text-xs font-medium px-2.5 py-1 rounded-md hover:bg-[#d2e3fc] transition cursor-pointer">
            {questionTag.tag.name}
        </span>
    );
}

export default TagPill;
