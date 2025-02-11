import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Plus } from 'lucide-react';
import type { Organization } from '../../../types/database';
import { OrganizationList } from '../OrganizationList';

interface OrganizationsSectionProps {
  organizations: Array<Organization & { adminCount: number; userCount: number }>;
  onAddAdmin: (org: Organization) => void;
  onDelete: (org: Organization) => void;
  onCreateNew: () => void;
}

export function OrganizationsSection({ 
  organizations, 
  onAddAdmin, 
  onDelete,
  onCreateNew 
}: OrganizationsSectionProps) {
  const { t } = useTranslation();

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 rounded-lg p-2">
            <Building2 className="h-6 w-6 text-purple-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('admin.organizations.title')}</h1>
        </div>
        <button
          onClick={onCreateNew}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('admin.organizations.new')}
        </button>
      </div>

      <div className="mt-4">
        <OrganizationList
          organizations={organizations}
          onAddAdmin={onAddAdmin}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}