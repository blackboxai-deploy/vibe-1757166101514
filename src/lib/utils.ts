import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// CSV utility functions
export function parseCSV(csvText: string): any[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(header => header.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => value.trim());
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    data.push(row);
  }
  
  return data;
}

export function arrayToCSV(data: any[], headers?: string[]): string {
  if (!data.length) return '';
  
  const csvHeaders = headers || Object.keys(data[0]);
  const csvRows = data.map(row => 
    csvHeaders.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap in quotes if contains comma or quote
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  
  return [csvHeaders.join(','), ...csvRows].join('\n');
}

// Date formatting utilities
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatTime(time: string): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function formatDateTime(datetime: Date | string): string {
  const d = new Date(datetime);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Search and filter utilities
export function filterBySearch<T>(items: T[], searchTerm: string, searchFields: string[]): T[] {
  if (!searchTerm.trim()) return items;
  
  const term = searchTerm.toLowerCase();
  
  return items.filter(item =>
    searchFields.some(field => {
      const value = (item as any)[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(term);
      }
      return false;
    })
  );
}

// QR Code utilities
export function generateQRCodeData(studentId: number, studentData: any): string {
  return JSON.stringify({
    studentId,
    name: `${studentData.first_name} ${studentData.last_name}`,
    strand: studentData.strand,
    timestamp: new Date().toISOString()
  });
}

// Attendance status utilities
export function getAttendanceStatus(timeIn: string | null, lateThreshold: string = '08:30'): string {
  if (!timeIn) return 'Absent';
  
  const [lateHour, lateMinute] = lateThreshold.split(':').map(Number);
  const [timeHour, timeMinute] = timeIn.split(':').map(Number);
  
  const lateTime = lateHour * 60 + lateMinute;
  const actualTime = timeHour * 60 + timeMinute;
  
  return actualTime > lateTime ? 'Late' : 'Present';
}

// Validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateStudentId(studentId: string): boolean {
  return /^[A-Za-z0-9-]+$/.test(studentId) && studentId.length >= 5 && studentId.length <= 20;
}

// File upload utilities
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Notification utilities
export function createNotification(type: 'success' | 'error' | 'warning' | 'info', message: string) {
  return {
    id: Date.now(),
    type,
    message,
    timestamp: new Date().toISOString()
  };
}

// Statistics utilities
export function calculateAttendanceStats(attendanceRecords: any[]) {
  const total = attendanceRecords.length;
  const present = attendanceRecords.filter(record => record.status === 'Present').length;
  const late = attendanceRecords.filter(record => record.status === 'Late').length;
  const absent = attendanceRecords.filter(record => record.status === 'Absent').length;
  
  return {
    total,
    present,
    late,
    absent,
    presentPercentage: total > 0 ? Math.round((present / total) * 100) : 0,
    latePercentage: total > 0 ? Math.round((late / total) * 100) : 0,
    absentPercentage: total > 0 ? Math.round((absent / total) * 100) : 0
  };
}
