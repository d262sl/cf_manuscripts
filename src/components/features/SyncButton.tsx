'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SyncButton() {
    const [isSyncing, setIsSyncing] = useState(false);
    const router = useRouter();

    const handleSync = async () => {
        try {
            setIsSyncing(true);
            const res = await fetch('/api/sync-pubmed');
            const data = await res.json();

            if (data.success) {
                alert(data.message);
                router.refresh(); // Refresh the page to show new data
            } else {
                alert('Sync failed: ' + data.error);
            }
        } catch (error) {
            alert('An error occurred during sync.');
            console.error(error);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-1 ${isSyncing ? 'opacity-70 cursor-wait' : ''}`}
        >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-brand-blue' : ''}`} />
            {isSyncing ? 'Syncing PubMed...' : 'Sync PubMed'}
        </button>
    );
}
