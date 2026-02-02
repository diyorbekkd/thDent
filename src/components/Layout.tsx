import { Outlet } from 'react-router-dom';
import { BottomNav } from './layout/BottomNav';

export const Layout = () => {
    return (
        <div className="flex flex-col h-screen bg-slate-50 relative overflow-hidden">
            <main className="flex-1 overflow-y-auto pb-20">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
};
