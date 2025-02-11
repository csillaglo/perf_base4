import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Target, BarChart, Users } from 'lucide-react';
import type { Goal, PerformanceGrade } from '../../types/database';

interface PerformanceOverviewProps {
  goals: Goal[];
  performanceScore: number;
  gradeInfo: {
    grade_text: string;
    grade_level: number;
  };
}

export function PerformanceOverview({ goals, performanceScore, gradeInfo }: PerformanceOverviewProps) {
  const { t } = useTranslation();

  const getScoreColor = (score: number) => {
    if (score >= 81) return 'text-green-600';
    if (score >= 61) return 'text-blue-600';
    if (score >= 41) return 'text-yellow-600';
    if (score >= 21) return 'text-orange-600';
    return 'text-red-600';
  };

  const performanceStats = [
    { 
      name: t('goals.evaluation.performance.score'), 
      value: `${performanceScore}%`, 
      subtext: t(`goals.evaluation.performance.grades.${gradeInfo.grade_text.toLowerCase()}`),
      icon: TrendingUp, 
      color: getScoreColor(performanceScore)
    },
    { 
      name: t('goals.evaluation.metrics.inProgressGoals'), 
      value: goals.filter(g => g.status !== 'completed').length.toString(), 
      subtext: t('goals.status.in_progress'),
      icon: Target, 
      color: 'text-blue-500' 
    },
    { 
      name: t('goals.evaluation.metrics.completedGoals'), 
      value: goals.filter(g => g.status === 'completed').length.toString(),
      subtext: t('goals.status.completed'),
      icon: BarChart, 
      color: 'text-green-500' 
    },
    { 
      name: t('goals.evaluation.performance.gradeLevel'), 
      value: gradeInfo.grade_level.toString(),
      subtext: t('goals.evaluation.performance.currentLevel'),
      icon: Users, 
      color: getScoreColor(performanceScore)
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {performanceStats.map((stat) => (
        <div key={stat.name} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-md bg-opacity-10 ${stat.color.replace('text-', 'bg-')}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{stat.name}</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</div>
                    <div className="ml-2 text-sm text-gray-500 dark:text-gray-400">{stat.subtext}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}