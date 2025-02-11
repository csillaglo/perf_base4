import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Goal } from '../../types/database';
import { GoalStatus } from '../goals/GoalStatus';
import { GoalScore } from '../goals/GoalScore';

interface GoalImpactListProps {
  goals: Goal[];
}

export function GoalImpactList({ goals }: GoalImpactListProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('goals.evaluation.impact.title')}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('goals.evaluation.impact.subtitle')}
        </p>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {goals.map((goal) => (
          <div key={goal.id} className="px-6 py-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">{goal.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{goal.description}</p>
              </div>
              <GoalStatus status={goal.status} />
            </div>
            <div className="flex items-center justify-between">
              <GoalScore score={goal.evaluation_score || 1} />
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('goals.weight')}: {goal.weight || 0}%
                </span>
                <span className="text-sm font-medium text-indigo-600">
                  {t('goals.evaluation.impact.impact', { impact: Math.round(((goal.evaluation_score || 1) / 5 * 100) * (goal.weight || 0) / 100) })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}