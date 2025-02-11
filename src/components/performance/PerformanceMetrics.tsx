import React from 'react';
import { useTranslation } from 'react-i18next';
import { Target, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { Goal } from '../../types/database';

interface PerformanceMetricsProps {
  goals: Goal[];
}

export function PerformanceMetrics({ goals }: PerformanceMetricsProps) {
  const { t } = useTranslation();

  const calculateMetrics = () => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const inProgressGoals = goals.filter(g => g.status === 'in_progress').length;
    const overdueGoals = goals.filter(g => {
      const dueDate = new Date(g.due_date);
      return g.status !== 'completed' && dueDate < new Date();
    }).length;

    return {
      totalGoals,
      completedGoals,
      inProgressGoals,
      overdueGoals,
    };
  };

  const metrics = calculateMetrics();

  const metricCards = [
    { 
      icon: Target, 
      color: 'text-indigo-600', 
      label: t('goals.evaluation.metrics.totalGoals'), 
      value: metrics.totalGoals 
    },
    { 
      icon: CheckCircle, 
      color: 'text-green-600', 
      label: t('goals.evaluation.metrics.completedGoals'), 
      value: metrics.completedGoals 
    },
    { 
      icon: Clock, 
      color: 'text-yellow-600', 
      label: t('goals.evaluation.metrics.inProgressGoals'), 
      value: metrics.inProgressGoals 
    },
    { 
      icon: AlertCircle, 
      color: 'text-red-600', 
      label: t('goals.evaluation.metrics.overdueGoals'), 
      value: metrics.overdueGoals 
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {metricCards.map(({ icon: Icon, color, label, value }) => (
        <div key={label} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <Icon className={`h-10 w-10 ${color}`} />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{label}</h3>
              <p className={`text-2xl font-semibold ${color}`}>{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}