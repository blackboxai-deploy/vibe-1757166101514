import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { executeQuery } from './database';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'teacher';
  full_name: string;
}

interface JWTPayload {
  userId: number;
  username: string;
  email: string;
  role: 'admin' | 'teacher';
  full_name: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    full_name: user.full_name
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    // Fetch fresh user data from database
    const users = await executeQuery(
      'SELECT id, username, email, role, full_name FROM users WHERE id = ?',
      [payload.userId]
    ) as User[];

    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const users = await executeQuery(
      'SELECT id, username, email, password, role, full_name FROM users WHERE email = ?',
      [email]
    ) as (User & { password: string })[];

    if (users.length === 0) {
      return null;
    }

    const user = users[0];
    const isValid = await verifyPassword(password, user.password);
    
    if (!isValid) {
      return null;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function createUser(userData: {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher';
  full_name: string;
}): Promise<User | null> {
  try {
    const hashedPassword = await hashPassword(userData.password);
    
    const result = await executeQuery(
      `INSERT INTO users (username, email, password, role, full_name) 
       VALUES (?, ?, ?, ?, ?)`,
      [userData.username, userData.email, hashedPassword, userData.role, userData.full_name]
    ) as any;

    if (result.insertId) {
      const users = await executeQuery(
        'SELECT id, username, email, role, full_name FROM users WHERE id = ?',
        [result.insertId]
      ) as User[];
      
      return users.length > 0 ? users[0] : null;
    }
    
    return null;
  } catch (error) {
    console.error('Create user error:', error);
    return null;
  }
}

export function setAuthCookie(token: string) {
  const cookieStore = cookies();
  (cookieStore as any).set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });
}

export function clearAuthCookie() {
  const cookieStore = cookies();
  (cookieStore as any).set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });
}