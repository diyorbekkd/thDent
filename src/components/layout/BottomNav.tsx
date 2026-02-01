import { NavLink, useLocation } from 'react-router-dom';
import { Calendar, Users, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BottomNav = () => {
    const location = useLocation();

    return (
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
    );
};
