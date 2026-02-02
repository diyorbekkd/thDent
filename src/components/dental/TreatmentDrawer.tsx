import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { DrawerDialog } from '@/components/ui/DrawerDialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Patient, ToothCondition, Service } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface TreatmentDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedTooth: number | null;
    patient: Patient;
    onSave: () => void;
}

const CONDITIONS_MAP: Record<ToothCondition, { label: string; color: string; activeColor: string }> = {
    caries: { label: 'Karies', color: 'bg-white border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-200', activeColor: 'bg-red-600 text-white border-red-600' },
    filling: { label: 'Plomba', color: 'bg-white border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200', activeColor: 'bg-blue-600 text-white border-blue-600' },
    implant: { label: 'Implant', color: 'bg-white border-slate-200 text-slate-600 hover:bg-purple-50 hover:border-purple-200', activeColor: 'bg-purple-600 text-white border-purple-600' },
    crown: { label: 'Qoplama', color: 'bg-white border-slate-200 text-slate-600 hover:bg-yellow-50 hover:border-yellow-200', activeColor: 'bg-yellow-500 text-white border-yellow-500' },
    missing: { label: "Yo'q", color: 'bg-white border-slate-200 text-slate-600 hover:bg-gray-50 hover:border-gray-200', activeColor: 'bg-gray-400 text-white border-gray-400' },
    extraction: { label: 'Olish', color: 'bg-white border-slate-200 text-slate-600 hover:bg-orange-50 hover:border-orange-200', activeColor: 'bg-orange-500 text-white border-orange-500' },
    healthy: { label: "Sog'lom", color: 'bg-white border-slate-200 text-slate-600', activeColor: 'bg-white border-slate-200 text-slate-600' }
};

export function TreatmentDrawer({ open, onOpenChange, selectedTooth, patient, onSave }: TreatmentDrawerProps) {
    const { user } = useAuth();
    const [condition, setCondition] = useState<ToothCondition>('caries');
    const [price, setPrice] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Services
    const [services, setServices] = useState<Service[]>([]);
    const [loadingServices, setLoadingServices] = useState(false);

    // Reset state when drawer opens
    useEffect(() => {
        if (open) {
            setCondition('caries');
            setPrice('');
            if (user) fetchServices();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, user]);

    const fetchServices = async () => {
        setLoadingServices(true);
        const { data } = await supabase.from('services').select('*').eq('doctor_id', user?.id).order('name', { ascending: true });
        if (data) {
            setServices(data as Service[]);
        }
        setLoadingServices(false);
    };

    const handleSave = async () => {
        if (!selectedTooth || !user || !patient) return;

        setLoading(true);
        try {
            // 1. Insert Treatment
            const { error: tError } = await supabase.from('treatments').insert({
                patient_id: patient.id,
                tooth_number: selectedTooth,
                condition: condition,
                price: price ? Number(price) : 0,
                doctor_id: user.id
            });

            if (tError) throw tError;

            // 2. Update Patient Balance (Decrease by price = Debt)
            if (price) {
                const newBalance = patient.balance - Number(price);
                const { error: pError } = await supabase.from('patients').update({ balance: newBalance }).eq('id', patient.id);
                if (pError) throw pError;
            }

            toast.success('Muolaja saqlandi');
            onSave();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error("Xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DrawerDialog
            open={open}
            onOpenChange={onOpenChange}
            title={`Tish №${selectedTooth} - Tashxis`}
            description="Tishga tashxis qo'ying va narx belgilang"
        >
            <div className="space-y-6 pb-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Holatni tanlang</label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                        {(Object.keys(CONDITIONS_MAP) as ToothCondition[]).filter(c => c !== 'healthy').map((c) => (
                            <button
                                key={c}
                                onClick={() => setCondition(c)}
                                className={cn(
                                    "py-2 px-3 rounded-lg text-sm font-medium border transition-colors capitalize",
                                    condition === c
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tezkor narxlar</label>
                    {loadingServices ? (
                        <div className="flex gap-2 items-center text-sm text-slate-400">
                            <Loader2 className="w-4 h-4 animate-spin" /> Yuklanmoqda...
                        </div>
                    ) : services.length > 0 ? (
                        <div className="flex gap-2 flex-wrap">
                            {services.map((service) => (
                                <button
                                    key={service.id}
                                    onClick={() => setPrice(service.price.toString())}
                                    className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-full text-xs font-medium border border-transparent hover:border-blue-200 transition-all"
                                >
                                    {service.name} ({Math.round(service.price / 1000)}k)
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic">Xizmatlar topilmadi. Sozlamalardan qo'shing.</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Narxi (so'm)</label>
                    <input
                        type="number"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 text-lg"
                        placeholder="0"
                    />
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50 flex justify-center items-center"
                >
                    {loading ? <Loader2 className="animate-spin" /> : "Saqlash"}
                </button>
            </div>
        </DrawerDialog>
    );
}
