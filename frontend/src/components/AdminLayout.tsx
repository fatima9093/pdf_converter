'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  AlertCircle,
  Shield,
  Home
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: 'users' | 'files' | 'stats' | 'logs' | 'settings';
  onTabChange: (tab: 'users' | 'files' | 'stats' | 'logs' | 'settings') => void;
  adminName?: string;
}

export default function AdminLayout({ 
  children, 
  activeTab, 
  onTabChange, 
  adminName = 'Admin User' 
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const menuItems = [
    {
      id: 'users' as const,
      name: 'Users',
      icon: Users,
      description: 'Manage user accounts'
    },
    {
      id: 'files' as const,
      name: 'Files',
      icon: FileText,
      description: 'View and manage files'
    },
    {
      id: 'stats' as const,
      name: 'Statistics',
      icon: BarChart3,
      description: 'View analytics and reports'
    },
    {
      id: 'logs' as const,
      name: 'System Logs',
      icon: AlertCircle,
      description: 'Monitor system activity'
    },
    {
      id: 'settings' as const,
      name: 'Settings',
      icon: Settings,
      description: 'Configure system settings'
    }
  ];

  const handleLogout = () => {
    // Implement logout logic
    window.location.href = '/login';
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static lg:inset-0`}
        style={{ minWidth: '16rem', maxWidth: '16rem' }} // w-64 = 16rem, keep fixed width
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-500">PDF Converter</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    // Only close sidebar on mobile
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-[#2b3d98]/10 text-[#2b3d98] border-r-2 border-[#2b3d98]'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  style={{ minWidth: '100%' }} // Prevent width shrink
                >
                  <Icon className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-[#2b3d98]' : 'text-gray-400'
                  }`} />
                  <div className="text-left">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {adminName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{adminName}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <button
                onClick={handleGoHome}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                title="Go to Main Page"
              >
                <Home className="w-4 h-4" />
              </button>
            </div>
            
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-900">{adminName}</span>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
          </div>
        </header>

        {/* Desktop Top Bar */}
        <header className="hidden lg:block bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoHome}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                title="Go to Main Page"
              >
                <Home className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {menuItems.find(item => item.id === activeTab)?.name || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-500">
                  {menuItems.find(item => item.id === activeTab)?.description || 'Manage your system'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {adminName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{adminName}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
