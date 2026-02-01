import type { Treatment, PatientType, ToothCondition } from '@/lib/types';
import { Tooth } from './Tooth';

interface DentalChartProps {
    type: PatientType;
    history: Treatment[];
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

export const DentalChart = ({ type, history, onToothClick }: DentalChartProps) => {
    const quadrants = type === 'adult' ? ADULT_TEETH : CHILD_TEETH;

    const getToothStatus = (num: number): ToothCondition => {
        // History is expected to be sorted by date desc
        const events = history.filter(h => h.tooth_number === num);
        if (events.length === 0) return 'healthy';
        return events[0].condition;
    };

    const renderQuadrant = (teeth: number[]) => (
        <div className="flex justify-center gap-1 sm:gap-2">
            {teeth.map(tooth => (
                <Tooth
                    key={tooth}
                    number={tooth}
                    type={type}
                    status={getToothStatus(tooth)}
                    onClick={onToothClick}
                />
            ))}
        </div>
    );

    return (
        <div className="space-y-6 p-4 bg-slate-50 rounded-xl border border-slate-200 overflow-x-auto min-h-[300px] flex flex-col justify-center">
            {/* Upper Jaw */}
            <div className="space-y-2">
                <div className="flex justify-center gap-4 sm:gap-8 border-b-2 border-slate-200 pb-6 border-dashed">
                    {renderQuadrant(quadrants[0])}
                    {renderQuadrant(quadrants[1])}
                </div>
            </div>

            {/* Lower Jaw */}
            <div className="space-y-2 pt-2">
                <div className="flex justify-center gap-4 sm:gap-8">
                    {renderQuadrant(quadrants[2])}
                    {renderQuadrant(quadrants[3])}
                </div>
            </div>
        </div>
    );
};
