import { useNavigate } from 'react-router-dom';
import { cn, formatCurrency } from '@/lib/utils';
import type { Patient } from '@/lib/types';
import { useTelegram } from '@/hooks/useTelegram';

interface PatientCardProps {
    patient: Patient;
}

export const PatientCard = ({ patient }: PatientCardProps) => {
    const navigate = useNavigate();
    const { tg } = useTelegram();

    const handleClick = () => {
        tg.HapticFeedback.selectionChanged();
        navigate(`/patients/${patient.id}`);
    };

    return (
        <div
            onClick={handleClick}
            className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 flex justify-between items-center cursor-pointer active:scale-[0.98] transition-transform hover:shadow-md"
        >
            <div>
                <h3 className="font-bold text-slate-900 text-lg">{patient.name}</h3>
                <p className="text-sm text-slate-500">{patient.phone}</p>
                <span className="text-xs text-slate-400 capitalize bg-slate-50 px-2 py-0.5 rounded mt-1 inline-block">
                    {patient.type === 'adult' ? 'Kattalar' : 'Bolalar'}
                </span>
            </div>

            <div className="text-right">
                {patient.balance !== 0 && (
                    <span className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm inline-flex items-center",
                        patient.balance < 0 ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"
                    )}>
                        {patient.balance < 0 ? 'Qarz: ' : 'Avans: '}
                        {formatCurrency(patient.balance)}
                    </span>
                )}
                {patient.balance === 0 && (
                    <span className="text-sm text-slate-400 font-medium bg-slate-50 px-3 py-1.5 rounded-lg">0 so'm</span>
                )}
            </div>
        </div>
    );
};
