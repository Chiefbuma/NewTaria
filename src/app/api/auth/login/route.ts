import { NextResponse } from 'next/server';
import { users } from '@/lib/mock-data'; // Using mock data

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }
    
    // In a real app, you would query the database. Here we use mock data.
    const user = users.find(u => u.email === email);

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // In a real app, you'd compare a hashed password. Here, we'll just check a plain text password for demo purposes.
    if (password !== 'password') { // Using a simple mock password
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Don't send the password (even a mock one) to the client
    const { password: _, ...userToReturn } = user;

    return NextResponse.json(userToReturn);

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
