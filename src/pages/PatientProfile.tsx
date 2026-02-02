import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useTelegram } from '@/hooks/useTelegram';
import { cn } from '@/lib/utils';
import { DentalChart } from '@/components/dental/DentalChart';
import { ProfileHeader } from '@/components/patient-profile/ProfileHeader';
import { InfoTab } from '@/components/patient-profile/InfoTab';
import { HistoryTab } from '@/components/patient-profile/HistoryTab';
import { TreatmentDrawer } from '@/components/dental/TreatmentDrawer';
import { PaymentDrawer } from '@/components/finance/PaymentDrawer';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { Patient, Treatment, PatientType } from '@/lib/types';

export const PatientProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { tg } = useTelegram();

    const [patient, setPatient] = useState<Patient | null>(null);
    const [history, setHistory] = useState<Treatment[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<'info' | 'formula' | 'history'>('info');
    const [chartType, setChartType] = useState<PatientType>('adult');

    // Drawer State
    const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    const fetchData = useCallback(async () => {
        if (!id) return;

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
    }, [id]);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    // Haptic feedback when drawer opens
    useEffect(() => {
        if (selectedTooth || isPaymentOpen) {
            tg.HapticFeedback.impactOccurred('medium');
        }
    }, [selectedTooth, isPaymentOpen, tg]);

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (!patient) return <div className="p-4">Bemor topilmadi</div>;

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Top Navigation Bar Component? Or just inline */}
            <div className="bg-white p-4 flex items-center gap-2 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-xl font-bold text-slate-900">Bemor Profili</div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
                {/* Header Card */}
                <ProfileHeader
                    patient={patient}
                    onAddPayment={() => setIsPaymentOpen(true)}
                />

                {/* Tabs */}
                <div className="bg-white rounded-2xl p-1 flex border border-slate-100 shadow-sm">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={cn("flex-1 py-2 text-sm font-bold rounded-xl transition-all", activeTab === 'info' ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600")}
                    >
                        Info
                    </button>
                    <button
                        onClick={() => setActiveTab('formula')}
                        className={cn("flex-1 py-2 text-sm font-bold rounded-xl transition-all", activeTab === 'formula' ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600")}
                    >
                        Formula
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={cn("flex-1 py-2 text-sm font-bold rounded-xl transition-all", activeTab === 'history' ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600")}
                    >
                        Tarix
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'info' && <InfoTab patient={patient} />}

                {activeTab === 'formula' && (
                    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-4">
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
                            onToothClick={setSelectedTooth}
                        />

                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-4 border-t pt-4">
                            <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded mr-2"></div>Karies</div>
                            <div className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>Plomba</div>
                            <div className="flex items-center"><div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>Implant</div>
                            <div className="flex items-center"><div className="w-3 h-3 bg-yellow-400 rounded mr-2"></div>Qoplama</div>
                            <div className="flex items-center"><div className="w-3 h-3 bg-slate-300 rounded mr-2"></div>Yo'q</div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && <HistoryTab treatments={history} />}
            </div>

            {/* Drawers */}
            <TreatmentDrawer
                open={!!selectedTooth}
                onOpenChange={(open) => !open && setSelectedTooth(null)}
                selectedTooth={selectedTooth}
                patient={patient}
                onSave={fetchData}
            />

            <PaymentDrawer
                open={isPaymentOpen}
                onOpenChange={setIsPaymentOpen}
                patient={patient}
                onSave={fetchData}
            />
        </div>
    );
};
