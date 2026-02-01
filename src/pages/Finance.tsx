import { useAppContext } from '@/hooks/useAppContext';
import { isSameDay, parseISO, startOfToday } from 'date-fns';
import { formatCurrency, cn, formatDate } from '@/lib/utils';
import { TrendingUp, TrendingDown, PlusCircle } from 'lucide-react';

export const Finance = () => {
    const { transactions, addTransaction } = useAppContext();

    const today = startOfToday();

    const todayTransactions = transactions.filter(t => isSameDay(parseISO(t.date), today));

    const income = todayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = todayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const net = income - expense;

    const handleAddExpense = () => {
        const amount = Number(prompt("Xarajat summasini kiriting:"));
        if (amount) {
            addTransaction({
                amount,
                type: 'expense',
                category: 'materials',
                description: 'Materiallar (Demo)'
            });
        }
    };

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Kassa</h1>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="flex items-center text-green-700 mb-2">
                        <TrendingUp className="w-5 h-5 mr-1" />
                        <span className="font-medium">Kirim</span>
                    </div>
                    <p className="text-xl font-bold text-green-800">{formatCurrency(income)}</p>
                </div>

                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <div className="flex items-center text-red-700 mb-2">
                        <TrendingDown className="w-5 h-5 mr-1" />
                        <span className="font-medium">Chiqim</span>
                    </div>
                    <p className="text-xl font-bold text-red-800">{formatCurrency(expense)}</p>
                </div>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
                <p className="text-slate-400 mb-1">Sof foyda (Bugun)</p>
                <p className="text-3xl font-bold">{formatCurrency(net)}</p>
            </div>

            <button
                onClick={handleAddExpense}
                className="w-full py-4 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl shadow-sm flex items-center justify-center space-x-2 hover:bg-slate-50 active:scale-95 transition-transform"
            >
                <PlusCircle className="w-5 h-5 text-red-500" />
                <span>Chiqim qo'shish</span>
            </button>

            <div>
                <h3 className="font-bold text-slate-800 mb-3">Bugungi o'tkazmalar</h3>
                <div className="space-y-3">
                    {todayTransactions.length === 0 ? (
                        <p className="text-slate-400 text-sm">Hozircha o'tkazmalar yo'q</p>
                    ) : (
                        todayTransactions.map(t => (
                            <div key={t.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                                <div>
                                    <p className="font-medium text-slate-900 capitalize">{t.category}</p>
                                    <p className="text-xs text-slate-500">{t.description || formatDate(t.date)}</p>
                                </div>
                                <span className={cn(
                                    "font-bold",
                                    t.type === 'income' ? "text-green-600" : "text-red-600"
                                )}>
                                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
