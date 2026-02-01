import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { useTelegram } from '@/hooks/useTelegram';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { DentalChart } from '@/components/dental/DentalChart';
import { ArrowLeft, Phone, Wallet, X, Loader2 } from 'lucide-react';
import type { Patient, Treatment, PatientType, ToothCondition } from '@/lib/types';

export const PatientProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { tg } = useTelegram();

    const [patient, setPatient] = useState<Patient | null>(null);
    const [history, setHistory] = useState<Treatment[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<'info' | 'formula' | 'history'>('info');
    const [chartType, setChartType] = useState<PatientType>('adult'); // Default, will update on load

    const CONDITIONS_MAP: Record<ToothCondition, { label: string; color: string; activeColor: string }> = {
        caries: { label: 'Karies', color: 'bg-white border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-200', activeColor: 'bg-red-600 text-white border-red-600' },
        filling: { label: 'Plomba', color: 'bg-white border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200', activeColor: 'bg-blue-600 text-white border-blue-600' },
        implant: { label: 'Implant', color: 'bg-white border-slate-200 text-slate-600 hover:bg-purple-50 hover:border-purple-200', activeColor: 'bg-purple-600 text-white border-purple-600' },
        crown: { label: 'Qoplama', color: 'bg-white border-slate-200 text-slate-600 hover:bg-yellow-50 hover:border-yellow-200', activeColor: 'bg-yellow-500 text-white border-yellow-500' },
        missing: { label: "Yo'q", color: 'bg-white border-slate-200 text-slate-600 hover:bg-gray-50 hover:border-gray-200', activeColor: 'bg-gray-400 text-white border-gray-400' },
        extraction: { label: 'Olish', color: 'bg-white border-slate-200 text-slate-600 hover:bg-orange-50 hover:border-orange-200', activeColor: 'bg-orange-500 text-white border-orange-500' },
        healthy: { label: "Sog'lom", color: 'bg-white border-slate-200 text-slate-600', activeColor: 'bg-white border-slate-200 text-slate-600' }
    };

    // Modal State
    const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
    const [treatmentCondition, setTreatmentCondition] = useState<ToothCondition>('caries');
    const [treatmentPrice, setTreatmentPrice] = useState<string>('');

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState<string>('');

    useEffect(() => {
        if (id) {
            const fetch = async () => {
                // Fetch Patient
                const { data: pData } = await supabase.from('patients').select('*').eq('id', id).single();
                if (pData) {
                    setPatient(pData as Patient);
                    setChartType(pData.type);
                }

                // Fetch History
                const { data: hData } = await supabase.from('treatments').select('*').eq('patient_id', id).order('created_at', { ascending: false });
                if (hData) {
                    setHistory(hData as Treatment[]);
                }
                setLoading(false);
            };
            fetch();
        }
    }, [id]);

    const handleSaveTreatment = useCallback(async () => {
        if (selectedTooth && treatmentPrice && user && patient) {
            // 1. Insert Treatment
            const { error: tError } = await supabase.from('treatments').insert({
                patient_id: patient.id,
                tooth_number: selectedTooth,
                condition: treatmentCondition,
                price: Number(treatmentPrice),
                doctor_id: user.id
            });

            if (tError) {
                tg.HapticFeedback.notificationOccurred('error');
                alert('Xatolik');
                return;
            }

            // 2. Update Patient Balance (Decrease by price = Debt)
            const newBalance = patient.balance - Number(treatmentPrice);
            const { error: pError } = await supabase.from('patients').update({ balance: newBalance }).eq('id', patient.id);

            if (!pError) {
                setPatient(prev => prev ? ({ ...prev, balance: newBalance }) : null);
                // Refetch history to update chart colors
                const { data: hData } = await supabase.from('treatments').select('*').eq('patient_id', patient.id).order('created_at', { ascending: false });
                if (hData) setHistory(hData as Treatment[]);

                tg.HapticFeedback.notificationOccurred('success');
                tg.showAlert(`Muolaja saqlandi!\nBemor qarzi: ${formatCurrency(newBalance)}`);

                setSelectedTooth(null);
                setTreatmentPrice('');
            }
        }
    }, [selectedTooth, treatmentPrice, treatmentCondition, user, patient, tg]);

    useEffect(() => {
        if (isPaymentModalOpen) {
            // Keep MainButton for Payment for now, or removed if desired? User only mentioned DentalChart Modal.
            // Let's assume we keep it for Payment as user didn't request changes there.
            // But wait, the hook at line 125 also handles Payment. 
            // Actually, lines 92-103 handled Treatment, lines 125-136 handle Payment.
            // Ops, I see 'isPaymentModalOpen' check in lines 92-103 as 'else if'.
            // And lines 125-136 seem to DUPLICATE payment logic?
            // Let's look at the file content again.
        }
        // Removing the selectedTooth block logic
        if (!selectedTooth && !isPaymentModalOpen) {
            tg.MainButton.hide();
        }
    }, [selectedTooth, isPaymentModalOpen, tg]);

    // Payment Logic (Simplified for now - just update balance)
    const handleSavePayment = useCallback(async () => {
        if (paymentAmount && patient) {
            const newBalance = patient.balance + Number(paymentAmount);

            const { error } = await supabase.from('patients').update({ balance: newBalance }).eq('id', patient.id);

            if (!error) {
                setPatient(prev => prev ? ({ ...prev, balance: newBalance }) : null);

                // Insert Transaction Logic
                await supabase.from('transactions').insert({
                    amount: Number(paymentAmount),
                    type: 'income',
                    category: 'treatment',
                    description: `To'lov: ${patient.full_name}`,
                    doctor_id: (await supabase.auth.getUser()).data.user?.id,
                    patient_id: patient.id
                });

                tg.HapticFeedback.notificationOccurred('success');
                alert("To'lov muvaffaqiyatli qabul qilindi!");

                setIsPaymentModalOpen(false);
                setPaymentAmount('');
            } else {
                tg.HapticFeedback.notificationOccurred('error');
            }
        }
    }, [paymentAmount, patient, tg, setPaymentAmount, setIsPaymentModalOpen]);

    useEffect(() => {
        // Cleaning up Telegram Button logic entirely for Payment Modal as we are moving to UI buttons
        if (isPaymentModalOpen) {
            tg.MainButton.hide();
        }
    }, [isPaymentModalOpen, tg]);


    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (!patient) return <div className="p-4">Bemor topilmadi</div>;

    const handleToothClick = (num: number) => {
        tg.HapticFeedback.impactOccurred('medium');
        setSelectedTooth(num);
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white p-4 items-center flex gap-4 shadow-sm z-10 safe-area-top">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900">{patient.full_name}</h1>
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

                        <DentalChart
                            type={chartType}
                            history={history}
                            onToothClick={handleToothClick}
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
                                            <span className="font-bold text-slate-900">Tish #{h.tooth_number}</span>
                                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 capitalize">{h.condition}</span>
                                        </div>
                                        <p className="text-xs text-slate-400">{formatDate(h.created_at)}</p>
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
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 space-y-4 animate-in slide-in-from-bottom duration-300 pb-10 sm:pb-6">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-bold">Tish №{selectedTooth} - Tashxis</h2>
                            <button onClick={() => setSelectedTooth(null)}><X className="w-6 h-6 text-slate-400" /></button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Holatni tanlang</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(Object.keys(CONDITIONS_MAP) as ToothCondition[]).filter(c => c !== 'healthy').map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setTreatmentCondition(c)}
                                        className={cn(
                                            "py-2 px-3 rounded-lg text-sm font-medium border transition-colors capitalize",
                                            treatmentCondition === c
                                                ? CONDITIONS_MAP[c].activeColor
                                                : CONDITIONS_MAP[c].color
                                        )}
                                    >
                                        {CONDITIONS_MAP[c].label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Narxi (so'm)</label>
                            <input
                                type="number"
                                value={treatmentPrice}
                                onChange={e => setTreatmentPrice(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 text-lg"
                                placeholder="0"
                                autoFocus
                            />
                        </div>

                        <button
                            onClick={handleSaveTreatment}
                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl active:scale-95 transition-transform"
                        >
                            Saqlash
                        </button>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold mb-4">To'lov qabul qilish</h2>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Summa (so'm)</label>
                            <input
                                type="number"
                                value={paymentAmount}
                                onChange={e => setPaymentAmount(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-600 text-lg"
                                placeholder="0"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl active:scale-95 transition-transform"
                            >
                                Bekor qilish
                            </button>
                            <button
                                onClick={handleSavePayment}
                                className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl active:scale-95 transition-transform"
                            >
                                To'lovni Saqlash
                            </button>
                        </div>
                        <div className="h-2"></div>
                    </div>
                </div>
            )}
        </div>
    );
};
