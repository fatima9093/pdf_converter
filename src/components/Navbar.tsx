'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { Menu, X, FileText, User, LogIn, UserPlus, ChevronDown, Sun, Moon, Scissors, Merge, Archive, FileImage, FileSpreadsheet, Presentation, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useModal } from '@/contexts/ModalContext';
import { getToolByUrl, shouldOpenModal } from '@/lib/toolMapping';
import UserAvatar from '@/components/UserAvatar';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const { openModal } = useModal();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleToolClick = (url: string, e: React.MouseEvent) => {
    if (shouldOpenModal(url)) {
      e.preventDefault();
      const tool = getToolByUrl(url);
      if (tool) {
        openModal(tool);
        setActiveDropdown(null);
        setIsMenuOpen(false);
      }
    }
  };

  // Handle dropdown clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/sIMPLEPDF_TOOL.PNG" 
                alt="Simple PDF Tool" 
                width={240} 
                height={60}
                className="h-14 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8" ref={dropdownRef}>
            {/* Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('tools')}
                className="text-gray-700 hover:text-[#2b3d98] transition-colors duration-200 flex items-center space-x-1"
              >
                <span>Tools</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {activeDropdown === 'tools' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <Link href="/tools/merge" onClick={(e) => handleToolClick('/tools/merge', e)} className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#2b3d98] transition-colors">
                    <Merge className="h-4 w-4" />
                    <span>Merge PDF</span>
                  </Link>
                  <Link href="/tools/split" onClick={(e) => handleToolClick('/tools/split', e)} className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#2b3d98] transition-colors">
                    <Scissors className="h-4 w-4" />
                    <span>Split PDF</span>
                  </Link>
                  <Link href="/tools/compress" onClick={(e) => handleToolClick('/tools/compress', e)} className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#2b3d98] transition-colors">
                    <Archive className="h-4 w-4" />
                    <span>Compress PDF</span>
                  </Link>
                </div>
              )}
            </div>

            {/* PDF to Files Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('pdf-to-files')}
                className="text-gray-700 hover:text-[#2b3d98] transition-colors duration-200 flex items-center space-x-1"
              >
                <span>PDF to Files</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {activeDropdown === 'pdf-to-files' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <Link href="/convert/pdf-to-word" onClick={(e) => handleToolClick('/convert/pdf-to-word', e)} className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#2b3d98] transition-colors">
                    <FileText className="h-4 w-4" />
                    <span>PDF to Word</span>
                  </Link>
                  <Link href="/convert/pdf-to-excel" onClick={(e) => handleToolClick('/convert/pdf-to-excel', e)} className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#2b3d98] transition-colors">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>PDF to Excel</span>
                  </Link>
                  <Link href="/convert/pdf-to-ppt" onClick={(e) => handleToolClick('/convert/pdf-to-ppt', e)} className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#2b3d98] transition-colors">
                    <Presentation className="h-4 w-4" />
                    <span>PDF to PPT</span>
                  </Link>
                  <Link href="/convert/pdf-to-image" onClick={(e) => handleToolClick('/convert/pdf-to-image', e)} className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#2b3d98] transition-colors">
                    <FileImage className="h-4 w-4" />
                    <span>PDF to Image</span>
            </Link>
                </div>
              )}
            </div>

            {/* Files to PDF Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('files-to-pdf')}
                className="text-gray-700 hover:text-[#2b3d98] transition-colors duration-200 flex items-center space-x-1"
              >
                <span>Files to PDF</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {activeDropdown === 'files-to-pdf' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <Link href="/convert/word-to-pdf" onClick={(e) => handleToolClick('/convert/word-to-pdf', e)} className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#2b3d98] transition-colors">
                    <FileText className="h-4 w-4" />
                    <span>Word to PDF</span>
                  </Link>
                  <Link href="/convert/excel-to-pdf" onClick={(e) => handleToolClick('/convert/excel-to-pdf', e)} className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#2b3d98] transition-colors">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Excel to PDF</span>
                  </Link>
                  <Link href="/convert/ppt-to-pdf" onClick={(e) => handleToolClick('/convert/ppt-to-pdf', e)} className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#2b3d98] transition-colors">
                    <Presentation className="h-4 w-4" />
                    <span>PPT to PDF</span>
                  </Link>
                  <Link href="/convert/image-to-pdf" onClick={(e) => handleToolClick('/convert/image-to-pdf', e)} className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#2b3d98] transition-colors">
                    <FileImage className="h-4 w-4" />
                    <span>Image to PDF</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Regular Links */}
            <Link href="/pricing" className="text-gray-700 hover:text-[#2b3d98] transition-colors duration-200">
              Pricing
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-[#2b3d98] transition-colors duration-200">
              About
            </Link>
            
            {/* Auth Section */}
            <div className="ml-4 pl-4 border-l border-gray-200">
            {isAuthenticated && user ? (
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown('user')}
                      className="flex items-center space-x-2 text-gray-700 hover:text-[#2b3d98] transition-colors duration-200"
                    >
                      <UserAvatar user={user} size="sm" />
                      <span className="hidden sm:block">{user.name}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {activeDropdown === 'user' && (
                      <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400 mt-1">{user.role}</p>
                        </div>
                        {user.role === 'ADMIN' && (
                          <Link 
                            href="/dashboard"
                            className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#2b3d98] transition-colors"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <User className="h-4 w-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                        <button 
                          onClick={() => {
                            handleLogout();
                            setActiveDropdown(null);
                          }}
                          className="flex items-center space-x-2 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
            ) : (
                <div className="flex items-center space-x-6">
                <Link 
                  href="/login" 
                  className="text-gray-700 hover:text-[#2b3d98] transition-colors duration-200 flex items-center space-x-1"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-[#2b3d98] text-white px-4 py-2 rounded-lg hover:bg-[#243485] transition-colors duration-200 flex items-center space-x-1"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Sign Up</span>
                </Link>
                </div>
            )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-[#2b3d98] transition-colors duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-4 pt-4 pb-4 space-y-2 sm:px-6 bg-gray-50 rounded-lg mt-3">
              
              {/* Tools Section */}
              <div className="border-b border-gray-200 pb-3 mb-3">
                <div className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">Tools</div>
                <Link href="/tools/merge" onClick={(e) => handleToolClick('/tools/merge', e)} className="flex items-center space-x-2 px-6 py-2 text-gray-700 hover:text-[#2b3d98] transition-colors">
                  <Merge className="h-4 w-4" />
                  <span>Merge PDF</span>
                </Link>
                <Link href="/tools/split" onClick={(e) => handleToolClick('/tools/split', e)} className="flex items-center space-x-2 px-6 py-2 text-gray-700 hover:text-[#2b3d98] transition-colors">
                  <Scissors className="h-4 w-4" />
                  <span>Split PDF</span>
                </Link>
                <Link href="/tools/compress" onClick={(e) => handleToolClick('/tools/compress', e)} className="flex items-center space-x-2 px-6 py-2 text-gray-700 hover:text-[#2b3d98] transition-colors">
                  <Archive className="h-4 w-4" />
                  <span>Compress PDF</span>
                </Link>
              </div>

              {/* PDF to Files Section */}
              <div className="border-b border-gray-200 pb-3 mb-3">
                <div className="px-3 py-2 text-sm font-medium text-gray-900">PDF to Files</div>
                <Link href="/convert/pdf-to-word" onClick={(e) => handleToolClick('/convert/pdf-to-word', e)} className="flex items-center space-x-2 px-6 py-2 text-gray-700 hover:text-[#2b3d98] transition-colors">
                  <FileText className="h-4 w-4" />
                  <span>PDF to Word</span>
                </Link>
                <Link href="/convert/pdf-to-excel" onClick={(e) => handleToolClick('/convert/pdf-to-excel', e)} className="flex items-center space-x-2 px-6 py-2 text-gray-700 hover:text-[#2b3d98] transition-colors">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>PDF to Excel</span>
                </Link>
                <Link href="/convert/pdf-to-ppt" onClick={(e) => handleToolClick('/convert/pdf-to-ppt', e)} className="flex items-center space-x-2 px-6 py-2 text-gray-700 hover:text-[#2b3d98] transition-colors">
                  <Presentation className="h-4 w-4" />
                  <span>PDF to PPT</span>
                </Link>
                <Link href="/convert/pdf-to-image" onClick={(e) => handleToolClick('/convert/pdf-to-image', e)} className="flex items-center space-x-2 px-6 py-2 text-gray-700 hover:text-[#2b3d98] transition-colors">
                  <FileImage className="h-4 w-4" />
                  <span>PDF to Image</span>
                </Link>
              </div>

              {/* Files to PDF Section */}
              <div className="border-b border-gray-200 pb-2 mb-2">
                <div className="px-3 py-2 text-sm font-medium text-gray-900">Files to PDF</div>
                <Link href="/convert/word-to-pdf" onClick={(e) => handleToolClick('/convert/word-to-pdf', e)} className="flex items-center space-x-2 px-6 py-2 text-gray-700 hover:text-[#2b3d98] transition-colors">
                  <FileText className="h-4 w-4" />
                  <span>Word to PDF</span>
                </Link>
                <Link href="/convert/excel-to-pdf" onClick={(e) => handleToolClick('/convert/excel-to-pdf', e)} className="flex items-center space-x-2 px-6 py-2 text-gray-700 hover:text-[#2b3d98] transition-colors">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Excel to PDF</span>
                </Link>
                <Link href="/convert/ppt-to-pdf" onClick={(e) => handleToolClick('/convert/ppt-to-pdf', e)} className="flex items-center space-x-2 px-6 py-2 text-gray-700 hover:text-[#2b3d98] transition-colors">
                  <Presentation className="h-4 w-4" />
                  <span>PPT to PDF</span>
                </Link>
                <Link href="/convert/image-to-pdf" onClick={(e) => handleToolClick('/convert/image-to-pdf', e)} className="flex items-center space-x-2 px-6 py-2 text-gray-700 hover:text-[#2b3d98] transition-colors">
                  <FileImage className="h-4 w-4" />
                  <span>Image to PDF</span>
                </Link>
              </div>

              {/* Other Links */}
              <Link href="/pricing" className="block px-3 py-2 text-gray-700 hover:text-[#2b3d98] transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>
                Pricing
              </Link>
              <Link href="/about" className="block px-3 py-2 text-gray-700 hover:text-[#2b3d98] transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>
                About
              </Link>
              
              {/* Auth Section */}
              <div className="border-t border-gray-200 pt-2 mt-2">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center space-x-3 px-3 py-2 bg-gray-100 rounded-lg mb-2">
                    <UserAvatar user={user} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400">{user.role}</p>
                    </div>
                  </div>
                  {user.role === 'ADMIN' && (
                    <Link 
                      href="/dashboard"
                      className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-[#2b3d98] transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 text-red-600 hover:text-red-700 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                      className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-[#2b3d98] transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                      <LogIn className="h-4 w-4" />
                      <span>Login</span>
                  </Link>
                  <Link 
                    href="/signup" 
                      className="flex items-center space-x-2 px-3 py-2 bg-[#2b3d98] text-white rounded-lg hover:bg-[#243485] transition-colors duration-200 mt-3"
                    onClick={() => setIsMenuOpen(false)}
                  >
                      <UserPlus className="h-4 w-4" />
                      <span>Sign Up</span>
                  </Link>
                </>
              )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
