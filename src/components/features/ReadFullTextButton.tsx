'use client';

import { trackReadClick } from '@/app/actions/tracking';
import { ExternalLink } from 'lucide-react';

interface Props {
    manuscriptId: string;
    url: string;
}

export default function ReadFullTextButton({ manuscriptId, url }: Props) {
    const handleClick = () => {
        trackReadClick(manuscriptId);
    };

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="text-sm font-medium text-brand-blue hover:text-brand-blue-dark flex items-center"
        >
            Read Full Text
            <ExternalLink className="w-4 h-4 ml-1" />
        </a>
    );
}
