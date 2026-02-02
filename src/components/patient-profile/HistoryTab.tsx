import { format } from 'date-fns';
import { uz } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';
import type { Treatment } from '@/lib/types';
import { Tooth } from '@/components/dental/Tooth';

interface HistoryTabProps {
    treatments: Treatment[];
}

export const HistoryTab = ({ treatments }: HistoryTabProps) => {
    if (treatments.length === 0) {
        return <div className="text-center text-slate-400 py-10 bg-white rounded-3xl border border-slate-100">Tarix bo'sh</div>;
    }

    return (
        <div className="space-y-4">
            {treatments.map((t) => (
                <div key={t.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <div className="w-8 h-8 flex items-center justify-center">
                            {/* Passing dummy onClick and default type since it's just visual here */}
                            <Tooth number={t.tooth_number} type="adult" status={t.condition} onClick={() => { }} />
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-slate-900">{t.tooth_number ? `${t.tooth_number}-tish` : 'Umumiy'}</h4>
                                <p className="text-sm text-slate-600 capitalize">{t.condition}</p>
                            </div>
                            <span className="font-bold text-blue-600">{formatCurrency(t.price)}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2 border-t pt-2 border-slate-50">
                            <span className="text-xs text-slate-400">{format(new Date(t.created_at), 'd MMMM, HH:mm', { locale: uz })}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
