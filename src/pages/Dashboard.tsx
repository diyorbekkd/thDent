import { useStore } from '@/hooks/useStore';
import { format, isSameDay, parseISO, startOfToday } from 'date-fns';
import { uz } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/lib/types';

export const Dashboard = () => {
    const { appointments, patients } = useStore();
    const navigate = useNavigate();
    const today = startOfToday();
    const todayTimestamp = today.getTime();

    // Removed useMemo to avoid linter conflicts with React 19 rules regarding manual memoization
    const filteredAppointments = appointments
        .filter(a => isSameDay(parseISO(a.date), todayTimestamp))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const getStatusColor = (status: Appointment['status']) => {
        switch (status) {
            case 'completed': return 'border-l-4 border-green-500 bg-green-50';
            case 'confirmed': return 'border-l-4 border-blue-500 bg-white';
            case 'scheduled': return 'border-l-4 border-yellow-500 bg-yellow-50';
            case 'cancelled': return 'border-l-4 border-red-500 bg-red-50';
            case 'no-show': return 'border-l-4 border-red-700 bg-red-100';
            default: return 'border-l-4 border-gray-300 bg-white';
        }
    };

    const getStatusText = (status: Appointment['status']) => {
        switch (status) {
            case 'completed': return 'Yakunlandi';
            case 'confirmed': return 'Tasdiqlandi';
            case 'scheduled': return 'Rejalashtirilgan';
            case 'cancelled': return 'Bekor qilindi';
            case 'no-show': return 'Kelmadi';
            default: return status;
        }
    }

    return (
        <div className="p-4 space-y-4">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 capitalize">
                    {format(today, 'd-MMMM, yyyy', { locale: uz })}
                </h1>
                <p className="text-slate-500">
                    Bugungi qabullar: <span className="font-semibold text-slate-900">{filteredAppointments.length}</span>
                </p>
            </header>

            <div className="space-y-3">
                {filteredAppointments.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        Bugun qabullar yo'q
                    </div>
                ) : (
                    filteredAppointments.map(ppt => {
                        const patient = patients.find(p => p.id === ppt.patientId);
                        return (
                            <div
                                key={ppt.id}
                                onClick={() => navigate(`/patients/${ppt.patientId}`)}
                                className={cn(
                                    "p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-slate-100",
                                    getStatusColor(ppt.status)
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-sm font-semibold text-slate-500 mb-1">
                                            {format(parseISO(ppt.date), 'HH:mm')}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 leading-tight">
                                            {patient?.name || 'Noma\'lum bemor'}
                                        </h3>
                                        <p className="text-sm text-slate-600 mt-1">{ppt.type}</p>
                                    </div>
                                    <span className={cn(
                                        "px-2 py-1 rounded text-xs font-medium",
                                        ppt.status === 'completed' ? "text-green-700 bg-green-100" :
                                            ppt.status === 'cancelled' ? "text-red-700 bg-red-100" :
                                                ppt.status === 'scheduled' ? "text-yellow-700 bg-yellow-100" :
                                                    "text-blue-700 bg-blue-100"
                                    )}>
                                        {getStatusText(ppt.status)}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
