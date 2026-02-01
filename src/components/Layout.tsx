import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Calendar, Users, Wallet, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Layout = () => {
    const location = useLocation();
    const isDetailView = location.pathname.includes('/patients/') && location.pathname.split('/').length > 2;

    return (
        <div className="flex flex-col h-screen bg-slate-50 relative overflow-hidden">
            <main className="flex-1 overflow-y-auto pb-20">
                <Outlet />
            </main>

            {/* Floating Action Button */}
            {!isDetailView && (
                <button className="absolute bottom-20 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-10">
                    <Plus className="w-6 h-6" />
                </button>
            )}

            {/* Bottom Navigation */}
            <nav className="border-t border-slate-200 bg-white fixed bottom-0 w-full z-20 safe-area-bottom">
                <div className="flex justify-around items-center h-16">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            cn("flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors",
                                isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                            )
                        }
                    >
                        <Calendar className="w-6 h-6 mb-1" />
                        Jadval
                    </NavLink>

                    <NavLink
                        to="/patients"
                        className={({ isActive }) =>
                            cn("flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors",
                                isActive || location.pathname.startsWith('/patients') ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                            )
                        }
                    >
                        <Users className="w-6 h-6 mb-1" />
                        Bemorlar
                    </NavLink>

                    <NavLink
                        to="/finance"
                        className={({ isActive }) =>
                            cn("flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors",
                                isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                            )
                        }
                    >
                        <Wallet className="w-6 h-6 mb-1" />
                        Kassa
                    </NavLink>
                </div>
            </nav>
        </div>
    );
};
