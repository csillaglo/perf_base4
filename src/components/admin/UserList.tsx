import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2, Trash2, UserCheck, UserX } from 'lucide-react';
import type { Profile, UserRole } from '../../types/database';
import type { Organization } from '../../types/database';
import { Filter } from 'lucide-react';
import { UserRoleSelect } from './UserRoleSelect';
import { UserManagerSelect } from './UserManagerSelect';
import { UserStatus } from './UserStatus';

interface UserListProps {
  users: Profile[];
  organizations: Organization[];
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onEditClick: (user: Profile) => void;
  onDeleteClick: (user: Profile) => void;
  onManagerChange: (userId: string, managerId: string | null) => void;
  updateMessage: { type: string; text: string } | null;
}

interface Filters {
  organization: string;
  role: string;
  manager: string;
}

export function UserList({ 
  users, 
  organizations,
  onRoleChange, 
  onEditClick, 
  onDeleteClick,
  onManagerChange,
  updateMessage 
}: UserListProps) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<Filters>({
    organization: '',
    role: '',
    manager: '',
  });

  const filteredUsers = users.filter(user => {
    const matchesOrg = !filters.organization || user.organization_id === filters.organization;
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesManager = !filters.manager || user.manager_id === filters.manager;
    return matchesOrg && matchesRole && matchesManager;
  });

  // Get unique managers from users
  const managers = users.filter(user => user.role === 'manager');

  return (
    <div className="space-y-4">
      {updateMessage && (
        <div
          className={`p-4 rounded-md ${
            updateMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {updateMessage.text}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 shadow rounded-lg mb-4">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.users.filters.title')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="org-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('admin.users.filters.organization')}
            </label>
            <select
              id="org-filter"
              value={filters.organization}
              onChange={(e) => setFilters(prev => ({ ...prev, organization: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 h-11 py-2.5"
            >
              <option value="">{t('admin.users.filters.allOrganizations')}</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('admin.users.filters.role')}
            </label>
            <select
              id="role-filter"
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 h-11 py-2.5"
            >
              <option value="">{t('admin.users.filters.allRoles')}</option>
              <option value="employee">{t('admin.roles.employee')}</option>
              <option value="manager">{t('admin.roles.manager')}</option>
              <option value="hr_admin">{t('admin.roles.hrAdmin')}</option>
              <option value="company_admin">{t('admin.roles.companyAdmin')}</option>
              <option value="superadmin">{t('admin.roles.superadmin')}</option>
            </select>
          </div>
          <div>
            <label htmlFor="manager-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('admin.users.filters.manager')}
            </label>
            <select
              id="manager-filter"
              value={filters.manager}
              onChange={(e) => setFilters(prev => ({ ...prev, manager: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 h-11 py-2.5"
            >
              <option value="">{t('admin.users.filters.allManagers')}</option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.full_name || manager.email || t('admin.users.table.unnamed')}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setFilters({ organization: '', role: '', manager: '' })}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {t('admin.users.filters.clearFilters')}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('admin.users.table.user')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('admin.users.table.organization')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('admin.users.table.role')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('admin.users.table.manager')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('admin.users.table.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('admin.users.table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.full_name || t('common.noNameSet')}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email || user.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {user.organization_id ? 
                      organizations.find(org => org.id === user.organization_id)?.name || 'Unknown Organization'
                      : 
                      <span className="text-gray-400 dark:text-gray-500">{t('admin.users.table.noOrg')}</span>
                    }
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <UserRoleSelect
                    currentRole={user.role}
                    onChange={(newRole) => onRoleChange(user.id, newRole)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.role !== 'admin' && (
                    <UserManagerSelect
                      users={users}
                      currentUserId={user.id}
                      selectedManagerId={user.manager_id}
                      onManagerChange={(managerId) => onManagerChange(user.id, managerId)}
                    />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <UserStatus role={user.role} status={user.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => onEditClick(user)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDeleteClick(user)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}