import React from 'react';
import type { Profile } from '../../types/database';

interface UserManagerSelectProps {
  users: Profile[];
  currentUserId: string;
  selectedManagerId: string | null;
  onManagerChange: (managerId: string | null) => void;
}

export function UserManagerSelect({ 
  users, 
  currentUserId, 
  selectedManagerId, 
  onManagerChange 
}: UserManagerSelectProps) {
  return (
    <select
      value={selectedManagerId || ''}
      onChange={(e) => onManagerChange(e.target.value || null)}
      className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 h-11"
    >
      <option value="">No Manager</option>
      {users
        .filter(u => u.role === 'manager' && u.id !== currentUserId)
        .map(manager => (
          <option key={manager.id} value={manager.id}>
            {manager.full_name || manager.id}
          </option>
        ))}
    </select>
  );
}