import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Plus } from 'lucide-react';

interface WelcomeMessageSectionProps {
  message: string;
  onEdit: () => void;
}

export function WelcomeMessageSection({ message, onEdit }: WelcomeMessageSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 rounded-lg p-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('admin.welcomeMessage.title')}</h1>
        </div>
        <button
          onClick={onEdit}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('admin.welcomeMessage.edit')}
        </button>
      </div>

      <div className="mt-4 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="prose dark:prose-invert max-w-none">
          {message || t('admin.welcomeMessage.noMessage')}
        </div>
      </div>
    </div>
  );
}