import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { ArrowRight, CheckCircle2, Stethoscope, Wallet, Bell, ShieldCheck } from 'lucide-react';

export const Landing = () => {
    const navigate = useNavigate();
    const { session } = useAuth();

    // Redirect to Dashboard if already logged in
    useEffect(() => {
        if (session) {
            navigate('/dashboard');
        }
    }, [session, navigate]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Navbar */}
            <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
                        <span className="font-bold text-xl tracking-tight">Medlink <span className="text-blue-600">Dental</span></span>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                    >
                        Kirish
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-blue-50 to-white">
                <div className="max-w-3xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Stomatologlar uchun maxsus
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                        Stomatologiya biznesingizni <span className="text-blue-600">telefondan</span> boshqaring
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Bemorlar, Moliya va Tish formulasini yagona Telegram tizimida nazorat qiling. Ortiqcha qog'ozbozliksiz.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            Tizimga Kirish <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
                        >
                            Namoyishni ko'rish
                        </button>
                    </div>

                    <div className="pt-8 flex items-center justify-center gap-6 text-sm text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> 14 kun bepul</span>
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Telegram orqali</span>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="p-8 rounded-3xl bg-slate-50 hover:bg-blue-50 transition-colors group border border-slate-100 hover:border-blue-100">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Stethoscope className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Interaktiv Formula</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Kattalar va bolalar tishlarini oson belgilang. Har bir tish holatini vizual ko'ring.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="p-8 rounded-3xl bg-slate-50 hover:bg-blue-50 transition-colors group border border-slate-100 hover:border-blue-100">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Wallet className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Aniq Moliya</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Kirim, chiqim va qarzlarni nazorat qiling. Kunlik tushumlar avtomatik hisoblanadi.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="p-8 rounded-3xl bg-slate-50 hover:bg-blue-50 transition-colors group border border-slate-100 hover:border-blue-100">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Bell className="w-6 h-6 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Telegram Eslatmalar</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Bemorlaringizga avtomatik eslatma xabarlarini yuboring va mijozlar sodiqligini oshiring.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-20 px-4 bg-slate-900 text-white text-center">
                <div className="max-w-4xl mx-auto space-y-8">
                    <ShieldCheck className="w-12 h-12 text-blue-400 mx-auto opacity-80" />
                    <h2 className="text-3xl font-bold">O'zbekistonning 100+ shifokorlari tanlovi</h2>
                    <p className="text-slate-400">Bizning maqsadimiz — shifokorlar ishini osonlashtirish va daromadini oshirish.</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 text-center text-slate-400 text-sm bg-slate-950">
                © 2024 Medlink Dental. Barcha huquqlar himoyalangan.
            </footer>
        </div>
    );
};
