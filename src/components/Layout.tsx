import { Outlet, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { BottomNav } from './layout/BottomNav';

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
                <button className="absolute bottom-20 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-10 cursor-pointer active:scale-95">
                    <Plus className="w-6 h-6" />
                </button>
            )}

            <BottomNav />
        </div>
    );
};
