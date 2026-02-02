import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Drawer } from '@/components/ui/drawer';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AddServiceDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: () => void;
}

export function AddServiceDrawer({ open, onOpenChange, onSave }: AddServiceDrawerProps) {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name || !price || !user) {
            toast.error("Barcha maydonlarni to'ldiring");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.from('services').insert({
                name,
                price: Number(price),
                doctor_id: user.id
            });

            if (error) throw error;

            toast.success("Xizmat qo'shildi");
            setName('');
            setPrice('');
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
        <Drawer
            open={open}
            onOpenChange={onOpenChange}
            title="Yangi xizmat qo'shish"
        >
            <div className="space-y-6 pb-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Xizmat nomi</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                        placeholder="Masalan: Tish olish"
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Narxi (so'm)</label>
                    <input
                        type="number"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                        placeholder="0"
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
                        className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50 flex justify-center items-center"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Saqlash"}
                    </button>
                </div>
            </div>
        </Drawer>
    );
}
