import { NextResponse } from 'next/server';
import { executeQuery, initializeDatabase } from '@/lib/database';

export async function GET() {
  try {
    // Initialize database first
    await initializeDatabase();
    
    // Get total students
    const [totalStudentsResult] = await executeQuery('SELECT COUNT(*) as count FROM students') as [{count: number}];
    const totalStudents = totalStudentsResult.count;
    
    // Get total teachers
    const [totalTeachersResult] = await executeQuery('SELECT COUNT(*) as count FROM teachers') as [{count: number}];
    const totalTeachers = totalTeachersResult.count;
    
    // Get strand counts
    const strandCounts = await executeQuery(`
      SELECT strand, COUNT(*) as count 
      FROM students 
      GROUP BY strand
    `) as {strand: string; count: number}[];
    
    const formattedStrandCounts = {
      HUMSS: 0,
      ABM: 0,
      CSS: 0,
      SMAW: 0,
      AUTO: 0,
      EIM: 0
    };
    
    strandCounts.forEach(item => {
      if (item.strand in formattedStrandCounts) {
        formattedStrandCounts[item.strand as keyof typeof formattedStrandCounts] = item.count;
      }
    });
    
    // Get today's attendance stats
    const today = new Date().toISOString().split('T')[0];
    const attendanceStats = await executeQuery(`
      SELECT status, COUNT(*) as count 
      FROM attendance 
      WHERE date = ? 
      GROUP BY status
    `, [today]) as {status: string; count: number}[];
    
    const todayAttendance = {
      present: 0,
      late: 0,
      absent: 0
    };
    
    attendanceStats.forEach(item => {
      if (item.status === 'Present') todayAttendance.present = item.count;
      if (item.status === 'Late') todayAttendance.late = item.count;
      if (item.status === 'Absent') todayAttendance.absent = item.count;
    });

    return NextResponse.json({
      totalStudents,
      totalTeachers,
      strandCounts: formattedStrandCounts,
      todayAttendance
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}