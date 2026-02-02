import { supabase } from '@/lib/supabase';
import type { ToothCondition, AppointmentStatus } from '@/lib/types';
import { addDays, subDays, startOfToday, setHours, setMinutes } from 'date-fns';

export async function seedDatabase(userId: string) {
    console.log('Starting seed for user:', userId);

    // 1. SERVICES
    const services = [
        { name: 'Konsultatsiya', price: 50000, doctor_id: userId },
        { name: 'Kompozit Plomba', price: 300000, doctor_id: userId },
        { name: 'Tish Olish', price: 150000, doctor_id: userId },
        { name: 'Implant Osstem', price: 3500000, doctor_id: userId },
        { name: 'Tish Tozalash', price: 200000, doctor_id: userId }
    ];

    const { error: sError } = await supabase.from('services').insert(services);
    if (sError) throw new Error('Error seeding services: ' + sError.message);


    // 2. PATIENTS
    const patients = [
        {
            full_name: 'Azizbek Rahimov',
            phone: '+998901234567',
            type: 'adult',
            balance: -450000,
            doctor_id: userId,
            gender: 'male',
            birth_date: '1990-01-01'
        },
        {
            full_name: 'Malika Karimova',
            phone: '+998931112233',
            type: 'child',
            balance: 0,
            doctor_id: userId,
            gender: 'female',
            birth_date: '2019-05-15'
        },
        {
            full_name: 'Sardor Tursunov',
            phone: '+998977778899',
            type: 'adult',
            balance: 1200000,
            doctor_id: userId,
            gender: 'male',
            birth_date: '1985-08-20'
        }
    ];

    const { data: pData, error: pError } = await supabase
        .from('patients')
        .insert(patients)
        .select();

    if (pError || !pData) throw new Error('Error seeding patients: ' + pError?.message);

    const patientA = pData.find(p => p.full_name === 'Azizbek Rahimov');
    const patientB = pData.find(p => p.full_name === 'Malika Karimova');
    const patientC = pData.find(p => p.full_name === 'Sardor Tursunov');

    if (!patientA || !patientB || !patientC) throw new Error('Could not retrieve created patients');


    // 3. APPOINTMENTS
    const today = startOfToday();

    // Patient A: Today at 14:00
    const dateA = setMinutes(setHours(today, 14), 0).toISOString();

    // Patient B: Tomorrow at 10:00
    const dateB = setMinutes(setHours(addDays(today, 1), 10), 0).toISOString();

    // Patient C: Yesterday at 16:00
    const dateC = setMinutes(setHours(subDays(today, 1), 16), 0).toISOString();

    const appointments = [
        {
            patient_id: patientA.id,
            doctor_id: userId,
            date: dateA,
            status: 'confirmed' as AppointmentStatus,
            notes: "Plomba qo'yish"
        },
        {
            patient_id: patientB.id,
            doctor_id: userId,
            date: dateB,
            status: 'scheduled' as AppointmentStatus,
            notes: "Sut tishini olish"
        },
        {
            patient_id: patientC.id,
            doctor_id: userId,
            date: dateC,
            status: 'completed' as AppointmentStatus,
            notes: "Ko'rik va tozalash"
        }
    ];

    const { error: aError } = await supabase.from('appointments').insert(appointments);
    if (aError) throw new Error('Error seeding appointments: ' + aError.message);


    // 4. TRANSACTIONS
    const transactions = [
        {
            amount: 500000,
            type: 'income',
            category: 'treatment',
            description: "To'lov: Sardor Tursunov",
            doctor_id: userId,
            patient_id: patientC.id,
            created_at: subDays(new Date(), 1).toISOString()
        },
        {
            amount: 120000,
            type: 'expense',
            category: 'material',
            description: "Anesteziya sotib olish",
            doctor_id: userId,
            created_at: new Date().toISOString()
        }
    ];

    const { error: trError } = await supabase.from('transactions').insert(transactions);
    if (trError) throw new Error('Error seeding transactions: ' + trError.message);


    // 5. TREATMENTS (Dental History)
    const treatments = [
        // Patient A: 36 Caries, 46 Filling
        {
            patient_id: patientA.id,
            tooth_number: 36,
            condition: 'caries' as ToothCondition,
            price: 0, // Diagnosize qilingan, hali davolanmagan
            doctor_id: userId,
            created_at: subDays(new Date(), 2).toISOString()
        },
        {
            patient_id: patientA.id,
            tooth_number: 46,
            condition: 'filling' as ToothCondition,
            price: 300000,
            doctor_id: userId,
            created_at: subDays(new Date(), 5).toISOString()
        },
        // Patient B: 55 Extraction
        {
            patient_id: patientB.id,
            tooth_number: 55,
            condition: 'extraction' as ToothCondition,
            price: 150000,
            doctor_id: userId,
            created_at: subDays(new Date(), 1).toISOString()
        }
    ];

    const { error: tmError } = await supabase.from('treatments').insert(treatments);
    if (tmError) throw new Error('Error seeding treatments: ' + tmError.message);

    console.log('Seeding completed successfully');
}
