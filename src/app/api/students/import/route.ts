import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, initializeDatabase } from '@/lib/database';
import { validateEmail, validateStudentId, parseCSV } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const { csvContent } = await request.json();
    
    if (!csvContent) {
      return NextResponse.json(
        { message: 'CSV content is required' },
        { status: 400 }
      );
    }

    const data = parseCSV(csvContent);
    
    if (data.length === 0) {
      return NextResponse.json(
        { message: 'No valid data found in CSV' },
        { status: 400 }
      );
    }

    let imported = 0;
    let errors: string[] = [];
    const validStrands = ['HUMSS', 'ABM', 'CSS', 'SMAW', 'AUTO', 'EIM'];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2; // +2 because of header and 0-based index
      
      try {
        // Map common CSV header variations
        const student_id = row['Student ID'] || row['student_id'] || row['ID'] || row['id'];
        const first_name = row['First Name'] || row['first_name'] || row['FirstName'] || row['Name'];
        const last_name = row['Last Name'] || row['last_name'] || row['LastName'] || row['Surname'];
        const strand = (row['Strand'] || row['strand'])?.toUpperCase();
        const year_level = row['Year Level'] || row['year_level'] || row['Grade'] || row['grade'];
        const section = row['Section'] || row['section'];
        const email = row['Email'] || row['email'];
        const phone = row['Phone'] || row['phone'] || row['Contact'] || row['contact'];

        // Validation
        if (!student_id || !first_name || !last_name || !strand || !year_level || !section) {
          errors.push(`Row ${rowNum}: Missing required fields`);
          continue;
        }

        if (!validateStudentId(student_id)) {
          errors.push(`Row ${rowNum}: Invalid student ID format`);
          continue;
        }

        if (!validStrands.includes(strand)) {
          errors.push(`Row ${rowNum}: Invalid strand '${strand}'. Must be one of: ${validStrands.join(', ')}`);
          continue;
        }

        if (email && !validateEmail(email)) {
          errors.push(`Row ${rowNum}: Invalid email format`);
          continue;
        }

        await executeQuery(`
          INSERT INTO students (student_id, first_name, last_name, strand, year_level, section, email, phone)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [student_id, first_name, last_name, strand, year_level, section, email || null, phone || null]);

        imported++;
      } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
          errors.push(`Row ${rowNum}: Student ID '${row['Student ID'] || row['student_id']}' already exists`);
        } else {
          errors.push(`Row ${rowNum}: Database error - ${error.message}`);
        }
      }
    }

    return NextResponse.json({
      message: `Import completed. ${imported} students imported successfully.`,
      imported,
      total: data.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : [], // Limit error messages
      hasMoreErrors: errors.length > 10
    });
  } catch (error) {
    console.error('Import students error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}