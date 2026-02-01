import { useState, useEffect, useMemo } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { format, parseISO, startOfToday, addDays, isSameDay } from 'date-fns';
import { uz } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Appointment, Patient, AppointmentStatus } from '@/lib/types';
import { Loader2, Plus, Calendar as CalendarIcon, User, ChevronLeft, ChevronRight, Trash2, X, CheckCircle, AlertCircle, XCircle, Clock3 } from 'lucide-react';

export const Dashboard = () => {
    const { tg } = useTelegram();
    const { user } = useAuth();

    // State
    const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

    // Form State (shared for Add/Edit logic somewhat, but mainly Add)
    const [newAppointment, setNewAppointment] = useState({
        patientId: '',
        date: '',
        time: '',
        notes: '',
        status: 'scheduled' as AppointmentStatus
    });

    // Search State for Patient Select
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    // --- Data Fetching ---

    useEffect(() => {
        if (!user) return;
        const fetchPatients = async () => {
            const { data } = await supabase
                .from('patients')
                .select('*')
                .order('full_name', { ascending: true });
            if (data) setPatients(data as Patient[]);
        };
        fetchPatients();
    }, [user]);

    useEffect(() => {
        if (!user) return;

        const fetchAppointments = async () => {
            setLoading(true);
            const dateStr = format(selectedDate, 'yyyy-MM-dd');

            const { data, error } = await supabase
                .from('appointments')
                .select('*, patient:patients(*)')
                .eq('doctor_id', user.id)
                .gte('date', `${dateStr}T00:00:00`)
                .lt('date', `${dateStr}T23:59:59`)
                .order('date', { ascending: true });

            if (!error && data) {
                setAppointments(data as Appointment[]);
            }
            setLoading(false);
        };
        fetchAppointments();
    }, [selectedDate, user, refreshKey]);


    // --- Handlers ---

    const handleDateChange = (days: number) => {
        setSelectedDate(prev => addDays(prev, days));
    };

    const handleBackToToday = () => {
        setSelectedDate(startOfToday());
    };

    const refreshData = () => {
        setRefreshKey(prev => prev + 1);
    }

    const handleAddAppointment = async () => {
        if (!newAppointment.patientId || !newAppointment.date || !newAppointment.time || !user) {
            tg.showAlert("Iltimos, barcha maydonlarni to'ldiring");
            return;
        }

        const isoDateTime = `${newAppointment.date}T${newAppointment.time}:00`;

        const { error } = await supabase.from('appointments').insert({
            patient_id: newAppointment.patientId,
            doctor_id: user.id,
            date: isoDateTime,
            status: newAppointment.status,
            notes: newAppointment.notes
        });

        if (!error) {
            tg.HapticFeedback.notificationOccurred('success');
            setIsAddModalOpen(false);
            setNewAppointment({ patientId: '', date: '', time: '', notes: '', status: 'scheduled' as AppointmentStatus });
            refreshData();
        } else {
            console.error(error);
            tg.HapticFeedback.notificationOccurred('error');
            alert('Xatolik yuz berdi');
        }
    };

    const handleUpdateStatus = async (status: AppointmentStatus) => {
        if (!editingAppointment) return;

        const { error } = await supabase
            .from('appointments')
            .update({ status })
            .eq('id', editingAppointment.id);

        if (!error) {
            tg.HapticFeedback.notificationOccurred('success');
            setEditingAppointment(null);
            refreshData();
        }
    };

    const handleDeleteAppointment = async () => {
        if (!editingAppointment) return;
        if (!confirm("O'chirishni tasdiqlaysizmi?")) return;

        const { error } = await supabase
            .from('appointments')
            .delete()
            .eq('id', editingAppointment.id);

        if (!error) {
            tg.HapticFeedback.notificationOccurred('success');
            setEditingAppointment(null);
            refreshData();
        }
    };

    // --- Helpers ---

    const filteredPatients = useMemo(() => {
        if (!searchTerm) return patients;
        return patients.filter(p => p.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [patients, searchTerm]);

    const getStatusColor = (status: AppointmentStatus) => {
        switch (status) {
            case 'completed': return 'bg-green-50 text-green-700 border-green-200';
            case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'scheduled': return 'bg-yellow-50 text-yellow-700 border-yellow-200'; // Pending
            case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
            case 'no-show': return 'bg-gray-50 text-gray-700 border-gray-200';
            default: return 'bg-white border-slate-200';
        }
    };

    const getStatusText = (status: AppointmentStatus) => {
        switch (status) {
            case 'completed': return 'Tamomlandi';
            case 'confirmed': return 'Tasdiqlandi';
            case 'scheduled': return 'Kutyapti';
            case 'cancelled': return 'Bekor qilindi';
            case 'no-show': return 'Kelmadi';
            default: return status;
        }
    };


    // --- Render ---

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header / Date Strip */}
            <header className="bg-white p-4 shadow-sm z-10 space-y-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold text-slate-800">Jadval</h1>
                    <div className="text-sm text-slate-500 capitalize">{format(selectedDate, 'MMMM yyyy', { locale: uz })}</div>
                </div>

                <div className="flex items-center justify-between bg-slate-100 rounded-lg p-1">
                    <button onClick={() => handleDateChange(-1)} className="p-2 hover:bg-white rounded-md transition-colors text-slate-600">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="font-semibold text-slate-800 flex items-center gap-2" onClick={handleBackToToday}>
                        <CalendarIcon className="w-4 h-4 text-blue-600" />
                        {isSameDay(selectedDate, new Date()) ? "Bugun" : format(selectedDate, 'd MMMM', { locale: uz })}
                    </div>
                    <button onClick={() => handleDateChange(1)} className="p-2 hover:bg-white rounded-md transition-colors text-slate-600">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 pb-24">
                {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
                ) : appointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 space-y-4">
                        <CalendarIcon className="w-16 h-16 opacity-20" />
                        <p>Bugun qabullar yo'q</p>
                        <button onClick={() => setIsAddModalOpen(true)} className="text-blue-600 font-medium">Qabul qo'shish</button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {appointments.map(apt => (
                            <div
                                key={apt.id}
                                onClick={() => setEditingAppointment(apt)}
                                className={cn(
                                    "flex items-center p-4 rounded-xl border shadow-sm bg-white active:scale-[0.99] transition-transform",
                                    getStatusColor(apt.status)
                                )}
                            >
                                <div className="flex flex-col items-center mr-4 min-w-[3rem]">
                                    <span className="text-lg font-bold text-slate-800 leading-none">
                                        {format(parseISO(apt.date), 'HH:mm')}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 line-clamp-1">{apt.patient?.full_name || 'Noma\'lum'}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={cn("text-xs px-2 py-0.5 rounded-md font-medium capitalize", getStatusColor(apt.status))}>
                                            {getStatusText(apt.status)}
                                        </span>
                                        {apt.notes && <span className="text-xs text-slate-500 line-clamp-1 border-l pl-2">{apt.notes}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FAB */}
            <button
                onClick={() => {
                    setNewAppointment({
                        patientId: '',
                        date: format(selectedDate, 'yyyy-MM-dd'),
                        time: '09:00',
                        notes: '',
                        status: 'scheduled' as AppointmentStatus
                    });
                    setIsAddModalOpen(true);
                }}
                className="fixed bottom-24 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all z-20"
            >
                <Plus className="w-8 h-8" />
            </button>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-bold">Qabul qo'shish</h2>
                            <button onClick={() => setIsAddModalOpen(false)}><X className="w-6 h-6 text-slate-400" /></button>
                        </div>

                        {/* Patient Select */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Bemor</label>
                            {newAppointment.patientId ? (
                                <div className="flex justify-between items-center p-3 border rounded-xl bg-blue-50 border-blue-200">
                                    <span className="font-semibold text-blue-900">
                                        {patients.find(p => p.id === newAppointment.patientId)?.full_name}
                                    </span>
                                    <button onClick={() => setNewAppointment({ ...newAppointment, patientId: '' })}><X className="w-4 h-4 text-blue-500" /></button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Bemor ismini yozing..."
                                        className="w-full p-3 pl-10 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                    <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                    {searchTerm && (
                                        <div className="absolute top-full left-0 right-0 bg-white shadow-xl border rounded-xl mt-1 max-h-48 overflow-y-auto z-50">
                                            {filteredPatients.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => {
                                                        setNewAppointment({ ...newAppointment, patientId: p.id });
                                                        setSearchTerm('');
                                                    }}
                                                    className="w-full text-left p-3 hover:bg-slate-50 border-b last:border-0"
                                                >
                                                    <div className="font-medium">{p.full_name}</div>
                                                    <div className="text-xs text-slate-500">{p.phone}</div>
                                                </button>
                                            ))}
                                            {filteredPatients.length === 0 && <div className="p-3 text-center text-slate-400 text-sm">Topilmadi</div>}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Sana</label>
                                <input
                                    type="date"
                                    value={newAppointment.date}
                                    onChange={e => setNewAppointment({ ...newAppointment, date: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Vaqt</label>
                                <input
                                    type="time"
                                    value={newAppointment.time}
                                    onChange={e => setNewAppointment({ ...newAppointment, time: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Izoh</label>
                            <input
                                type="text"
                                placeholder="Plomba, ko'rik..."
                                value={newAppointment.notes}
                                onChange={e => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                            />
                        </div>

                        <button
                            onClick={handleAddAppointment}
                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl active:scale-95 transition-transform mt-2"
                        >
                            Saqlash
                        </button>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingAppointment && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold">{editingAppointment.patient?.full_name}</h2>
                                <p className="text-slate-500">{format(parseISO(editingAppointment.date), 'd MMMM, HH:mm', { locale: uz })}</p>
                            </div>
                            <button onClick={() => setEditingAppointment(null)}><X className="w-6 h-6 text-slate-400" /></button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Holatni o'zgartirish</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => handleUpdateStatus('scheduled')} className="p-2 rounded-lg border bg-yellow-50 border-yellow-200 text-yellow-700 flex items-center justify-center gap-2"><Clock3 className="w-4 h-4" /> Kutyapti</button>
                                <button onClick={() => handleUpdateStatus('confirmed')} className="p-2 rounded-lg border bg-blue-50 border-blue-200 text-blue-700 flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" /> Tasdiq</button>
                                <button onClick={() => handleUpdateStatus('completed')} className="p-2 rounded-lg border bg-green-50 border-green-200 text-green-700 flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" /> Tamom</button>
                                <button onClick={() => handleUpdateStatus('cancelled')} className="p-2 rounded-lg border bg-red-50 border-red-200 text-red-700 flex items-center justify-center gap-2"><XCircle className="w-4 h-4" /> Bekor</button>
                                <button onClick={() => handleUpdateStatus('no-show')} className="p-2 rounded-lg border bg-gray-50 border-gray-200 text-gray-700 col-span-2 flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4" /> Kelmadi</button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <button
                                onClick={handleDeleteAppointment}
                                className="w-full py-3 text-red-600 font-bold rounded-xl hover:bg-red-50 flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-5 h-5" />
                                O'chirish
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
