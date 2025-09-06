import { NextResponse } from 'next/server';
import { executeQuery, initializeDatabase } from '@/lib/database';

export async function DELETE() {
  try {
    await initializeDatabase();
    
    // Delete all related records first (due to foreign key constraints)
    await executeQuery('DELETE FROM attendance WHERE student_id IN (SELECT id FROM students)');
    await executeQuery('DELETE FROM qr_codes WHERE student_id IN (SELECT id FROM students)');
    await executeQuery('DELETE FROM face_recognition WHERE student_id IN (SELECT id FROM students)');
    
    // Then delete all students
    await executeQuery('DELETE FROM students');

    return NextResponse.json({
      message: 'All students cleared successfully'
    });
  } catch (error) {
    console.error('Clear students error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}