import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { DrawerDialog } from '@/components/ui/DrawerDialog';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { Patient } from '@/lib/types';

interface PaymentDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patient: Patient;
    onSave: () => void;
}

export function PaymentDrawer({ open, onOpenChange, patient, onSave }: PaymentDrawerProps) {
    const { user } = useAuth();
    const [amount, setAmount] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!amount || !user || !patient) return;

        setLoading(true);
        try {
            // 1. Update Patient Balance (Increase = Paying debt)
            const newBalance = patient.balance + Number(amount);
            const { error: pError } = await supabase.from('patients').update({ balance: newBalance }).eq('id', patient.id);
            if (pError) throw pError;

            // 2. Insert Transaction (Income)
            const { error: tError } = await supabase.from('transactions').insert({
                amount: Number(amount),
                type: 'income',
                category: 'treatment',
                description: `To'lov: ${patient.full_name}`,
                doctor_id: user.id,
                patient_id: patient.id
            });
            if (tError) throw tError;

            toast.success("To'lov qabul qilindi");
            onSave();
            onOpenChange(false);
            setAmount('');
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
            title="To'lov qabul qilish"
        >
            <div className="space-y-6 pb-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Summa (so'm)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-600 text-lg"
                        placeholder="0"
                        autoFocus
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl active:scale-95 transition-transform"
                    >
                        Bekor qilish
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50 flex justify-center items-center"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Saqlash"}
                    </button>
                </div>
            </div>
        </DrawerDialog>
    );
}
