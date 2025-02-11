import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserCircle } from 'lucide-react';
import type { Goal } from '../../types/database';
import { GoalScore } from '../goals/GoalScore';

interface GoalsOverviewProps {
  goals: Goal[];
}

export function GoalsOverview({ goals }: GoalsOverviewProps) {
  const { t } = useTranslation();

  const getProgressPercentage = (goal: Goal) => {
    switch (goal.status) {
      case 'completed':
        return 100;
      case 'in_progress':
        return 50;
      default:
        return 0;
    }
  };

  const getDaysUntilDue = (dueDate: string | null) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateImpact = (goal: Goal) => {
    const normalizedScore = ((goal.evaluation_score || 1) / 5) * 100;
    return Math.round((normalizedScore * (goal.weight || 0)) / 100);
  };

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('goals.title')}</h2>
        {goals.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">{t('goals.noGoals')}</div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const daysUntilDue = getDaysUntilDue(goal.due_date);
              const progress = getProgressPercentage(goal);
              const impact = calculateImpact(goal);
              
              return (
                <div key={goal.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">{goal.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {t('goals.weight')}: {goal.weight}%
                        </span>
                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          {t('goals.evaluation.impact.impact')}: {impact}%
                        </span>
                      </div>
                    </div>

                    {goal.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{goal.description}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <GoalScore score={goal.evaluation_score || 1} />
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {goal.due_date ? (
                          daysUntilDue && daysUntilDue > 0 ? (
                            t('goals.dueInDays', { days: daysUntilDue })
                          ) : daysUntilDue === 0 ? (
                            <span className="text-yellow-600 dark:text-yellow-400">{t('goals.dueToday')}</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">
                              {t('goals.overdueDays', { days: Math.abs(daysUntilDue) })}
                            </span>
                          )
                        ) : (
                          t('goals.noDueDate')
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex-grow bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            progress === 100 ? 'bg-green-600' :
                            progress > 0 ? 'bg-blue-600' :
                            'bg-gray-400'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{progress}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}