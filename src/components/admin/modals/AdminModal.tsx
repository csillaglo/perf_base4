import React from 'react';
import { Modal } from '../Modal';
import type { AdminCandidate } from '../../../types/database';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrgName?: string;
  adminCandidates: AdminCandidate[];
  selectedAdminId: string;
  onAdminSelect: (id: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
}

export function AdminModal({
  isOpen,
  onClose,
  selectedOrgName,
  adminCandidates,
  selectedAdminId,
  onAdminSelect,
  onSubmit,
  saving,
}: AdminModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Admin to ${selectedOrgName}`}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="admin" className="block text-sm font-medium text-gray-700">
            Select Admin
          </label>
          <select
            id="admin"
            value={selectedAdminId}
            onChange={(e) => onAdminSelect(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select an admin</option>
            {adminCandidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.full_name || candidate.email}
              </option>
            ))}
          </select>
          {adminCandidates.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">
              No eligible admins found in this organization
            </p>
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
            type="submit"
            disabled={saving || !selectedAdminId}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {saving ? 'Adding...' : 'Add Admin'}
          </button>
        </div>
      </form>
    </Modal>
  );
}