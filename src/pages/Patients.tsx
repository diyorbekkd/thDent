import { useState } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { Search, Plus } from 'lucide-react';
import { PatientCard } from '@/components/patients/PatientCard';

export const Patients = () => {
    const { patients } = useAppContext();
    const [query, setQuery] = useState('');

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.phone.includes(query)
    );

    return (
        <div className="p-4 space-y-4">
            <header className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-slate-800">Bemorlar</h1>
                <button
                    className="bg-blue-600 text-white p-2 rounded-full shadow hover:bg-blue-700 active:scale-95 transition-all"
                    title="Yangi bemor"
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
                {filteredPatients.map(patient => (
                    <PatientCard key={patient.id} patient={patient} />
                ))}
                {filteredPatients.length === 0 && (
                    <div className="text-center text-slate-400 py-10">
                        Bemorlar topilmadi
                    </div>
                )}
            </div>
        </div>
    );
};
