'use client';

import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Manuscript } from '@/utils/supabase/api';

interface ChartProps {
    manuscripts: Manuscript[];
    title: string;
}

export default function CategoryChart({ manuscripts, title }: ChartProps) {
    const data = useMemo(() => {
        // Group manuscripts by year
        const yearCounts = manuscripts.reduce((acc, manuscript) => {
            if (!manuscript.publication_date) return acc;

            const year = new Date(manuscript.publication_date).getFullYear().toString();
            acc[year] = (acc[year] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Convert to array format expected by Recharts and sort by year
        return Object.entries(yearCounts)
            .map(([year, count]) => ({
                year,
                count,
            }))
            .sort((a, b) => a.year.localeCompare(b.year));
    }, [manuscripts]);

    if (data.length === 0) {
        return (
            <div className="w-full h-[400px] flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 shadow-inner">
                <p className="text-gray-500 font-medium">No timeline data available</p>
            </div>
        );
    }

    return (
        <div className="w-full h-[400px] p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-brand-blue-dark mb-6">{title}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="year"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        allowDecimals={false}
                    />
                    <Tooltip
                        cursor={{ fill: '#F3F4F6' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                        formatter={(value: number | undefined) => {
                            if (value === undefined) return ['0', 'Total'];
                            return [`${value} ${value === 1 ? 'Publication' : 'Publications'}`, 'Total'];
                        }}
                        labelStyle={{ color: '#004F71', fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Bar
                        dataKey="count"
                        fill="#FFC20E"
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                        activeBar={{ fill: '#004F71' }}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
