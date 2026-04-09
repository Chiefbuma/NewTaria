import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { authorizeAdminApiRequest } from '@/lib/auth';
import { createUser, deleteUser, fetchUsers, getUserByEmail, getUserByPhone, updateUser } from '@/lib/data';

/**
 * API Route to fetch system users for messaging contact lists.
 */
export async function GET() {
    try {
        const authResult = await authorizeAdminApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        const users = await fetchUsers();
        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authResult = await authorizeAdminApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        const body = await req.json();

        if (!body.name || !body.phone || !body.email || !body.password) {
            return NextResponse.json({ error: 'Name, phone number, email, and initial password are required.' }, { status: 400 });
        }

        if (String(body.password).length < 8) {
            return NextResponse.json({ error: 'Initial password must be at least 8 characters.' }, { status: 400 });
        }

        const existingUser = await getUserByEmail(body.email);
        if (existingUser) {
            return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 400 });
        }

        const existingPhoneUser = await getUserByPhone(body.phone);
        if (existingPhoneUser) {
            return NextResponse.json({ error: 'A user with this phone number already exists.' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(body.password, 10);
        const userId = await createUser({
            ...body,
            password: hashedPassword,
            must_change_password: true,
            password_changed_at: null,
        });

        const users = await fetchUsers();
        const createdUser = users.find((user) => user.id === userId);

        return NextResponse.json(createdUser, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const authResult = await authorizeAdminApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        const body = await req.json();

        if (!body.id || !body.name || !body.phone || !body.email) {
            return NextResponse.json({ error: 'ID, name, phone number, and email are required.' }, { status: 400 });
        }

        const existingUser = await getUserByEmail(body.email);
        if (existingUser && existingUser.id !== body.id) {
            return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 400 });
        }

        const existingPhoneUser = await getUserByPhone(body.phone);
        if (existingPhoneUser && existingPhoneUser.id !== body.id) {
            return NextResponse.json({ error: 'A user with this phone number already exists.' }, { status: 400 });
        }

        await updateUser(Number(body.id), body);
        const users = await fetchUsers();
        const updatedUser = users.find((user) => user.id === Number(body.id));
        return NextResponse.json(updatedUser);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    try {
        const authResult = await authorizeAdminApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        await deleteUser(Number(id));
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
