'use client';

import { User } from '@/types';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
  const getInitial = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  const getSizeClasses = (size: string): string => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8 text-sm';
      case 'lg':
        return 'h-12 w-12 text-lg';
      default:
        return 'h-10 w-10 text-base';
    }
  };

  const getColorClasses = (name: string): string => {
    // Generate consistent color based on name
    const colors = [
      'bg-blue-500 text-white',
      'bg-green-500 text-white',
      'bg-purple-500 text-white',
      'bg-red-500 text-white',
      'bg-yellow-500 text-white',
      'bg-indigo-500 text-white',
      'bg-pink-500 text-white',
      'bg-teal-500 text-white',
    ];
    
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div
      className={`
        ${getSizeClasses(size)}
        ${getColorClasses(user.name)}
        ${className}
        rounded-full flex items-center justify-center font-medium
        shadow-sm border-2 border-white
      `}
      title={`${user.name} (${user.role})`}
    >
      {getInitial(user.name)}
    </div>
  );
}


