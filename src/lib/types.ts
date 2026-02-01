
export type PatientType = 'adult' | 'child';
export type Gender = 'male' | 'female';
export type ToothCondition = 'caries' | 'filling' | 'implant' | 'crown' | 'missing' | 'extraction' | 'healthy';

export interface Patient {
    id: string;
    created_at: string;
    full_name: string;
    phone: string;
    birth_date?: string;
    gender?: Gender;
    type: PatientType;
    balance: number;
    doctor_id: string;
}

export interface Treatment {
    id: string;
    patient_id: string;
    tooth_number: number;
    condition: ToothCondition;
    price: number;
    created_at: string;
    doctor_id: string;
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export interface Appointment {
    id: string;
    patient_id: string;
    doctor_id: string;
    date: string; // ISO string
    status: AppointmentStatus;
    notes?: string;
    patient?: Patient; // Joined
}

export interface Service {
    id: string;
    name: string;
    price: number;
}

export type TransactionType = 'income' | 'expense';
export type TransactionCategory = 'treatment' | 'material' | 'lunch' | 'transport' | 'other';

export interface Transaction {
    id: string;
    created_at: string;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    description: string;
    doctor_id: string;
    patient_id?: string;
    patient?: Patient; // Joined
}
