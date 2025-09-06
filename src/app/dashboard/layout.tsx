'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Navigation items
const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '📊'
  },
  {
    name: 'Attendance',
    href: '/dashboard/attendance',
    icon: '📋'
  },
  {
    name: 'Students',
    href: '/dashboard/students',
    icon: '👥'
  },
  {
    name: 'Teachers',
    href: '/dashboard/teachers',
    icon: '👨‍🏫'
  },
  {
    name: 'QR Generator',
    href: '/dashboard/qr-generator',
    icon: '📱'
  },
  {
    name: 'Scanner',
    href: '/dashboard/scanner',
    icon: '📷'
  },
  {
    name: 'Admin',
    href: '/dashboard/admin',
    icon: '⚙️'
  }
];

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'teacher';
  full_name: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      router.push('/');
    }
  };

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Signed out successfully');
        router.push('/');
      } else {
        toast.error('Failed to sign out');
      }
    } catch (error) {
      toast.error('An error occurred during sign out');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Emit search event for child components to listen to
    window.dispatchEvent(new CustomEvent('globalSearch', {
      detail: { query: searchQuery }
    }));
    toast.info(`Searching for: ${searchQuery}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-maroon hover:bg-maroon-dark text-white"
          size="sm"
        >
          ☰
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Logo */}
        <div className="flex items-center justify-center h-16 bg-maroon">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-maroon font-bold text-sm">QR</span>
            </div>
            <h1 className="text-white font-bold text-lg">Attendance</h1>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-maroon/10 rounded-full flex items-center justify-center">
              <span className="text-maroon font-semibold text-sm">
                {user.full_name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.full_name}</p>
              <p className="text-sm text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const isAdmin = user.role === 'admin';
            
            // Hide admin section for non-admin users
            if (item.name === 'Admin' && !isAdmin) {
              return null;
            }

            return (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.href);
                  setIsSidebarOpen(false);
                }}
                className={`w-full text-left nav-link mb-1 ${isActive ? 'active' : ''}`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Sign out button */}
        <div className="absolute bottom-4 left-0 right-0 px-3">
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            <span className="mr-2">🚪</span>
            Sign Out
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900 ml-12 lg:ml-0">
                {navigationItems.find(item => item.href === pathname)?.name || 'Dashboard'}
              </h2>
            </div>
            
            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search students, teachers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 form-input"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </span>
              </div>
              <Button 
                type="submit"
                className="btn-maroon"
                disabled={!searchQuery.trim()}
              >
                Search
              </Button>
            </form>
          </div>
        </div>

        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}