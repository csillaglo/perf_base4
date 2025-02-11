import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { UserStatus } from '../../types/database';

interface UserStatusProps {
  status: UserStatus;
}

export function UserStatus({ status }: UserStatusProps) {
  return (
    <div className="flex items-center">
      {status === 'active' ? (
        <div className="flex items-center text-green-600">
          <CheckCircle className="h-4 w-4 mr-1" />
          <span className="text-sm">Active</span>
        </div>
      ) : (
        <div className="flex items-center text-red-600">
          <XCircle className="h-4 w-4 mr-1" />
          <span className="text-sm">Inactive</span>
        </div>
      )}
    </div>
  );
}