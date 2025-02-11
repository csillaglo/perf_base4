import React from 'react';
import { useTranslation } from 'react-i18next';
import type { UserRole } from '../../types/database';
import type { Organization } from '../../types/database';

interface UserFormProps {
  formData: {
    email?: string;
    full_name: string;
    role: UserRole;
    organization_id?: string;
    status: UserStatus;
    department: string;
    job_level: string;
    job_name: string;
  };
  organizations: Organization[];
  onChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  showEmailField?: boolean;
}

export function UserForm({
  formData,
  organizations,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
  showEmailField = false,
}: UserFormProps) {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {showEmailField && (
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('common.email')}
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="user@example.com"
          />
        </div>
      )}

      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('profile.fullName')}
        </label>
        <input
          type="text"
          id="full_name"
          value={formData.full_name}
          onChange={(e) => onChange('full_name', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder={t('profile.fullNamePlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('profile.department')}
        </label>
        <input
          type="text"
          id="department"
          value={formData.department}
          onChange={(e) => onChange('department', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder={t('profile.departmentPlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="job_level" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('profile.jobLevel')}
        </label>
        <input
          type="text"
          id="job_level"
          value={formData.job_level}
          onChange={(e) => onChange('job_level', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder={t('profile.jobLevelPlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="job_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('profile.jobName')}
        </label>
        <input
          type="text"
          id="job_name"
          value={formData.job_name}
          onChange={(e) => onChange('job_name', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder={t('profile.jobNamePlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('profile.role')}
        </label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => onChange('role', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="employee">{t('admin.roles.employee')}</option>
          <option value="manager">{t('admin.roles.manager')}</option>
          <option value="hr_admin">{t('admin.roles.hrAdmin')}</option>
          <option value="company_admin">{t('admin.roles.companyAdmin')}</option>
        </select>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('admin.users.status')}
        </label>
        <div className="mt-1">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => onChange('status', 'active')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                formData.status === 'active'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {t('admin.users.active')}
            </button>
            <button
              type="button"
              onClick={() => onChange('status', 'inactive')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                formData.status === 'inactive'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {t('admin.users.inactive')}
            </button>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="organization" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('admin.organizations.title')}
        </label>
        <select
          id="organization"
          value={formData.organization_id || ''}
          onChange={(e) => onChange('organization_id', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">{t('admin.organizations.noOrganization')}</option>
          {organizations.map(org => (
            <option key={org.id} value={org.id}>{org.name}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? t('common.saving') : t(submitLabel)}
        </button>
      </div>
    </form>
  );
}