import { cn } from '@/lib/utils';
import type { ToothCondition } from '@/lib/types';

interface ToothProps {
    number: number;
    type: 'adult' | 'child';
    status: ToothCondition;
    onClick: (number: number) => void;
}

const CONDITION_COLORS: Record<ToothCondition, string> = {
    caries: 'bg-red-500 border-red-600 text-white',
    filling: 'bg-blue-500 border-blue-600 text-white',
    implant: 'bg-purple-500 border-purple-600 text-white',
    crown: 'bg-yellow-400 border-yellow-500 text-black',
    missing: 'bg-slate-200 border-slate-300 text-slate-400 opacity-50',
    extraction: 'bg-slate-800 border-slate-900 text-white',
    healthy: 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
};

export const Tooth = ({ number, type, status, onClick }: ToothProps) => {
    const isChild = type === 'child';

    return (
        <button
            onClick={() => onClick(number)}
            className={cn(
                "flex items-center justify-center font-bold text-xs transition-all shadow-sm border",
                // Shape logic
                isChild ? "w-8 h-8 sm:w-10 sm:h-10 rounded-full" : "w-8 h-10 sm:w-10 sm:h-12 rounded-md",
                CONDITION_COLORS[status]
            )}
        >
            {number}
        </button>
    );
};
