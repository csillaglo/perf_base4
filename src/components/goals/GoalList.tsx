import React from 'react';
import { ChevronRight, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Goal } from '../../types/database';
import { GoalStatus } from './GoalStatus';
import { GoalScore } from './GoalScore';
import { supabase } from '../../lib/supabase';

interface GoalListProps {
  goals: Goal[];
  onGoalClick: (goal: Goal) => void;
  totalWeight: number;
}

export function GoalList({ goals, onGoalClick, totalWeight }: GoalListProps) {
  const { t, i18n } = useTranslation();
  const allocableWeight = 100 - totalWeight;
  const weightColor = totalWeight === 100 ? 'text-green-600' : 'text-red-600';

  // Fordítás lekérése az adatbázisból
  const getTranslation = async (goal: Goal, field: string) => {
    const { data } = await supabase.rpc('get_translation', {
      p_record_id: goal.id,
      p_table_name: 'goals',
      p_field_name: field,
      p_language: i18n.language
    });
    return data || goal[field];
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className={`text-sm font-medium ${weightColor}`}>
          {t('goals.allocatedWeight')}: <span className="font-bold">{totalWeight}%</span>
          {totalWeight !== 100 && (
            <span className="ml-2">
              • {t('goals.allocableWeight')}: <span className="font-bold">{allocableWeight}%</span>
            </span>
          )}
        </div>
        {totalWeight !== 100 && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('goals.weightWarning')}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {goals.map((goal) => (
            <li key={goal.id}>
              <div 
                className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => onGoalClick(goal)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">{goal.title}</p>
                        <GoalStatus status={goal.status} />
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {t('goals.totalWeight')}: {goal.weight}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>
                      <div className="mt-2">
                        <GoalScore score={goal.evaluation_score || 1} />
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0">
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      {t('goals.dueDate')}: {goal.due_date ? new Date(goal.due_date).toLocaleDateString() : t('goals.noDueDate')}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}