'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  strandCounts: {
    HUMSS: number;
    ABM: number;
    CSS: number;
    SMAW: number;
    AUTO: number;
    EIM: number;
  };
  todayAttendance: {
    present: number;
    late: number;
    absent: number;
  };
}

const STRAND_COLORS = {
  HUMSS: 'stats-card-maroon',
  ABM: 'stats-card-blue',
  CSS: 'stats-card-green',
  SMAW: 'stats-card-purple',
  AUTO: 'stats-card-orange',
  EIM: 'stats-card-gold'
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardStats();
    
    // Listen for global search events
    const handleGlobalSearch = (event: CustomEvent) => {
      const query = event.detail.query;
      if (query.trim()) {
        performGlobalSearch(query);
      } else {
        setSearchResults([]);
      }
    };

    window.addEventListener('globalSearch', handleGlobalSearch as EventListener);
    
    return () => {
      window.removeEventListener('globalSearch', handleGlobalSearch as EventListener);
    };
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const performGlobalSearch = async (query: string) => {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-maroon to-maroon-dark rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Dashboard</h1>
            <p className="text-maroon/80 text-lg">
              QR Code Attendance System - {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}</div>
            <div className="text-sm opacity-80">Current Time</div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card className="border-maroon/20">
          <CardHeader>
            <CardTitle className="text-maroon">Search Results</CardTitle>
            <CardDescription>
              Found {searchResults.length} result(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchResults.map((result, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {result.type === 'student' ? '👥 Student: ' : '👨‍🏫 Teacher: '}
                        {result.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {result.type === 'student' ? `Strand: ${result.strand}` : `Position: ${result.position}`}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                      {result.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <Card className="stats-card stats-card-maroon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Total Students
            </CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {stats?.totalStudents || 0}
            </div>
            <p className="text-xs text-white/80">
              Registered students
            </p>
          </CardContent>
        </Card>

        {/* Total Teachers */}
        <Card className="stats-card stats-card-blue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Total Teachers
            </CardTitle>
            <span className="text-2xl">👨‍🏫</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {stats?.totalTeachers || 0}
            </div>
            <p className="text-xs text-white/80">
              Active teachers
            </p>
          </CardContent>
        </Card>

        {/* Present Today */}
        <Card className="stats-card stats-card-green">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Present Today
            </CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {stats?.todayAttendance.present || 0}
            </div>
            <p className="text-xs text-white/80">
              Students present
            </p>
          </CardContent>
        </Card>

        {/* Late Today */}
        <Card className="stats-card stats-card-orange">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Late Today
            </CardTitle>
            <span className="text-2xl">⚠️</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {stats?.todayAttendance.late || 0}
            </div>
            <p className="text-xs text-white/80">
              Students late
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Strand Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-maroon">Students by Strand</CardTitle>
          <CardDescription>
            Distribution of students across different academic strands
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats?.strandCounts || {}).map(([strand, count]) => (
              <div key={strand} className={`stats-card ${STRAND_COLORS[strand as keyof typeof STRAND_COLORS]}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{strand}</h3>
                    <p className="text-2xl font-bold text-white">{count}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-white/80">students</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-maroon">Today's Attendance Summary</CardTitle>
            <CardDescription>
              Real-time attendance status for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-green-600 text-xl">✅</span>
                  <span className="font-medium text-gray-900">Present</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {stats?.todayAttendance.present || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-orange-600 text-xl">⚠️</span>
                  <span className="font-medium text-gray-900">Late</span>
                </div>
                <span className="text-2xl font-bold text-orange-600">
                  {stats?.todayAttendance.late || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-red-600 text-xl">❌</span>
                  <span className="font-medium text-gray-900">Absent</span>
                </div>
                <span className="text-2xl font-bold text-red-600">
                  {stats?.todayAttendance.absent || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-maroon">Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-maroon/10 hover:bg-maroon/20 rounded-lg transition-colors text-center">
                <span className="block text-2xl mb-2">📋</span>
                <span className="text-sm font-medium text-maroon">Add Attendance</span>
              </button>
              
              <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center">
                <span className="block text-2xl mb-2">👥</span>
                <span className="text-sm font-medium text-blue-600">Add Student</span>
              </button>
              
              <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center">
                <span className="block text-2xl mb-2">📱</span>
                <span className="text-sm font-medium text-green-600">Generate QR</span>
              </button>
              
              <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center">
                <span className="block text-2xl mb-2">📷</span>
                <span className="text-sm font-medium text-purple-600">Start Scanner</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}