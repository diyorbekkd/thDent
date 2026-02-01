import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/hooks/useStore';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { ToothChart } from '@/components/ToothChart';
import { ArrowLeft, Phone, Wallet, X } from 'lucide-react';
import type { ToothCondition, PatientType } from '@/lib/types';
import { format } from 'date-fns';

export const PatientDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { patients, getPatientHistory, getPatientAppointments, addToothTreatment, addTransaction } = useStore();

    const patient = patients.find(p => p.id === id);
    const history = patient ? getPatientHistory(patient.id) : [];

    const [activeTab, setActiveTab] = useState<'info' | 'formula' | 'history'>('info');
    const [chartType, setChartType] = useState<PatientType>(patient?.type || 'adult');

    // Modal State
    const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
    const [treatmentCondition, setTreatmentCondition] = useState<ToothCondition>('caries');
    const [treatmentPrice, setTreatmentPrice] = useState<string>('');

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState<string>('');

    if (!patient) return <div className="p-4">Bemor topilmadi</div>;

    const handleSaveTreatment = () => {
        if (selectedTooth && treatmentPrice) {
            addToothTreatment({
                patientId: patient.id,
                toothNumber: selectedTooth,
                condition: treatmentCondition,
                price: Number(treatmentPrice),
            });
            setSelectedTooth(null);
            setTreatmentPrice('');
        }
    };

    const handleSavePayment = () => {
        if (paymentAmount) {
            addTransaction({
                patientId: patient.id,
                amount: Number(paymentAmount),
                type: 'income',
                category: 'payment',
                description: 'Bemor to\'lovi'
            });
            setIsPaymentModalOpen(false);
            setPaymentAmount('');
        }
    };

    // ... rest of the component is same, but I can't leave placeholders in Overwrite tool.
    // I must include the whole content.
    // I'll copy pasting the return block.

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white p-4 items-center flex gap-4 shadow-sm z-10">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900">{patient.name}</h1>
                    <p className="text-sm text-slate-500">{patient.phone}</p>
                </div>
                <div className={cn(
                    "px-3 py-1 rounded-lg text-sm font-bold",
                    patient.balance < 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                )}>
                    {formatCurrency(patient.balance)}
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-white border-b border-slate-200 flex">
                <button
                    onClick={() => setActiveTab('info')}
                    className={cn("flex-1 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'info' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500")}
                >
                    Info
                </button>
                <button
                    onClick={() => setActiveTab('formula')}
                    className={cn("flex-1 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'formula' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500")}
                >
                    Formula
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={cn("flex-1 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'history' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500")}
                >
                    Tarix
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-24">
                {activeTab === 'info' && (
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <span className="text-slate-500">Telefon</span>
                                <a href={`tel:${patient.phone}`} className="font-semibold text-blue-600 flex items-center">
                                    <Phone className="w-4 h-4 mr-1" /> {patient.phone}
                                </a>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <span className="text-slate-500">Turi</span>
                                <span className="font-medium capitalize">{patient.type === 'adult' ? 'Kattalar' : 'Bolalar'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Balanas</span>
                                <span className={cn("font-bold", patient.balance < 0 ? "text-red-600" : "text-green-600")}>
                                    {formatCurrency(patient.balance)}
                                </span>
                            </div>
                        </div>

                        <h3 className="font-bold text-slate-800 mt-6 mb-2">Kelgusi qabullar</h3>
                        {getPatientAppointments(patient.id).filter(a => new Date(a.date) > new Date()).length === 0 ? (
                            <p className="text-slate-400 text-sm">Kelgusi qabullar yo'q</p>
                        ) : (
                            getPatientAppointments(patient.id).filter(a => new Date(a.date) > new Date()).map(a => (
                                <div key={a.id} className="bg-white p-3 rounded-lg border border-slate-200">
                                    <p className="font-bold">{format(new Date(a.date), 'dd MMMM, HH:mm')}</p>
                                    <p className="text-sm text-slate-500">{a.status}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'formula' && (
                    <div className="space-y-4">
                        <div className="flex justify-center bg-slate-100 p-1 rounded-lg mx-auto w-fit">
                            <button
                                onClick={() => setChartType('adult')}
                                className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", chartType === 'adult' ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700")}
                            >
                                Kattalar (32)
                            </button>
                            <button
                                onClick={() => setChartType('child')}
                                className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", chartType === 'child' ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700")}
                            >
                                Bolalar (20)
                            </button>
                        </div>

                        <ToothChart
                            type={chartType}
                            history={history}
                            onToothClick={(num) => setSelectedTooth(num)}
                        />

                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-4">
                            <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded mr-2"></div>Karies</div>
                            <div className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>Plomba</div>
                            <div className="flex items-center"><div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>Implant</div>
                            <div className="flex items-center"><div className="w-3 h-3 bg-yellow-400 rounded mr-2"></div>Qoplama</div>
                            <div className="flex items-center"><div className="w-3 h-3 bg-slate-300 rounded mr-2"></div>Yo'q</div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-4">
                        <button
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="w-full py-3 bg-green-600 text-white font-bold rounded-xl shadow-md hover:bg-green-700 flex items-center justify-center gap-2"
                        >
                            <Wallet className="w-5 h-5" />
                            To'lov qabul qilish
                        </button>

                        <h3 className="font-bold text-slate-800 mt-4">Davolash tarixi</h3>
                        <div className="space-y-3">
                            {history.map(h => (
                                <div key={h.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900">Tish #{h.toothNumber}</span>
                                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 capitalize">{h.condition}</span>
                                        </div>
                                        <p className="text-xs text-slate-400">{formatDate(h.date)}</p>
                                    </div>
                                    <span className="font-bold text-red-600">-{formatCurrency(h.price)}</span>
                                </div>
                            ))}
                            {history.length === 0 && <p className="text-center text-slate-400 text-sm">Tarix bo'sh</p>}
                        </div>
                    </div>
                )}
            </div>

            {/* Treatment Modal */}
            {selectedTooth && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 space-y-4 animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-bold">Tish #{selectedTooth} - Muolaja</h2>
                            <button onClick={() => setSelectedTooth(null)}><X className="w-6 h-6 text-slate-400" /></button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Holatni tanlang</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['caries', 'filling', 'implant', 'crown', 'missing', 'extraction'].map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setTreatmentCondition(c as ToothCondition)}
                                        className={cn(
                                            "py-2 px-3 rounded-lg text-sm font-medium border transition-colors capitalize",
                                            treatmentCondition === c ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                        )}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Narx (so'm)</label>
                            <input
                                type="number"
                                value={treatmentPrice}
                                onChange={e => setTreatmentPrice(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 text-lg"
                                placeholder="Masalan: 200000"
                                autoFocus
                            />
                        </div>

                        <button
                            onClick={handleSaveTreatment}
                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 mt-2"
                        >
                            Saqlash
                        </button>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-4">
                        <h2 className="text-xl font-bold mb-4">To'lov qabul qilish</h2>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Summa (so'm)</label>
                            <input
                                type="number"
                                value={paymentAmount}
                                onChange={e => setPaymentAmount(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-600 text-lg"
                                placeholder="Masalan: 500000"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-3 text-slate-600 font-medium">Bekor qilish</button>
                            <button onClick={handleSavePayment} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl shadow hover:bg-green-700">Tasdiqlash</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
