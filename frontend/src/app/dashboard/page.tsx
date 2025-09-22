'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/AdminLayout';
import UserManagement from '@/components/UserManagement';
import FileManagement from '@/components/FileManagement';
import Statistics from '@/components/Statistics';
import SystemLogs from '@/components/SystemLogs';
import AdminSettings from '@/components/AdminSettings';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'files' | 'stats' | 'logs' | 'settings'>('users');
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const handleTabChange = useCallback((tab: 'users' | 'files' | 'stats' | 'logs' | 'settings') => {
    setActiveTab(tab);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      if (user?.role !== 'ADMIN') {
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show access denied if not authenticated or not admin
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don&apos;t have permission to access the admin dashboard.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-[#2b3d98] text-white px-6 py-2 rounded-lg hover:bg-[#243485] transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const renderAdminContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'files':
        return <FileManagement />;
      case 'stats':
        return <Statistics />;
      case 'logs':
        return <SystemLogs />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      adminName={user.name}
    >
      {renderAdminContent()}
    </AdminLayout>
  );
}
