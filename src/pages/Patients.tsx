import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { Search, Plus, X, Loader2 } from 'lucide-react';
import { PatientCard } from '@/components/patients/PatientCard';
import type { Patient, PatientType, Gender } from '@/lib/types';
import { useTelegram } from '@/hooks/useTelegram';

export const Patients = () => {
    const { user } = useAuth();
    const { tg } = useTelegram();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPatientName, setNewPatientName] = useState('');
    const [newPatientPhone, setNewPatientPhone] = useState('+998');
    const [newPatientType, setNewPatientType] = useState<PatientType>('adult');
    const [newPatientGender, setNewPatientGender] = useState<Gender>('male');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (!user) return;
        const fetch = async () => {
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setPatients(data as Patient[]);
            }
            setLoading(false);
        };
        fetch();
    }, [user]);

    const handleCreatePatient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setCreating(true);

        const { data, error } = await supabase.from('patients').insert({
            full_name: newPatientName,
            phone: newPatientPhone,
            type: newPatientType,
            gender: newPatientGender,
            doctor_id: user.id,
            balance: 0
        }).select().single();

        if (!error && data) {
            setPatients(prev => [data as Patient, ...prev]);
            setIsModalOpen(false);
            setNewPatientName('');
            setNewPatientPhone('+998');
            tg.HapticFeedback.notificationOccurred('success');
        } else {
            tg.HapticFeedback.notificationOccurred('error');
            alert('Xatolik yuz berdi');
        }
        setCreating(false);
    };

    const filteredPatients = patients.filter(p =>
        p.full_name.toLowerCase().includes(query.toLowerCase()) ||
        p.phone.includes(query)
    );

    return (
        <div className="p-4 space-y-4">
            <header className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-slate-800">Bemorlar</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white p-2 rounded-full shadow hover:bg-blue-700 active:scale-95 transition-all"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </header>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Ism yoki telefon..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
            </div>

            <div className="space-y-3 pb-20">
                {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
                ) : filteredPatients.length === 0 ? (
                    <div className="text-center text-slate-400 py-10">
                        Bemorlar topilmadi
                    </div>
                ) : (
                    filteredPatients.map(patient => (
                        <PatientCard key={patient.id} patient={patient} />
                    ))
                )}
            </div>

            {/* Add Patient Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-xl">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-bold">Yangi Bemor</h2>
                            <button onClick={() => setIsModalOpen(false)}><X className="text-slate-400" /></button>
                        </div>

                        <form onSubmit={handleCreatePatient} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">F.I.SH</label>
                                <input
                                    required
                                    className="w-full p-3 rounded-xl border mt-1"
                                    placeholder="Ism Familiya"
                                    value={newPatientName}
                                    onChange={e => setNewPatientName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Telefon</label>
                                <input
                                    required
                                    className="w-full p-3 rounded-xl border mt-1"
                                    value={newPatientPhone}
                                    onChange={e => setNewPatientPhone(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-slate-700">Turi</label>
                                    <select
                                        className="w-full p-3 rounded-xl border mt-1 bg-white"
                                        value={newPatientType}
                                        onChange={e => setNewPatientType(e.target.value as PatientType)}
                                    >
                                        <option value="adult">Kattalar</option>
                                        <option value="child">Bolalar</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-slate-700">Jinsi</label>
                                    <select
                                        className="w-full p-3 rounded-xl border mt-1 bg-white"
                                        value={newPatientGender}
                                        onChange={e => setNewPatientGender(e.target.value as Gender)}
                                    >
                                        <option value="male">Erkak</option>
                                        <option value="female">Ayol</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                disabled={creating}
                                type="submit"
                                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl mt-2 flex justify-center"
                            >
                                {creating ? <Loader2 className="animate-spin" /> : "Saqlash"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
