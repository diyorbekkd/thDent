import { User, Phone, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import type { Patient } from '@/lib/types';
import { uz } from 'date-fns/locale';

interface InfoTabProps {
    patient: Patient;
}

export const InfoTab = ({ patient }: InfoTabProps) => {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <h3 className="font-bold text-slate-900 border-b pb-4">Shaxsiy Ma'lumotlar</h3>

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">To'liq ism</p>
                        <p className="font-medium text-slate-900">{patient.full_name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Telefon</p>
                        <a href={`tel:${patient.phone}`} className="font-medium text-blue-600 hover:underline">{patient.phone}</a>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Ro'yxatdan o'tgan sana</p>
                        <p className="font-medium text-slate-900">
                            {patient.created_at ? format(new Date(patient.created_at), 'd MMMM yyyy', { locale: uz }) : 'Noma\'lum'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Turi</p>
                        <p className="font-medium text-slate-900 capitalize">
                            {patient.type === 'child' ? 'Bolalar' : 'Kattalar'} ({patient.gender === 'male' ? 'Erkak' : 'Ayol'})
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
