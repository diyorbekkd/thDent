import { useState, useEffect } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { cn, formatCurrency } from '@/lib/utils';
import type { Transaction, TransactionCategory } from '@/lib/types';
import { format, startOfToday, subDays } from 'date-fns';
import { Loader2, TrendingUp, TrendingDown, Wallet, Plus, X } from 'lucide-react';

export const Finance = () => {
    const { tg } = useTelegram();
    const { user } = useAuth();

    // State
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // User Requirement: "Date Filter (Default: Today)"
    const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

    // Expense Form
    const [expenseForm, setExpenseForm] = useState({
        amount: '',
        category: 'material' as TransactionCategory,
        description: ''
    });

    // --- Fetching ---

    useEffect(() => {
        if (!user) return;

        const fetchTransactions = async () => {
            setLoading(true);
            let query = supabase
                .from('transactions')
                .select('*')
                .eq('doctor_id', user?.id)
                .order('created_at', { ascending: false });

            const today = new Date();
            if (period === 'today') {
                const start = format(startOfToday(), 'yyyy-MM-dd') + 'T00:00:00';
                query = query.gte('created_at', start);
            } else if (period === 'week') {
                const start = format(subDays(today, 7), 'yyyy-MM-dd') + 'T00:00:00';
                query = query.gte('created_at', start);
            } else if (period === 'month') {
                const start = format(subDays(today, 30), 'yyyy-MM-dd') + 'T00:00:00';
                query = query.gte('created_at', start);
            }

            const { data, error } = await query;
            if (!error && data) {
                setTransactions(data as Transaction[]);
            }
            setLoading(false);
        };

        fetchTransactions();
    }, [user, period]);


    // --- Stats ---

    const stats = transactions.reduce((acc, t) => {
        const val = Number(t.amount);
        if (t.type === 'income') {
            acc.income += val;
        } else {
            acc.expense += val;
        }
        return acc;
    }, { income: 0, expense: 0 });

    const profit = stats.income - stats.expense;

    // --- Handlers ---

    // We need a way to refresh transactions after adding expense. 
    // Since fetchTransactions is inside useEffect, we can use a refresh trigger or just insert to local state.
    // Simplest is to append to local state or re-trigger effect. 
    // Let's refactor fetchTransactions to be outside or use refreshKey.
    // Actually, `fetchTransactions` inside `useEffect` makes it hard to call from `handleAddExpense`.
    // I will redefine `fetchTransactions` via useCallback or simpler: just insert to state optimistically.

    const [refreshKey, setRefreshKey] = useState(0);

    // Adjusted Effect
    useEffect(() => {
        if (!user) return;

        const fetch = async () => {
            setLoading(true);
            let query = supabase
                .from('transactions')
                .select('*')
                .eq('doctor_id', user?.id)
                .order('created_at', { ascending: false });

            const today = new Date();
            if (period === 'today') {
                const start = format(startOfToday(), 'yyyy-MM-dd') + 'T00:00:00';
                query = query.gte('created_at', start);
            } else if (period === 'week') {
                const start = format(subDays(today, 7), 'yyyy-MM-dd') + 'T00:00:00';
                query = query.gte('created_at', start);
            } else if (period === 'month') {
                const start = format(subDays(today, 30), 'yyyy-MM-dd') + 'T00:00:00';
                query = query.gte('created_at', start);
            }

            const { data, error } = await query;
            if (!error && data) {
                setTransactions(data as Transaction[]);
            }
            setLoading(false);
        };

        fetch();
    }, [user, period, refreshKey]);

    const handleAddExpense = async () => {
        if (!expenseForm.amount || !user) {
            tg.showAlert("Summani kiriting");
            return;
        }

        const { error } = await supabase.from('transactions').insert({
            amount: Number(expenseForm.amount),
            type: 'expense',
            category: expenseForm.category,
            description: expenseForm.description || 'Chiqim',
            doctor_id: user.id
        });

        if (!error) {
            tg.HapticFeedback.notificationOccurred('success');
            setIsExpenseModalOpen(false);
            setExpenseForm({ amount: '', category: 'material', description: '' });
            setRefreshKey(prev => prev + 1); // Trigger re-fetch
        } else {
            console.error(error);
            tg.HapticFeedback.notificationOccurred('error');
            alert("Xatolik");
        }
    };


    // --- Render ---

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white p-4 shadow-sm z-10 space-y-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold text-slate-800">Moliya</h1>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button onClick={() => setPeriod('today')} className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", period === 'today' ? "bg-white shadow text-slate-900" : "text-slate-500")}>Bugun</button>
                        <button onClick={() => setPeriod('week')} className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", period === 'week' ? "bg-white shadow text-slate-900" : "text-slate-500")}>Hafta</button>
                        <button onClick={() => setPeriod('month')} className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", period === 'month' ? "bg-white shadow text-slate-900" : "text-slate-500")}>Oy</button>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-6">

                {/* Widgets */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 col-span-2 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 font-medium mb-1">Sof Foyda</p>
                            <h2 className="text-2xl font-bold text-blue-600">{formatCurrency(profit)}</h2>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center"><TrendingUp className="w-4 h-4 text-green-600" /></div>
                            <span className="text-xs font-bold text-slate-600">Kirim</span>
                        </div>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(stats.income)}</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center"><TrendingDown className="w-4 h-4 text-red-600" /></div>
                            <span className="text-xs font-bold text-slate-600">Chiqim</span>
                        </div>
                        <p className="text-lg font-bold text-red-600">{formatCurrency(stats.expense)}</p>
                    </div>
                </div>

                {/* Transactions List */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">Oxirgi o'tkazmalar</h3>
                    </div>

                    <div className="space-y-3">
                        {loading ? <div className="flex justify-center p-4"><Loader2 className="animate-spin text-blue-600" /></div> : transactions.map(t => (
                            <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">{t.description || (t.category === 'treatment' ? 'Davolash' : 'Chiqim')}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-slate-400">{format(new Date(t.created_at), 'HH:mm')}</span>
                                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500 capitalize">{t.category}</span>
                                    </div>
                                </div>
                                <span className={cn("font-bold text-sm", t.type === 'income' ? "text-green-600" : "text-red-600")}>
                                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                </span>
                            </div>
                        ))}
                        {!loading && transactions.length === 0 && <p className="text-center text-slate-400 text-sm">Ma'lumot yo'q</p>}
                    </div>
                </div>
            </div>

            {/* Fab for Expense */}
            <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="fixed bottom-24 right-4 bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-colors z-20 flex items-center gap-2 pr-5 pl-4 active:scale-95"
            >
                <Plus className="w-5 h-5" />
                <span className="font-bold text-sm">Chiqim</span>
            </button>

            {/* Add Expense Modal */}
            {isExpenseModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-bold">Chiqim qo'shish</h2>
                            <button onClick={() => setIsExpenseModalOpen(false)}><X className="w-6 h-6 text-slate-400" /></button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Summa</label>
                            <input
                                type="number"
                                value={expenseForm.amount}
                                onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 text-lg"
                                placeholder="0"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Kategoriya</label>
                            <select
                                value={expenseForm.category}
                                onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value as TransactionCategory })}
                                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 bg-white"
                            >
                                <option value="material">Materiallar</option>
                                <option value="transport">Transport</option>
                                <option value="lunch">Tushlik</option>
                                <option value="other">Boshqa</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Izoh</label>
                            <input
                                type="text"
                                value={expenseForm.description}
                                onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500"
                                placeholder="Masalan: Taksiga"
                            />
                        </div>

                        <button
                            onClick={handleAddExpense}
                            className="w-full py-3 bg-red-500 text-white font-bold rounded-xl active:scale-95 transition-transform mt-2"
                        >
                            Saqlash
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
