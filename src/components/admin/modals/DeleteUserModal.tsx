import React from 'react';
import { Modal } from '../Modal';
import type { Profile } from '../../../types/database';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: (Profile & { email: string }) | null;
  onDelete: () => void;
  deleting: boolean;
}

export function DeleteUserModal({
  isOpen,
  onClose,
  user,
  onDelete,
  deleting,
}: DeleteUserModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete User"
    >
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          Are you sure you want to delete this user? This action cannot be undone.
          All associated data will be permanently removed.
        </p>
        {user && (
          <div className="mt-2 p-4 bg-gray-50 rounded-md">
            <p className="text-sm font-medium text-gray-900">
              {user.full_name || 'No name set'}
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
          {deleting ? 'Deleting...' : 'Delete User'}
        </button>
      </div>
    </Modal>
  );
}