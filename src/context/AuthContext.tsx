import { createContext, useContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';

// Define the shape of the context
interface AuthContextType {
    session: Session | null;
    user: User | null;
    role: 'admin' | 'doctor' | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
