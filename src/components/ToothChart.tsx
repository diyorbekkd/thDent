import { cn } from '@/lib/utils';
import type { ToothCondition, ToothHistory, PatientType } from '@/lib/types';

interface ToothChartProps {
    type: PatientType;
    history: ToothHistory[];
    onToothClick: (toothNumber: number) => void;
}

const ADULT_TEETH = [
    // Upper Right (18-11)
    [18, 17, 16, 15, 14, 13, 12, 11],
    // Upper Left (21-28)
    [21, 22, 23, 24, 25, 26, 27, 28],
    // Lower Right (48-41)
    [48, 47, 46, 45, 44, 43, 42, 41],
    // Lower Left (31-38)
    [31, 32, 33, 34, 35, 36, 37, 38]
];

const CHILD_TEETH = [
    // Upper Right (55-51)
    [55, 54, 53, 52, 51],
    // Upper Left (61-65)
    [61, 62, 63, 64, 65],
    // Lower Right (85-81)
    [85, 84, 83, 82, 81],
    // Lower Left (71-75)
    [71, 72, 73, 74, 75]
];

const CONDITION_COLORS: Record<ToothCondition, string> = {
    caries: 'bg-red-500 hover:bg-red-600 text-white',
    filling: 'bg-blue-500 hover:bg-blue-600 text-white',
    implant: 'bg-purple-500 hover:bg-purple-600 text-white',
    crown: 'bg-yellow-400 hover:bg-yellow-500 text-black',
    missing: 'bg-slate-300 hover:bg-slate-400 text-slate-500 opacity-50',
    extraction: 'bg-slate-800 hover:bg-slate-900 text-white',
    healthy: 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
};

export const ToothChart: React.FC<ToothChartProps> = ({ type, history, onToothClick }) => {
    const quadrants = type === 'adult' ? ADULT_TEETH : CHILD_TEETH;

    const getToothStatus = (num: number): ToothCondition => {
        // Find the *latest* entry for this tooth
        const events = history.filter(h => h.toothNumber === num);
        if (events.length === 0) return 'healthy';
        // Sort by date desc (assuming history is already sorted or we sort here)
        // But history in store is sorted.
        return events[0].condition;
    };

    const renderQuadrant = (teeth: number[]) => (
        <div className="flex justify-center gap-1 sm:gap-2">
            {teeth.map(tooth => {
                const status = getToothStatus(tooth);
                return (
                    <button
                        key={tooth}
                        onClick={() => onToothClick(tooth)}
                        className={cn(
                            "w-8 h-10 sm:w-10 sm:h-12 rounded-md border shadow-sm flex items-center justify-center text-xs font-bold transition-all",
                            CONDITION_COLORS[status],
                            status === 'healthy' ? "border-slate-200" : "border-transparent"
                        )}
                    >
                        {tooth}
                    </button>
                );
            })}
        </div>
    );

    return (
        <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200 overflow-x-auto">
            {/* Upper Jaw */}
            <div className="space-y-2">
                <div className="flex justify-center gap-4 border-b border-slate-200 pb-4">
                    {renderQuadrant(quadrants[0])}
                    {renderQuadrant(quadrants[1])}
                </div>
            </div>

            {/* Lower Jaw */}
            <div className="space-y-2 pt-2">
                <div className="flex justify-center gap-4">
                    {renderQuadrant(quadrants[2])}
                    {renderQuadrant(quadrants[3])}
                </div>
            </div>
        </div>
    );
};
