export type PatientType = 'adult' | 'child';

export interface Patient {
    id: string;
    name: string;
    phone: string;
    type: PatientType;
    balance: number; // Negative = Debt, Positive = Advance
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export interface Appointment {
    id: string;
    patientId: string;
    date: string; // ISO string
    status: AppointmentStatus;
    type: string; // Treatment type placeholder
    notes?: string;
}

export type ToothCondition = 'caries' | 'filling' | 'implant' | 'crown' | 'missing' | 'healthy' | 'extraction';

export interface ToothHistory {
    id: string;
    patientId: string;
    toothNumber: number; // ISO 3950
    condition: ToothCondition;
    price: number;
    date: string; // ISO string
}

export type TransactionType = 'income' | 'expense';
export type TransactionCategory = 'treatment' | 'salary' | 'materials' | 'other' | 'payment';

export interface Transaction {
    id: string;
    patientId?: string; // Optional for general expenses
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    date: string; // ISO string
    description?: string;
}
