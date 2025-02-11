import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, UserPlus, Building2 } from 'lucide-react';
import type { Profile, Organization } from '../../../types/database';
import { UserList } from '../UserList';
import { OrgChart } from '../OrgChart';

interface UserManagementSectionProps {
  users: Array<Profile & { email: string }>;
  organizations: Organization[];
  viewMode: 'list' | 'chart';
  onViewModeChange: (mode: 'list' | 'chart') => void;
  onInviteUser: () => void;
  onRoleChange: (userId: string, newRole: string) => void;
  onEditClick: (user: Profile & { email: string }) => void;
  onDeleteClick: (user: Profile & { email: string }) => void;
  onManagerChange: (userId: string, managerId: string | null) => void;
  updateMessage: { type: string; text: string } | null;
}

export function UserManagementSection({
  users,
  organizations,
  viewMode,
  onViewModeChange,
  onInviteUser,
  onRoleChange,
  onEditClick,
  onDeleteClick,
  onManagerChange,
  updateMessage
}: UserManagementSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-100 rounded-lg p-2">
            <Users className="h-6 w-6 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('admin.users.management')}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => onViewModeChange('list')}
              className={`px-4 py-2 text-sm font-medium border ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } rounded-l-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              <Users className="h-4 w-4 inline-block mr-2" />
              {t('admin.users.listView')}
            </button>
            <button
              onClick={() => onViewModeChange('chart')}
              className={`px-4 py-2 text-sm font-medium border ${
                viewMode === 'chart'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } rounded-r-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              <Building2 className="h-4 w-4 inline-block mr-2" />
              {t('admin.users.orgChart')}
            </button>
          </div>
          <button
            onClick={onInviteUser}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {t('admin.users.invite')}
          </button>
        </div>
      </div>

      {updateMessage?.text && (
        <div
          className={`mt-4 p-4 rounded-md transition-opacity duration-500 ${
            updateMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {updateMessage.text}
        </div>
      )}

      <div className="mt-4">
        {viewMode === 'list' ? (
          <UserList
            users={users}
            organizations={organizations}
            onRoleChange={onRoleChange}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
            onManagerChange={onManagerChange}
            updateMessage={null}
          />
        ) : (
          <OrgChart
            users={users}
            onManagerChange={onManagerChange}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
          />
        )}
      </div>
    </div>
  );
}