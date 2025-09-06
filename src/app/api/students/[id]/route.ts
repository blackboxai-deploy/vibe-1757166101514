import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, initializeDatabase } from '@/lib/database';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initializeDatabase();
    
    const studentId = parseInt(params.id);
    
    if (isNaN(studentId)) {
      return NextResponse.json(
        { message: 'Invalid student ID' },
        { status: 400 }
      );
    }

    // Check if student exists
    const students = await executeQuery('SELECT id FROM students WHERE id = ?', [studentId]);
    
    if ((students as any[]).length === 0) {
      return NextResponse.json(
        { message: 'Student not found' },
        { status: 404 }
      );
    }

    // Delete related records first (due to foreign key constraints)
    await executeQuery('DELETE FROM attendance WHERE student_id = ?', [studentId]);
    await executeQuery('DELETE FROM qr_codes WHERE student_id = ?', [studentId]);
    await executeQuery('DELETE FROM face_recognition WHERE student_id = ?', [studentId]);
    
    // Delete the student
    await executeQuery('DELETE FROM students WHERE id = ?', [studentId]);

    return NextResponse.json({
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}