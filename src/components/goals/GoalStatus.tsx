import React from 'react';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface GoalStatusProps {
  status: string;
}

export function GoalStatus({ status }: GoalStatusProps) {
  const { t } = useTranslation();

  const statusOptions = [
    { value: 'pending', label: t('goals.status.pending'), icon: AlertCircle, color: 'text-gray-500 bg-gray-100' },
    { value: 'in_progress', label: t('goals.status.in_progress'), icon: Clock, color: 'text-yellow-800 bg-yellow-100' },
    { value: 'completed', label: t('goals.status.completed'), icon: CheckCircle, color: 'text-green-800 bg-green-100' },
  ];

  const statusInfo = statusOptions.find(opt => opt.value === status) || statusOptions[0];
  const StatusIcon = statusInfo.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
      <StatusIcon className="h-4 w-4 mr-1" />
      {statusInfo.label}
    </span>
  );
}