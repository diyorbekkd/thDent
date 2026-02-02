import { User, Phone, Wallet } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import type { Patient } from '@/lib/types';

interface ProfileHeaderProps {
    patient: Patient;
    onAddPayment: () => void;
}

export const ProfileHeader = ({ patient, onAddPayment }: ProfileHeaderProps) => {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-50 to-white z-0"></div>
            <div className="relative z-10">
                <div className="w-24 h-24 bg-white rounded-full mx-auto shadow-md p-1 mb-4">
                    <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center">
                        <User className="w-10 h-10 text-slate-400" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-1">{patient.full_name}</h1>
                <div className="flex items-center justify-center gap-1 text-slate-500 mb-6">
                    <Phone className="w-4 h-4" />
                    <span>{patient.phone}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-xs text-slate-500 font-medium mb-1">Balans</p>
                        <p className={cn("text-xl font-bold", patient.balance >= 0 ? "text-green-600" : "text-red-500")}>
                            {formatCurrency(patient.balance)}
                        </p>
                    </div>
                    <button
                        onClick={onAddPayment}
                        className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
                    >
                        <Wallet className="w-6 h-6" />
                        <span className="text-xs font-bold">To'lov</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
