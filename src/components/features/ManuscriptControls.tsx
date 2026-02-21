'use client';

import { useState } from 'react';
import { deleteManuscript, recategorizeManuscript } from '@/app/actions/manuscripts';
import { Category } from '@/utils/supabase/api';
import { Trash2, Edit } from 'lucide-react';

interface Props {
    manuscriptId: string;
    currentCategoryId: string;
    currentCategorySlug: string;
    categories: Category[];
}

export default function ManuscriptControls({ manuscriptId, currentCategoryId, currentCategorySlug, categories }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isChanging, setIsChanging] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to remove this manuscript? It will be safely ignored in future PubMed syncs.')) {
            return;
        }

        setIsDeleting(true);
        const result = await deleteManuscript(manuscriptId, currentCategorySlug);
        if (!result.success) {
            alert('Failed to delete: ' + result.error);
            setIsDeleting(false);
        }
        // Note: revalidatePath will automatically update the UI on success.
    };

    const handleChangeCategory = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategoryId = e.target.value;
        if (newCategoryId === currentCategoryId || !newCategoryId) return;

        setIsChanging(true);
        const result = await recategorizeManuscript(manuscriptId, newCategoryId, currentCategorySlug);
        if (!result.success) {
            alert('Failed to re-categorize: ' + result.error);
            setIsChanging(false);
            e.target.value = ''; // Reset select
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Edit className="w-4 h-4 text-gray-400" />
                <select
                    className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none w-full sm:w-auto"
                    onChange={handleChangeCategory}
                    disabled={isChanging || isDeleting}
                    value=""
                >
                    <option value="" disabled>Move to...</option>
                    {categories.filter(c => c.id !== currentCategoryId).map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            <button
                onClick={handleDelete}
                disabled={isDeleting || isChanging}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 px-2 py-1"
            >
                <Trash2 className="w-3 h-3" />
                {isDeleting ? 'Removing...' : 'Remove'}
            </button>
        </div>
    );
}
