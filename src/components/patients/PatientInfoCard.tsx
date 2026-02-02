import { Phone } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import type { Patient } from '@/lib/types';

interface PatientInfoCardProps {
    patient: Patient;
}

export function PatientInfoCard({ patient }: PatientInfoCardProps) {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-slate-500">Telefon</span>
                <a href={`tel:${patient.phone}`} className="font-semibold text-blue-600 flex items-center">
                    <Phone className="w-4 h-4 mr-1" /> {patient.phone}
                </a>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-slate-500">Turi</span>
                <span className="font-medium capitalize">{patient.type === 'adult' ? 'Kattalar' : 'Bolalar'}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-slate-500">Balans</span>
                <span className={cn("font-bold", patient.balance < 0 ? "text-red-600" : "text-green-600")}>
                    {formatCurrency(patient.balance)}
                </span>
            </div>
        </div>
    );
}
