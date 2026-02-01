import { createContext } from 'react';
import type { Patient, Appointment, ToothHistory, Transaction } from '@/lib/types';

export interface AppContextType {
    patients: Patient[];
    appointments: Appointment[];
    toothHistory: ToothHistory[];
    transactions: Transaction[];
    addPatient: (patient: Omit<Patient, 'id' | 'balance'>) => void;
    updatePatient: (id: string, data: Partial<Patient>) => void;
    addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
    updateAppointment: (id: string, status: Appointment['status']) => void;
    addToothTreatment: (treatment: Omit<ToothHistory, 'id' | 'date'>) => void;
    addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
    getPatientAppointments: (patientId: string) => Appointment[];
    getPatientHistory: (patientId: string) => ToothHistory[];
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
