'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  ShieldOff,
  Trash2,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { AdminUser } from '@/types';

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'blocked'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  // const [showUserDetails, setShowUserDetails] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
      console.log('Fetching users from:', `${apiUrl}/api/admin/users`);
      
      const response = await fetch(`${apiUrl}/api/admin/users`, {
        credentials: 'include', // Use HTTP-only cookies instead of localStorage
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
          // Transform backend data to match frontend types
          const transformedUsers: AdminUser[] = data.data.users.map((user: AdminUser) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as 'ADMIN' | 'USER',
            provider: user.provider,
            lastLogin: user.lastLogin,
            totalConversions: user.totalConversions || 0,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            isBlocked: user.isBlocked || false,
          }));
          setUsers(transformedUsers);
        } else {
          console.error('API returned success: false', data.message);
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch users. Status:', response.status, 'Error:', errorText);
        
        if (response.status === 0) {
          console.error('Network error - Backend server might not be running');
        } else if (response.status === 401) {
          console.error('Unauthorized - User might not be authenticated or session expired');
        } else if (response.status === 403) {
          console.error('Forbidden - User might not have admin privileges');
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error - Backend server might not be running on port 3002');
      }
    } finally {
      setLoading(false);
    }
  };

  // const updateUserRole = async (userId: string, newRole: 'ADMIN' | 'USER') => {
  //   try {
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/admin/users/${userId}/role`, {
  //       method: 'PATCH',
  //       credentials: 'include', // Use HTTP-only cookies
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ role: newRole }),
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       if (data.success) {
  //         // Refresh users list
  //         fetchUsers();
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error updating user role:', error);
  //   }
  // };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && !user.isBlocked) ||
                         (filterStatus === 'blocked' && user.isBlocked);
    
    return matchesSearch && matchesFilter;
  });

  // Calculate pagination values
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedUsers([]); // Clear selection when changing pages
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handleBlockUser = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      // Prevent blocking admin users
      if (user.role === 'ADMIN' && !user.isBlocked) {
        alert('Cannot block admin users');
        return;
      }

      const newBlockStatus = !user.isBlocked;
      const action = newBlockStatus ? 'block' : 'unblock';
      
      if (!confirm(`Are you sure you want to ${action} ${user.name}?`)) {
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/admin/users/${userId}/block`, {
        method: 'PATCH',
        credentials: 'include', // Use HTTP-only cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isBlocked: newBlockStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update the user in the local state
          setUsers(users.map(u => 
            u.id === userId ? { ...u, isBlocked: newBlockStatus } : u
          ));
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      alert('Failed to update user status');
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleBulkAction = async (action: 'block' | 'unblock' | 'delete') => {
    if (selectedUsers.length === 0) return;

    if (action === 'delete') {
      if (confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) {
        // TODO: Implement bulk delete API endpoint
        setUsers(users.filter(user => !selectedUsers.includes(user.id)));
        setSelectedUsers([]);
      }
    } else {
      const shouldBlock = action === 'block';
      const actionText = shouldBlock ? 'block' : 'unblock';
      
      if (confirm(`Are you sure you want to ${actionText} ${selectedUsers.length} users?`)) {
        try {
          // Process each user individually
          const promises = selectedUsers.map(userId => 
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/admin/users/${userId}/block`, {
              method: 'PATCH',
              credentials: 'include', // Use HTTP-only cookies
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ isBlocked: shouldBlock }),
            })
          );

          const responses = await Promise.all(promises);
          const results = await Promise.all(responses.map(r => r.json()));

          // Check for any failures
          const failures = results.filter(r => !r.success);
          if (failures.length > 0) {
            alert(`Failed to ${actionText} ${failures.length} users. Some may have been admin users.`);
          }

          // Update local state for successful operations
          setUsers(users.map(user => 
            selectedUsers.includes(user.id) ? { ...user, isBlocked: shouldBlock } : user
          ));
          setSelectedUsers([]);
        } catch (error) {
          console.error(`Error during bulk ${actionText}:`, error);
          alert(`Failed to ${actionText} users`);
        }
      }
    }
  };

  const exportUsers = () => {
    const csvContent = [
      'Name,Email,Role,Signup Date,Last Login,Total Conversions,Status',
      ...filteredUsers.map(user => 
        `"${user.name}","${user.email}","${user.role}","${new Date(user.createdAt).toLocaleDateString()}","${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}","${user.totalConversions}","${user.isBlocked ? 'Blocked' : 'Active'}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .users-dropdown {
            max-width: calc(100vw - 2rem) !important;
            left: 0 !important;
            right: 0 !important;
            position: absolute !important;
            animation: slideDown 0.15s ease-out;
            border-radius: 0.5rem !important;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          }
          
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-4px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .users-dropdown button {
            min-height: 44px !important;
            display: flex !important;
            align-items: center !important;
            width: 100% !important;
            text-align: left !important;
          }
          
          .users-dropdown-container {
            overflow: visible !important;
          }
          
          @media screen and (max-width: 640px) {
            .users-dropdown {
              max-height: 40vh !important;
              overflow-y: auto !important;
              -webkit-overflow-scrolling: touch !important;
              left: -0.5rem !important;
              right: -0.5rem !important;
              max-width: calc(100vw - 1rem) !important;
            }
            
            .users-dropdown button {
              padding: 12px 16px !important;
              font-size: 16px !important;
              min-height: 48px !important;
            }
          }
          
          @media screen and (max-width: 480px) {
            .users-dropdown {
              left: -1rem !important;
              right: -1rem !important;
              max-width: calc(100vw - 0.5rem) !important;
            }
          }
        `
      }} />
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm sm:text-base text-gray-600">Manage user accounts and permissions</p>
        </div>
        <div className="flex flex-col xs:flex-row gap-2">
          <button
            onClick={exportUsers}
            className="flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Export
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
          />
        </div>
        {/* Custom Status Filter Dropdown */}
        <div className="relative overflow-visible users-dropdown-container" ref={statusDropdownRef}>
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="w-full sm:w-48 pl-10 pr-10 py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black cursor-pointer text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            style={{ fontSize: '16px' }}
          >
            <span className="truncate">
              {filterStatus === 'all' ? 'All Users' :
               filterStatus === 'active' ? 'Active' :
               filterStatus === 'blocked' ? 'Blocked' : 'All Users'}
            </span>
            <svg 
              className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${showStatusDropdown ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showStatusDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto users-dropdown">
              {[
                { value: 'all', label: 'All Users' },
                { value: 'active', label: 'Active' },
                { value: 'blocked', label: 'Blocked' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setFilterStatus(option.value as 'all' | 'active' | 'blocked');
                    setShowStatusDropdown(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm ${
                    filterStatus === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                  style={{ fontSize: '16px' }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="space-y-3">
            <div className="text-sm font-medium text-blue-900 text-center sm:text-left">
              {selectedUsers.length} user(s) selected
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                onClick={() => handleBulkAction('block')}
                className="px-3 py-2 text-xs font-medium text-orange-700 bg-orange-100 rounded hover:bg-orange-200"
              >
                Block Selected
              </button>
              <button
                onClick={() => handleBulkAction('unblock')}
                className="px-3 py-2 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
              >
                Unblock Selected
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-2 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table - Desktop View */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    checked={currentUsers.length > 0 && currentUsers.every(user => selectedUsers.includes(user.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        // Select all users on current page
                        const newSelectedUsers = [...selectedUsers];
                        currentUsers.forEach(user => {
                          if (!newSelectedUsers.includes(user.id)) {
                            newSelectedUsers.push(user.id);
                          }
                        });
                        setSelectedUsers(newSelectedUsers);
                      } else {
                        // Deselect all users on current page
                        setSelectedUsers(selectedUsers.filter(id => !currentUsers.some(user => user.id === id)));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Signup Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'ADMIN' && <Shield className="w-3 h-3 mr-1" />}
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.totalConversions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isBlocked 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          // TODO: Implement user details modal
                          console.log('View user details for:', user.id);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleBlockUser(user.id)}
                          className={`p-1 rounded ${
                            user.isBlocked 
                              ? 'text-gray-400 hover:text-green-600' 
                              : 'text-gray-400 hover:text-orange-600'
                          }`}
                          title={user.isBlocked ? 'Unblock User' : 'Block User'}
                        >
                          {user.isBlocked ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {currentUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {filteredUsers.length === 0 
                ? "No users found matching your criteria" 
                : "No users on this page"}
            </p>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {currentUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            {/* Header with checkbox, avatar, name, and actions */}
            <div className="flex items-center justify-between mb-3 max-w-md mx-auto">
              <div className="flex items-center space-x-2 w-full">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers([...selectedUsers, user.id]);
                    } else {
                      setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                  <div className="text-xs text-gray-500 truncate">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    // TODO: Implement user details modal
                    console.log('View user details for:', user.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {user.role !== 'ADMIN' && (
                  <button
                    onClick={() => handleBlockUser(user.id)}
                    className={`p-1.5 rounded ${
                      user.isBlocked 
                        ? 'text-gray-400 hover:text-green-600' 
                        : 'text-gray-400 hover:text-orange-600'
                    }`}
                    title={user.isBlocked ? 'Unblock User' : 'Block User'}
                  >
                    {user.isBlocked ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                  </button>
                )}
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                  title="Delete User"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* User details - stacked vertically for mobile */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Role:</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  user.role === 'ADMIN' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.role === 'ADMIN' && <Shield className="w-3 h-3 mr-1" />}
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status:</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  user.isBlocked 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {user.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Conversions:</span>
                <span className="font-medium">{user.totalConversions.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Last Login:</span>
                <span>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</span>
              </div>
            </div>
          </div>
        ))}

        {currentUsers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">
              {filteredUsers.length === 0 
                ? "No users found matching your criteria" 
                : "No users on this page"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
            Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
          </div>
          <div className="flex items-center justify-center sm:justify-end">
            <div className="flex items-center space-x-1">
              <button 
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium border rounded-md ${
                  currentPage === 1
                    ? 'text-gray-300 bg-gray-100 border-gray-200 cursor-not-allowed'
                    : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>
              
              {/* Page numbers - simplified for mobile */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (totalPages <= 5) {
                    // Show all pages if 5 or fewer
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium border rounded-md ${
                          page === currentPage
                            ? 'text-white bg-blue-600 border-blue-600'
                            : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else {
                    // Show first, last, current, and nearby pages with ellipsis
                    const showPage = 
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1);
                    
                    if (showPage) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium border rounded-md ${
                            page === currentPage
                              ? 'text-white bg-blue-600 border-blue-600'
                              : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-1 sm:px-2 py-2 text-xs sm:text-sm text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                })}
              </div>
              
              <button 
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium border rounded-md ${
                  currentPage === totalPages
                    ? 'text-gray-300 bg-gray-100 border-gray-200 cursor-not-allowed'
                    : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
