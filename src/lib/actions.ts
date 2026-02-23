'use server';

import bcrypt from 'bcryptjs';
import { getUserByEmail } from './data';
import type { User } from './types';

export async function authenticateUser(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
        const userFromDb = await getUserByEmail(email);

        if (!userFromDb) {
            return { success: false, error: 'Invalid email or password.' };
        }

        const passwordsMatch = await bcrypt.compare(password, userFromDb.password);

        if (!passwordsMatch) {
            return { success: false, error: 'Invalid email or password.' };
        }

        // Return user without password
        const { password: _, ...userWithoutPassword } = userFromDb;
        return { 
            success: true, 
            user: userWithoutPassword as User 
        };
    } catch (error) {
        console.error('Auth Error:', error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}
