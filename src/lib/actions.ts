
'use server';

import bcrypt from 'bcryptjs';
import { getUserByEmail } from './data';
import type { User } from './types';

/**
 * Server Action to authenticate a user against the MySQL database.
 * Uses bcryptjs to compare the provided password with the stored hash.
 */
export async function authenticateUser(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
        const userFromDb = await getUserByEmail(email);

        if (!userFromDb) {
            return { success: false, error: 'Invalid email or password.' };
        }

        // Compare input password with hashed password from DB
        const passwordsMatch = await bcrypt.compare(password, userFromDb.password);

        if (!passwordsMatch) {
            return { success: false, error: 'Invalid email or password.' };
        }

        // Return user without sensitive password field
        const { password: _, ...userWithoutPassword } = userFromDb;
        return { 
            success: true, 
            user: userWithoutPassword as User 
        };
    } catch (error) {
        console.error('Auth Error:', error);
        return { success: false, error: 'An unexpected error occurred during login.' };
    }
}
