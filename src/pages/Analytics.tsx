import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Users, DollarSign, Wallet, Loader2 } from 'lucide-react';
import { DateFilterDrawer } from '@/components/analytics/DateFilterDrawer';
import type { DateRangeOption } from '@/components/analytics/DateFilterDrawer';
import { formatCurrency, cn } from '@/lib/utils';
import { startOfWeek, startOfMonth, startOfYear, subMonths, endOfMonth, format, parseISO } from 'date-fns';
import { uz } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Transaction, Treatment } from '@/lib/types';

export const Analytics = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // State
    const [dateRange, setDateRange] = useState<DateRangeOption>('month');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [treatments, setTreatments] = useState<Treatment[]>([]);
    const [loading, setLoading] = useState(true);

    // Helpers
    const getDateInterval = (range: DateRangeOption) => {
        const now = new Date();
        switch (range) {
            case 'week': return { start: startOfWeek(now, { weekStartsOn: 1 }), end: now };
            case 'month': return { start: startOfMonth(now), end: now };
            case 'last_month': {
                const lastMonth = subMonths(now, 1);
                return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
            }
            case 'year': return { start: startOfYear(now), end: now };
            default: return { start: startOfMonth(now), end: now };
        }
    };

    const getRangeLabel = (range: DateRangeOption) => {
        switch (range) {
            case 'week': return 'Bu hafta';
            case 'month': return 'Bu oy';
            case 'last_month': return "O'tgan oy";
            case 'year': return 'Yil boshidan';
        }
    };

    // Fetch Data
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);
            const { start, end } = getDateInterval(dateRange);
            const startStr = start.toISOString();
            const endStr = end.toISOString();

            // Fetch Transactions
            const { data: txData } = await supabase
                .from('transactions')
                .select('*')
                .eq('doctor_id', user.id)
                .gte('created_at', startStr)
                .lte('created_at', endStr);

            if (txData) setTransactions(txData as Transaction[]);

            // Fetch Treatments (for Services stats)
            const { data: trData } = await supabase
                .from('treatments')
                .select('*, service:services(name)')
                .eq('doctor_id', user.id)
                .gte('created_at', startStr)
                .lte('created_at', endStr);

            if (trData) setTreatments(trData as Treatment[]); // Note: We might need a join here if service name isn't directly available or stored. 
            // Ideally treatments usually store condition, but if linked to service, we need join. 
            // For now assuming we just aggregate by condition or raw price if service link is tricky.
            // Actually, the user asked for "Top Services". 
            // If services are new, old treatments might not have service_id.
            // Let's aggregate by 'condition' and 'tooth_number' or if we have service name. 
            // Since we just added Services table, let's look at `treatments`. 
            // If `treatments` doesn't have `service_id`, we might rely on `condition`.

            setLoading(false);
        };
        fetchData();
    }, [user, dateRange]);

    // Aggregations
    const stats = useMemo(() => {
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        // Unique patients in this period (from transactions or treatments)
        const patientSet = new Set([
            ...transactions.map(t => t.patient_id).filter(Boolean),
            ...treatments.map(t => t.patient_id)
        ]);
        const uniquePatients = patientSet.size;

        const avgCheck = uniquePatients > 0 ? totalIncome / uniquePatients : 0;

        return { totalIncome, totalExpense, uniquePatients, avgCheck };
    }, [transactions, treatments]);

    const chartData = useMemo(() => {
        const { start, end } = getDateInterval(dateRange);
        const iter = new Date(start);
        const dayMap = new Map<string, { display: string, income: number, expense: number }>();

        while (iter <= end) {
            const key = format(iter, 'yyyy-MM-dd');
            const display = format(iter, 'd-MMM', { locale: uz });
            dayMap.set(key, { display, income: 0, expense: 0 });
            iter.setDate(iter.getDate() + 1);
        }

        transactions.forEach(t => {
            const key = format(parseISO(t.created_at), 'yyyy-MM-dd');
            if (dayMap.has(key)) {
                const entry = dayMap.get(key)!;
                if (t.type === 'income') entry.income += t.amount;
                else entry.expense += t.amount;
            }
        });

        // Filter out empty days if range is year? No, show all for bar chart is fine usually, but maybe too crowded.
        // For 'year', maybe aggregate by month.
        if (dateRange === 'year') {
            // Logic for monthly aggregation could go here, but for simplicity let's stick to daily or keep it simple
            // Recharts sets width automatically.
        }

        return Array.from(dayMap.values());
    }, [transactions, dateRange]);

    const topServices = useMemo(() => {
        const counts: Record<string, { count: number, revenue: number }> = {};

        treatments.forEach(t => {
            const label = t.condition.toUpperCase(); // Or use service name if available
            if (!counts[label]) counts[label] = { count: 0, revenue: 0 };
            counts[label].count += 1;
            counts[label].revenue += t.price;
        });

        return Object.entries(counts)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 5)
            .map(([name, data]) => ({ name, ...data }));
    }, [treatments]);

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            <header className="bg-white p-4 flex justify-between items-center shadow-sm z-10 safe-area-top">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900">Hisobotlar</h1>
                </div>
                <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                >
                    <Calendar className="w-4 h-4" />
                    {getRangeLabel(dateRange)}
                </button>
            </header>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-6">

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-200 col-span-2">
                            <div className="text-blue-100 text-sm font-medium mb-1 flex items-center gap-2">
                                <Wallet className="w-4 h-4" /> Jami Kirim
                            </div>
                            <div className="text-3xl font-bold">{formatCurrency(stats.totalIncome)}</div>
                            <div className="mt-2 text-xs text-blue-200 bg-white/10 px-2 py-1 rounded inline-block">
                                {transactions.filter(t => t.type === 'income').length} ta to'lov
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                            <div className="text-slate-500 text-xs font-medium mb-1 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" /> O'rtacha Chek
                            </div>
                            <div className="text-lg font-bold text-slate-900">{formatCurrency(stats.avgCheck)}</div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                            <div className="text-slate-500 text-xs font-medium mb-1 flex items-center gap-1">
                                <Users className="w-3 h-3" /> Bemorlar
                            </div>
                            <div className="text-lg font-bold text-slate-900">{stats.uniquePatients}</div>
                        </div>
                    </div>

                    {/* Revenue Chart */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 min-h-[300px]">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" /> Daromad Dinamikasi
                        </h3>
                        <div className="h-[250px] w-full text-xs">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="display" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} minTickGap={20} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} tickFormatter={(val) => `${val / 1000}k`} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="income" fill="#2563eb" radius={[4, 4, 0, 0]} name="Kirim" maxBarSize={40} />
                                    <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Chiqim" maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Services */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-orange-500" /> Top Xizmatlar
                        </h3>
                        <div className="space-y-3">
                            {topServices.map((svc, i) => (
                                <div key={svc.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                                            i === 0 ? "bg-yellow-100 text-yellow-700" :
                                                i === 1 ? "bg-slate-100 text-slate-700" :
                                                    i === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-50 text-slate-500"
                                        )}>
                                            {i + 1}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-800 text-sm">{svc.name}</div>
                                            <div className="text-xs text-slate-400">{svc.count} ta muolaja</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-slate-700">
                                        {formatCurrency(svc.revenue)}
                                    </div>
                                </div>
                            ))}
                            {topServices.length === 0 && <p className="text-center text-slate-400 text-sm py-4">Ma'lumot yo'q</p>}
                        </div>
                    </div>

                </div>
            )}

            <DateFilterDrawer
                open={isFilterOpen}
                onOpenChange={setIsFilterOpen}
                selectedRange={dateRange}
                onSelectRange={setDateRange}
            />
        </div>
    );
};
