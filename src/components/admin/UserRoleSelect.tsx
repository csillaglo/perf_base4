import React from 'react';
import type { UserRole } from '../../types/database';

interface UserRoleSelectProps {
  currentRole: UserRole;
  onChange: (role: UserRole) => void;
}

const roleOrder: UserRole[] = ['employee', 'manager', 'hr_admin', 'company_admin'];

const roleColors = {
  company_admin: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  hr_admin: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
  manager: 'bg-green-100 text-green-800 hover:bg-green-200',
  employee: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  superadmin: 'bg-purple-100 text-purple-800' // Not clickable
};

export function UserRoleSelect({ currentRole, onChange }: UserRoleSelectProps) {
  const handleRoleClick = () => {
    if (currentRole === 'superadmin') return; // Don't allow changing superadmin role
    
    // Get current role index
    const currentIndex = roleOrder.indexOf(currentRole);
    // Get next role in the cycle
    const nextRole = roleOrder[(currentIndex + 1) % roleOrder.length];
    onChange(nextRole);
  };

  return (
    <button
      onClick={handleRoleClick}
      disabled={currentRole === 'superadmin'}
      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-150 ease-in-out cursor-pointer ${roleColors[currentRole]} ${
        currentRole === 'superadmin' ? 'cursor-not-allowed' : ''
      }`}
    >
      {currentRole === 'company_admin' ? 'Company Admin' :
       currentRole === 'hr_admin' ? 'HR Admin' :
       currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
    </button>
  );
}