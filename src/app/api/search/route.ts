import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, initializeDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Initialize database first
    await initializeDatabase();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        results: [],
        message: 'Query must be at least 2 characters long'
      });
    }
    
    const searchTerm = `%${query.trim()}%`;
    const results: any[] = [];
    
    // Search students
    const students = await executeQuery(`
      SELECT 
        id,
        CONCAT(first_name, ' ', last_name) as name,
        strand,
        'student' as type
      FROM students 
      WHERE 
        first_name LIKE ? OR 
        last_name LIKE ? OR 
        CONCAT(first_name, ' ', last_name) LIKE ? OR
        strand LIKE ?
      LIMIT 10
    `, [searchTerm, searchTerm, searchTerm, searchTerm]) as any[];
    
    results.push(...students);
    
    // Search teachers
    const teachers = await executeQuery(`
      SELECT 
        id,
        CONCAT(first_name, ' ', last_name) as name,
        position,
        'teacher' as type
      FROM teachers 
      WHERE 
        first_name LIKE ? OR 
        last_name LIKE ? OR 
        CONCAT(first_name, ' ', last_name) LIKE ? OR
        position LIKE ?
      LIMIT 10
    `, [searchTerm, searchTerm, searchTerm, searchTerm]) as any[];
    
    results.push(...teachers);
    
    // Sort results by relevance (exact matches first)
    results.sort((a, b) => {
      const aExact = a.name.toLowerCase().includes(query.toLowerCase());
      const bExact = b.name.toLowerCase().includes(query.toLowerCase());
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      results: results.slice(0, 20), // Limit to 20 results
      total: results.length,
      query
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}