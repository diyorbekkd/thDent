import { useEffect, useState, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Patient, Appointment, ToothHistory, Transaction } from '@/lib/types';
import { startOfToday, addHours } from 'date-fns';
import { AppContext } from './Context';

const STORAGE_KEY = 'medlink_dental_mvp_v1';
const TODAY = startOfToday();

const MOCK_PATIENTS: Patient[] = [
    { id: '1', name: 'Azizbek Tursunov', phone: '+998 90 123 45 67', type: 'adult', balance: -1200000 },
    { id: '2', name: 'Malika Karimova', phone: '+998 93 987 65 43', type: 'child', balance: 0 },
    { id: '3', name: 'Jamshid Aliyev', phone: '+998 97 111 22 33', type: 'adult', balance: 500000 },
];

const MOCK_APPOINTMENTS: Appointment[] = [
    { id: '1', patientId: '1', date: addHours(TODAY, 9).toISOString(), status: 'completed', type: 'Consultation' },
    { id: '2', patientId: '2', date: addHours(TODAY, 10).toISOString(), status: 'confirmed', type: 'Filling' },
    { id: '3', patientId: '3', date: addHours(TODAY, 11).toISOString(), status: 'scheduled', type: 'Checkup' },
];

const MOCK_HISTORY: ToothHistory[] = [
    { id: 'mock-1', patientId: '1', toothNumber: 16, condition: 'implant', price: 1200000, date: addHours(TODAY, -24 * 5).toISOString() }
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [patients, setPatients] = useState<Patient[]>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored).patients || [] : MOCK_PATIENTS;
    });

    const [appointments, setAppointments] = useState<Appointment[]>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored).appointments || [] : MOCK_APPOINTMENTS;
    });

    const [toothHistory, setToothHistory] = useState<ToothHistory[]>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored).toothHistory || [] : MOCK_HISTORY;
    });

    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored).transactions || [] : [];
    });

    useEffect(() => {
        const data = { patients, appointments, toothHistory, transactions };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [patients, appointments, toothHistory, transactions]);

    const addPatient = (patientFn: Omit<Patient, 'id' | 'balance'>) => {
        const newPatient: Patient = { ...patientFn, id: uuidv4(), balance: 0 };
        setPatients(prev => [...prev, newPatient]);
    };

    const updatePatient = (id: string, data: Partial<Patient>) => {
        setPatients(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    };

    const addAppointment = (appt: Omit<Appointment, 'id'>) => {
        setAppointments(prev => [...prev, { ...appt, id: uuidv4() }]);
    };

    const updateAppointment = (id: string, status: Appointment['status']) => {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    };

    const addToothTreatment = (treatment: Omit<ToothHistory, 'id' | 'date'>) => {
        const date = new Date().toISOString();
        const newTreatment = { ...treatment, id: uuidv4(), date };
        setToothHistory(prev => [...prev, newTreatment]);

        setPatients(prev => prev.map(p => {
            if (p.id === treatment.patientId) {
                return { ...p, balance: p.balance - treatment.price };
            }
            return p;
        }));
    };

    const addTransaction = (trx: Omit<Transaction, 'id' | 'date'>) => {
        const newTrx = { ...trx, id: uuidv4(), date: new Date().toISOString() };
        setTransactions(prev => [...prev, newTrx]);

        if (trx.category === 'payment' && trx.patientId) {
            setPatients(prev => prev.map(p => {
                if (p.id === trx.patientId) {
                    return { ...p, balance: p.balance + trx.amount };
                }
                return p;
            }));
        }
    };

    const getPatientAppointments = (patientId: string) =>
        appointments
            .filter(a => a.patientId === patientId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const getPatientHistory = (patientId: string) =>
        toothHistory
            .filter(h => h.patientId === patientId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <AppContext.Provider value={{
            patients, appointments, toothHistory, transactions,
            addPatient, updatePatient, addAppointment, updateAppointment, addToothTreatment, addTransaction,
            getPatientAppointments, getPatientHistory
        }}>
            {children}
        </AppContext.Provider>
    );
};
