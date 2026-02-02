import { Drawer } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { Calendar, ChevronRight } from 'lucide-react';

export type DateRangeOption = 'week' | 'month' | 'last_month' | 'year';

interface DateFilterDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedRange: DateRangeOption;
    onSelectRange: (range: DateRangeOption) => void;
}

const RANGES: { id: DateRangeOption; label: string }[] = [
    { id: 'week', label: 'Bu hafta' },
    { id: 'month', label: 'Bu oy' },
    { id: 'last_month', label: "O'tgan oy" },
    { id: 'year', label: 'Yil boshidan' },
];

export function DateFilterDrawer({ open, onOpenChange, selectedRange, onSelectRange }: DateFilterDrawerProps) {
    return (
        <Drawer
            open={open}
            onOpenChange={onOpenChange}
            title="Vaqt oralig'ini tanlang"
        >
            <div className="space-y-2 pb-6">
                {RANGES.map((range) => (
                    <button
                        key={range.id}
                        onClick={() => {
                            onSelectRange(range.id);
                            onOpenChange(false);
                        }}
                        className={cn(
                            "w-full flex items-center justify-between p-4 rounded-xl transition-colors border",
                            selectedRange === range.id
                                ? "bg-blue-50 border-blue-200 text-blue-700"
                                : "bg-white border-transparent hover:bg-slate-50 text-slate-700"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <Calendar className={cn("w-5 h-5", selectedRange === range.id ? "text-blue-600" : "text-slate-400")} />
                            <span className="font-medium">{range.label}</span>
                        </div>
                        {selectedRange === range.id && <ChevronRight className="w-5 h-5 text-blue-600" />}
                    </button>
                ))}
            </div>
        </Drawer>
    );
}
