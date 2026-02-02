import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Plus, Trash2, User, Stethoscope } from 'lucide-react';
import { AddServiceDrawer } from '@/components/settings/AddServiceDrawer';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Service } from '@/lib/types';

export const Settings = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'services'>('profile');

    // Profile State
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [telegramChatId, setTelegramChatId] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(false);

    // Services State
    const [services, setServices] = useState<Service[]>([]);
    const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchProfile();
            fetchServices();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchProfile = async () => {
        if (!user) return;
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
            setFullName(data.full_name || '');
            setPhone(data.phone || '');
            setTelegramChatId(data.telegram_chat_id || '');
        }
    };

    const fetchServices = async () => {
        if (!user) return;
        const { data } = await supabase.from('services').select('*').eq('doctor_id', user.id).order('name', { ascending: true });
        if (data) {
            setServices(data as Service[]);
        }
    };

    const handleUpdateProfile = async () => {
        if (!user) return;
        setLoadingProfile(true);
        const { error } = await supabase.from('profiles').update({
            full_name: fullName,
            phone: phone,
            telegram_chat_id: telegramChatId
        }).eq('id', user.id);

        if (!error) {
            toast.success("Profil yangilandi");
        } else {
            toast.error("Xatolik yuz berdi");
        }
        setLoadingProfile(false);
    };

    const handleDeleteService = async (id: string) => {
        if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (!error) {
            toast.success("Xizmat o'chirildi");
            fetchServices();
        } else {
            toast.error("Xatolik yuz berdi");
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            <header className="bg-white p-4 items-center flex gap-4 shadow-sm z-10 safe-area-top">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold text-slate-900">Sozlamalar</h1>
            </header>

            <div className="bg-white border-b border-slate-200 flex">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={cn("flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2", activeTab === 'profile' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500")}
                >
                    <User className="w-4 h-4" /> Profil
                </button>
                <button
                    onClick={() => setActiveTab('services')}
                    className={cn("flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2", activeTab === 'services' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500")}
                >
                    <Stethoscope className="w-4 h-4" /> Xizmatlar
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-24">
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="text"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Ism Sharif</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Telegram Chat ID</label>
                                <input
                                    type="text"
                                    value={telegramChatId}
                                    onChange={e => setTelegramChatId(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                                    placeholder="Masalan: 12345678"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    ID raqamingizni bilish uchun <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">@userinfobot</a> ga kiring.
                                </p>
                            </div>
                            <button
                                onClick={handleUpdateProfile}
                                disabled={loadingProfile}
                                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50"
                            >
                                {loadingProfile ? "Saqlanmoqda..." : "Saqlash"}
                            </button>
                        </div>

                        <button
                            onClick={signOut}
                            className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 border border-red-100"
                        >
                            <LogOut className="w-5 h-5" />
                            Chiqish
                        </button>
                    </div>
                )}

                {activeTab === 'services' && (
                    <div className="space-y-4">
                        <button
                            onClick={() => setIsAddServiceOpen(true)}
                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Yangi xizmat
                        </button>

                        <div className="space-y-3">
                            {services.map(s => (
                                <div key={s.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                                    <div>
                                        <div className="font-semibold text-slate-900">{s.name}</div>
                                        <div className="text-blue-600 font-bold">{formatCurrency(s.price)}</div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteService(s.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                            {services.length === 0 && <p className="text-center text-slate-400 py-10">Xizmatlar yo'q</p>}
                        </div>
                    </div>
                )}
            </div>

            <AddServiceDrawer
                open={isAddServiceOpen}
                onOpenChange={setIsAddServiceOpen}
                onSave={fetchServices}
            />
        </div>
    );
};
