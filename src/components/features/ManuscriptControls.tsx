'use client';

import { useState, useRef, useEffect } from 'react';
import { deleteManuscript, updateManuscriptCategories } from '@/app/actions/manuscripts';
import { Category } from '@/utils/supabase/api';
import { Trash2, Edit, Check } from 'lucide-react';

interface Props {
    manuscriptId: string;
    currentCategoryId: string;
    currentCategorySlug: string;
    allCategories: Category[];
    assignedCategories: Category[];
}

export default function ManuscriptControls({ manuscriptId, currentCategoryId, currentCategorySlug, allCategories, assignedCategories }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isChanging, setIsChanging] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(assignedCategories.map(c => c.id)));

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to remove this manuscript completely?')) {
            return;
        }

        setIsDeleting(true);
        const result = await deleteManuscript(manuscriptId, currentCategorySlug);
        if (!result.success) {
            alert('Failed to delete: ' + result.error);
            setIsDeleting(false);
        }
    };

    const toggleCategory = (categoryId: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(categoryId)) {
            newSelected.delete(categoryId);
        } else {
            newSelected.add(categoryId);
        }
        setSelectedIds(newSelected);
    };

    const handleSaveCategories = async () => {
        setIsChanging(true);
        const result = await updateManuscriptCategories(manuscriptId, Array.from(selectedIds), currentCategorySlug);
        if (!result.success) {
            alert('Failed to update categories: ' + result.error);
        }
        setIsChanging(false);
        setIsDropdownOpen(false);
    };

    return (
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 mt-2 pt-2 border-t border-gray-100 relative">
            <div className="flex items-center gap-2 w-full sm:w-auto relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={isChanging || isDeleting}
                    className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded px-3 py-1.5 outline-none hover:bg-gray-100 transition-colors"
                >
                    <Edit className="w-4 h-4 text-gray-500" />
                    {isChanging ? 'Saving...' : 'Categories...'}
                </button>

                {isDropdownOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden z-50 flex flex-col">
                        <div className="p-2 max-h-48 overflow-y-auto">
                            {allCategories.map(cat => (
                                <label key={cat.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer group relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={selectedIds.has(cat.id)}
                                        onChange={() => toggleCategory(cat.id)}
                                    />
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedIds.has(cat.id) ? 'bg-brand-blue border-brand-blue' : 'border-gray-300 group-hover:border-brand-blue'}`}>
                                        {selectedIds.has(cat.id) && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className="text-sm text-gray-700">{cat.name}</span>
                                </label>
                            ))}
                        </div>
                        <div className="border-t border-gray-100 p-2 bg-gray-50 flex justify-end">
                            <button
                                onClick={handleSaveCategories}
                                disabled={isChanging}
                                className="px-3 py-1 bg-brand-blue text-white text-xs rounded hover:bg-brand-blue-dark transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={handleDelete}
                disabled={isDeleting || isChanging}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 px-2 py-1 ml-auto sm:ml-2"
            >
                <Trash2 className="w-3 h-3" />
                {isDeleting ? 'Removing...' : 'Remove'}
            </button>
        </div>
    );
}
