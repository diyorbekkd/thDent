import { useEffect, useState, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Patient, Appointment, ToothHistory, Transaction } from '@/lib/types';
import { startOfToday, addHours } from 'date-fns';
import { StoreContext } from './MedlinkContext';

const STORAGE_KEY = 'medlink_dental_v1';
const TODAY = startOfToday();

const MOCK_PATIENTS: Patient[] = [
    { id: '1', name: 'Jamshid Aliyev', phone: '+998 90 123 45 67', type: 'adult', balance: -1200000 },
    { id: '2', name: 'Malika Karimova', phone: '+998 93 987 65 43', type: 'child', balance: 0 },
    { id: '3', name: 'Sardor Rahimov', phone: '+998 97 111 22 33', type: 'adult', balance: 500000 },
    { id: '4', name: 'Laylo Usmanova', phone: '+998 99 555 44 88', type: 'adult', balance: -450000 },
    { id: '5', name: 'Azizbek Tursunov', phone: '+998 91 777 88 99', type: 'child', balance: 0 },
];

const MOCK_APPOINTMENTS: Appointment[] = [
    { id: '1', patientId: '1', date: addHours(TODAY, 9).toISOString(), status: 'completed', type: 'Consultation' },
    { id: '2', patientId: '2', date: addHours(TODAY, 10).toISOString(), status: 'confirmed', type: 'Filling' },
    { id: '3', patientId: '3', date: addHours(TODAY, 11).toISOString(), status: 'scheduled', type: 'Checkup' },
    { id: '4', patientId: '4', date: addHours(TODAY, 14).toISOString(), status: 'cancelled', type: 'Extraction' },
];

const MOCK_HISTORY: ToothHistory[] = [
    { id: 'mock-1', patientId: '1', toothNumber: 16, condition: 'implant', price: 1200000, date: addHours(TODAY, -24 * 5).toISOString() }
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

    // Save to local storage on change
    useEffect(() => {
        const data = { patients, appointments, toothHistory, transactions };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [patients, appointments, toothHistory, transactions]);

    const addPatient = (patientFn: Omit<Patient, 'id' | 'balance'>) => {
        const newPatient: Patient = { ...patientFn, id: uuidv4(), balance: 0 };
        setPatients([...patients, newPatient]);
    };

    const updatePatient = (id: string, data: Partial<Patient>) => {
        setPatients(patients.map(p => p.id === id ? { ...p, ...data } : p));
    };

    const addAppointment = (appt: Omit<Appointment, 'id'>) => {
        setAppointments([...appointments, { ...appt, id: uuidv4() }]);
    };

    const updateAppointment = (id: string, status: Appointment['status']) => {
        setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
    };

    const addToothTreatment = (treatment: Omit<ToothHistory, 'id' | 'date'>) => {
        const date = new Date().toISOString();
        const newTreatment = { ...treatment, id: uuidv4(), date };
        setToothHistory([...toothHistory, newTreatment]);

        const patient = patients.find(p => p.id === treatment.patientId);
        if (patient) {
            updatePatient(patient.id, { balance: patient.balance - treatment.price });
        }
    };

    const addTransaction = (trx: Omit<Transaction, 'id' | 'date'>) => {
        const newTrx = { ...trx, id: uuidv4(), date: new Date().toISOString() };
        setTransactions([...transactions, newTrx]);

        if (trx.category === 'payment' && trx.patientId) {
            const patient = patients.find(p => p.id === trx.patientId);
            if (patient) {
                updatePatient(patient.id, { balance: patient.balance + trx.amount });
            }
        }
    };

    const getPatientAppointments = (patientId: string) => appointments.filter(a => a.patientId === patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const getPatientHistory = (patientId: string) => toothHistory.filter(h => h.patientId === patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const getPatientTransactions = (patientId: string) => transactions.filter(t => t.patientId === patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <StoreContext.Provider value={{
            patients, appointments, toothHistory, transactions,
            addPatient, updatePatient, addAppointment, updateAppointment, addToothTreatment, addTransaction,
            getPatientAppointments, getPatientHistory, getPatientTransactions
        }}>
            {children}
        </StoreContext.Provider>
    );
};
