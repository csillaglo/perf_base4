import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Goal } from '../../types/database';
import { PerformanceOverview } from './PerformanceOverview';
import { GoalsOverview } from './GoalsOverview';
import { GoalRadarChart } from './GoalRadarChart';

interface OwnPerformanceOverviewProps {
  goals: Goal[];
  performanceScore: number;
  gradeInfo: {
    grade_text: string;
    grade_level: number;
  };
}

export function OwnPerformanceOverview({ goals, performanceScore, gradeInfo }: OwnPerformanceOverviewProps) {

  const { t, i18n } = useTranslation();

  return (
    <div>
      <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
        {t('goals.evaluation.performance.ownOverview')}
      </h2>
      <div className="space-y-6">
        <PerformanceOverview 
          goals={goals}
          performanceScore={performanceScore}
          gradeInfo={gradeInfo}
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <GoalsOverview goals={goals} />
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t('goals.evaluation.performance.title')}
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`text-5xl font-bold ${getScoreColor(performanceScore)}`}>
                        {performanceScore}
                      </div>
                      <div className="text-xl text-gray-500 dark:text-gray-400">
                        {t('goals.evaluation.performance.outOf')} 100
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-medium ${getScoreColor(performanceScore)}`}>
                        {gradeInfo.grade_text}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {t('goals.evaluation.performance.gradeLevel')}: {gradeInfo.grade_level}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="overflow-hidden bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                        <thead className="bg-gray-100 dark:bg-gray-600">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              {t('goals.evaluation.performance.scoreRange')}
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              {t('goals.evaluation.performance.grade')}
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              {t('goals.evaluation.performance.level')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                          {[
                            { min: 0, max: 20, text: t('goals.evaluation.performance.grades.unsatisfactory'), level: 1 },
                            { min: 21, max: 40, text: t('goals.evaluation.performance.grades.weak'), level: 2 },
                            { min: 41, max: 60, text: t('goals.evaluation.performance.grades.normal'), level: 3 },
                            { min: 61, max: 80, text: t('goals.evaluation.performance.grades.good'), level: 4 },
                            { min: 81, max: 100, text: t('goals.evaluation.performance.grades.excellent'), level: 5 }
                          ].map((grade) => (
                            <tr 
                              key={grade.level}
                              className={performanceScore >= grade.min && performanceScore <= grade.max ? 'bg-indigo-50 dark:bg-indigo-900/50' : ''}
                            >
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                                {grade.min}-{grade.max}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                                {grade.text}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                                {grade.level}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <GoalRadarChart goals={goals} />
          </div>
        </div>
      </div>
    </div>
  );
}

function getScoreColor(score: number) {
  if (score >= 81) return 'text-green-600';
  if (score >= 61) return 'text-blue-600';
  if (score >= 41) return 'text-yellow-600';
  if (score >= 21) return 'text-orange-600';
  return 'text-red-600';
}