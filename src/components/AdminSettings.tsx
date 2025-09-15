'use client';

import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff,
  Settings,
  HardDrive,
  FileType,
  Key,
  Shield,
  Users,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Edit2
} from 'lucide-react';
import { AdminSettings } from '@/types';

export default function AdminSettingsComponent() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'file' | 'api' | 'admin' | 'system'>('file');
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [editingApiKey, setEditingApiKey] = useState<string | null>(null);
  const [newApiKey, setNewApiKey] = useState({ name: '', key: '', service: '' });
  const [newAdmin, setNewAdmin] = useState({ email: '', name: '', permissions: [] as string[] });

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockSettings: AdminSettings = {
      fileSize: {
        maxSizeMB: 50,
        maxSizeBytes: 52428800
      },
      supportedFileTypes: ['.docx', '.xlsx', '.pptx', '.pdf', '.jpg', '.png', '.txt'],
      apiKeys: [
        {
          name: 'LibreOffice Conversion Service',
          key: 'sk-1234567890abcdef',
          service: 'libreoffice',
          isActive: true
        },
        {
          name: 'AWS S3 Storage',
          key: 'AKIAIOSFODNN7EXAMPLE',
          service: 'aws-s3',
          isActive: true
        },
        {
          name: 'SendGrid Email Service',
          key: 'SG.1234567890abcdef',
          service: 'sendgrid',
          isActive: false
        }
      ],
      adminAccounts: [
        {
          id: '1',
          email: 'admin@example.com',
          name: 'Super Admin',
          permissions: ['all'],
          lastLogin: new Date('2024-01-21T10:30:00')
        },
        {
          id: '2',
          email: 'support@example.com',
          name: 'Support Manager',
          permissions: ['users', 'files', 'logs'],
          lastLogin: new Date('2024-01-20T14:15:00')
        }
      ],
      systemSettings: {
        maxConcurrentConversions: 10,
        retentionDays: 30,
        maintenanceMode: false
      }
    };

    setTimeout(() => {
      setSettings(mockSettings);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully!');
    }, 1500);
  };

  const handleAddApiKey = () => {
    if (!settings || !newApiKey.name || !newApiKey.key || !newApiKey.service) return;

    const updatedSettings = {
      ...settings,
      apiKeys: [
        ...settings.apiKeys,
        {
          ...newApiKey,
          isActive: true
        }
      ]
    };
    
    setSettings(updatedSettings);
    setNewApiKey({ name: '', key: '', service: '' });
  };

  const handleDeleteApiKey = (index: number) => {
    if (!settings) return;
    
    if (confirm('Are you sure you want to delete this API key?')) {
      const updatedSettings = {
        ...settings,
        apiKeys: settings.apiKeys.filter((_, i) => i !== index)
      };
      setSettings(updatedSettings);
    }
  };

  const handleToggleApiKey = (index: number) => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      apiKeys: settings.apiKeys.map((key, i) => 
        i === index ? { ...key, isActive: !key.isActive } : key
      )
    };
    setSettings(updatedSettings);
  };

  const handleAddAdmin = () => {
    if (!settings || !newAdmin.email || !newAdmin.name) return;

    const updatedSettings = {
      ...settings,
      adminAccounts: [
        ...settings.adminAccounts,
        {
          id: Date.now().toString(),
          ...newAdmin,
          permissions: newAdmin.permissions.length > 0 ? newAdmin.permissions : ['users', 'files']
        }
      ]
    };
    
    setSettings(updatedSettings);
    setNewAdmin({ email: '', name: '', permissions: [] });
  };

  const handleDeleteAdmin = (adminId: string) => {
    if (!settings) return;
    
    if (confirm('Are you sure you want to delete this admin account?')) {
      const updatedSettings = {
        ...settings,
        adminAccounts: settings.adminAccounts.filter(admin => admin.id !== adminId)
      };
      setSettings(updatedSettings);
    }
  };

  const handleFileTypeChange = (fileType: string, checked: boolean) => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      supportedFileTypes: checked
        ? [...settings.supportedFileTypes, fileType]
        : settings.supportedFileTypes.filter(type => type !== fileType)
    };
    setSettings(updatedSettings);
  };

  const tabs = [
    { id: 'file', name: 'File Settings', icon: FileType },
    { id: 'api', name: 'API Keys', icon: Key },
    { id: 'admin', name: 'Admin Accounts', icon: Shield },
    { id: 'system', name: 'System', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600">Configure system settings and preferences</p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-600-hover disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {activeTab === 'file' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HardDrive className="w-5 h-5 mr-2" />
                File Upload Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum File Size (MB)
                  </label>
                  <input
                    type="number"
                    value={settings.fileSize.maxSizeMB}
                    onChange={(e) => setSettings({
                      ...settings,
                      fileSize: {
                        ...settings.fileSize,
                        maxSizeMB: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {settings.fileSize.maxSizeMB} MB
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Supported File Types</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['.docx', '.xlsx', '.pptx', '.pdf', '.jpg', '.png', '.txt', '.csv', '.rtf', '.odt'].map((fileType) => (
                  <label key={fileType} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.supportedFileTypes.includes(fileType)}
                      onChange={(e) => handleFileTypeChange(fileType, e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">{fileType}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Key className="w-5 h-5 mr-2" />
                API Keys Management
              </h3>
              
              <div className="space-y-4">
                {settings.apiKeys.map((apiKey, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900">{apiKey.name}</h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            apiKey.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {apiKey.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Service: {apiKey.service}</p>
                        <div className="flex items-center mt-2">
                          <span className="text-sm text-gray-700 mr-2">Key:</span>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {showApiKey[index] ? apiKey.key : '••••••••••••••••'}
                          </code>
                          <button
                            onClick={() => setShowApiKey({
                              ...showApiKey,
                              [index]: !showApiKey[index]
                            })}
                            className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                          >
                            {showApiKey[index] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleApiKey(index)}
                          className={`px-3 py-1 text-xs font-medium rounded ${
                            apiKey.isActive
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {apiKey.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteApiKey(index)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New API Key */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Add New API Key</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Service name"
                    value={newApiKey.name}
                    onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Service type"
                    value={newApiKey.service}
                    onChange={(e) => setNewApiKey({ ...newApiKey, service: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <input
                    type="password"
                    placeholder="API Key"
                    value={newApiKey.key}
                    onChange={(e) => setNewApiKey({ ...newApiKey, key: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleAddApiKey}
                  className="mt-3 flex items-center px-4 py-2 text-sm font-medium text-primary bg-primary-600/5 rounded-lg hover:bg-primary-600/10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add API Key
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Administrator Accounts
              </h3>
              
              <div className="space-y-4">
                {settings.adminAccounts.map((admin) => (
                  <div key={admin.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900">{admin.name}</h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-600/10 text-primary">
                            Administrator
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{admin.email}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <div>
                            <span className="text-sm text-gray-700">Permissions:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {admin.permissions.map((permission) => (
                                <span
                                  key={permission}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {permission}
                                </span>
                              ))}
                            </div>
                          </div>
                          {admin.lastLogin && (
                            <div>
                              <span className="text-sm text-gray-700">Last Login:</span>
                              <p className="text-sm text-gray-500">
                                {admin.lastLogin.toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAdmin(admin.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Admin */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Add New Administrator</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="flex flex-wrap gap-2">
                    {['users', 'files', 'stats', 'logs', 'settings', 'all'].map((permission) => (
                      <label key={permission} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newAdmin.permissions.includes(permission)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewAdmin({
                                ...newAdmin,
                                permissions: [...newAdmin.permissions, permission]
                              });
                            } else {
                              setNewAdmin({
                                ...newAdmin,
                                permissions: newAdmin.permissions.filter(p => p !== permission)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-gray-700">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleAddAdmin}
                  className="flex items-center px-4 py-2 text-sm font-medium text-primary bg-primary-600/5 rounded-lg hover:bg-primary-600/10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Administrator
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                System Configuration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Concurrent Conversions
                  </label>
                  <input
                    type="number"
                    value={settings.systemSettings.maxConcurrentConversions}
                    onChange={(e) => setSettings({
                      ...settings,
                      systemSettings: {
                        ...settings.systemSettings,
                        maxConcurrentConversions: parseInt(e.target.value) || 1
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of files that can be processed simultaneously
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Retention (Days)
                  </label>
                  <input
                    type="number"
                    value={settings.systemSettings.retentionDays}
                    onChange={(e) => setSettings({
                      ...settings,
                      systemSettings: {
                        ...settings.systemSettings,
                        retentionDays: parseInt(e.target.value) || 1
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How long to keep converted files before deletion
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
                    <p className="text-sm text-gray-500">
                      Temporarily disable file conversions for maintenance
                    </p>
                  </div>
                  <button
                    onClick={() => setSettings({
                      ...settings,
                      systemSettings: {
                        ...settings.systemSettings,
                        maintenanceMode: !settings.systemSettings.maintenanceMode
                      }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.systemSettings.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.systemSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {settings.systemSettings.maintenanceMode && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      <span className="text-sm font-medium text-red-800">
                        Maintenance mode is active - file conversions are disabled
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
