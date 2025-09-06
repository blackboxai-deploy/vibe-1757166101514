import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth';
import { validateEmail } from '@/lib/utils';
import { initializeDatabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Initialize database first
    await initializeDatabase();
    
    const { username, email, password, full_name, role } = await request.json();

    // Validation
    if (!username || !email || !password || !full_name) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (!['admin', 'teacher'].includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role' },
        { status: 400 }
      );
    }

    const user = await createUser({
      username,
      email,
      password,
      full_name,
      role
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User creation failed. Email or username may already exist.' },
        { status: 409 }
      );
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        full_name: user.full_name
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}