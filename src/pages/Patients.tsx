import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

export const Patients = () => {
    const { patients } = useStore();
    const navigate = useNavigate();
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
                    className="bg-primary text-white p-2 rounded-full shadow hover:bg-blue-700"
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
                    <div
                        key={patient.id}
                        onClick={() => navigate(`/patients/${patient.id}`)}
                        className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 flex justify-between items-center cursor-pointer active:scale-[0.98] transition-transform"
                    >
                        <div>
                            <h3 className="font-bold text-slate-900">{patient.name}</h3>
                            <p className="text-sm text-slate-500">{patient.phone}</p>
                        </div>

                        <div className="text-right">
                            {patient.balance !== 0 && (
                                <span className={cn(
                                    "px-2 py-1 rounded text-xs font-bold",
                                    patient.balance < 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                                )}>
                                    {patient.balance < 0 ? 'Qarz: ' : 'Avans: '}
                                    {formatCurrency(patient.balance)}
                                </span>
                            )}
                            {patient.balance === 0 && (
                                <span className="text-xs text-slate-400 font-medium">0 so'm</span>
                            )}
                        </div>
                    </div>
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
