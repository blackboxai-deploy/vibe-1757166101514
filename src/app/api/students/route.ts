import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, initializeDatabase } from '@/lib/database';
import { validateEmail, validateStudentId } from '@/lib/utils';

export async function GET() {
  try {
    await initializeDatabase();
    
    const students = await executeQuery(`
      SELECT * FROM students 
      ORDER BY first_name, last_name
    `);

    return NextResponse.json({
      students,
      total: (students as any[]).length
    });
  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const {
      student_id,
      first_name,
      last_name,
      strand,
      year_level,
      section,
      email,
      phone
    } = await request.json();

    // Validation
    if (!student_id || !first_name || !last_name || !strand || !year_level || !section) {
      return NextResponse.json(
        { message: 'Student ID, name, strand, year level, and section are required' },
        { status: 400 }
      );
    }

    if (!validateStudentId(student_id)) {
      return NextResponse.json(
        { message: 'Invalid student ID format' },
        { status: 400 }
      );
    }

    if (email && !validateEmail(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    const validStrands = ['HUMSS', 'ABM', 'CSS', 'SMAW', 'AUTO', 'EIM'];
    if (!validStrands.includes(strand)) {
      return NextResponse.json(
        { message: 'Invalid strand' },
        { status: 400 }
      );
    }

    const result = await executeQuery(`
      INSERT INTO students (student_id, first_name, last_name, strand, year_level, section, email, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [student_id, first_name, last_name, strand, year_level, section, email || null, phone || null]);

    if ((result as any).insertId) {
      return NextResponse.json({
        message: 'Student added successfully',
        student_id: (result as any).insertId
      });
    } else {
      return NextResponse.json(
        { message: 'Failed to add student' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Add student error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { message: 'Student ID already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}