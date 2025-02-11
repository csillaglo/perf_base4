import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, BarChart3, UserCheck, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Profile, Goal } from '../../types/database';
import { useAuth } from '../../contexts/AuthContext';

interface ManagerOverviewProps {
  grades: any[];
}

interface SubordinateStats {
  [key: number]: {
    count: number;
    employees: string[];
  };
}

interface SubordinatePerformance {
  id: string;
  full_name: string;
  email: string;
  score: number;
  department?: string;
  job_name?: string;
}

export function ManagerOverview({ grades }: ManagerOverviewProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<{
    totalSubordinates: number;
    pendingEvaluations: number;
    completedEvaluations: number;
    averageScore: number;
  }>({
    totalSubordinates: 0,
    pendingEvaluations: 0,
    completedEvaluations: 0,
    averageScore: 0,
  });
  const [subordinateStats, setSubordinateStats] = useState<SubordinateStats>({});
  const [topPerformers, setTopPerformers] = useState<SubordinatePerformance[]>([]);
  const [lowPerformers, setLowPerformers] = useState<SubordinatePerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubordinateStats();
  }, []);

  const fetchSubordinateStats = async () => {
    try {
      // Get all subordinates
      const { data: subordinates, error: subError } = await supabase
        .from('profiles')
        .select('*')
        .eq('manager_id', user.id);

      if (subError) throw subError;

      if (!subordinates?.length) {
        setLoading(false);
        return;
      }

      // Get all goals for each subordinate
      let totalScore = 0;
      let completedCount = 0;
      const gradeStats: { [key: number]: { count: number; employees: string[] } } = {};
      const performanceList: SubordinatePerformance[] = [];

      for (const subordinate of subordinates) {
        const { data: goals, error: goalsError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', subordinate.id);

        if (goalsError) throw goalsError;

        if (goals && goals.length > 0) {
          const score = calculatePerformanceScore(goals);
          const gradeLevel = getGradeLevel(score, grades);
          
          performanceList.push({
            id: subordinate.id,
            full_name: subordinate.full_name || 'Unnamed Employee',
            email: subordinate.email || '',
            score,
            department: subordinate.department,
            job_name: subordinate.job_name,
          });

          if (gradeLevel) {
            if (!gradeStats[gradeLevel]) {
              gradeStats[gradeLevel] = { count: 0, employees: [] };
            }
            gradeStats[gradeLevel].count++;
            gradeStats[gradeLevel].employees.push(subordinate.full_name || 'Unnamed Employee');
          }

          if (goals.every(g => g.evaluation_score)) {
            completedCount++;
            totalScore += score;
          }
        }
      }

      // Sort and set top/bottom performers
      const sortedPerformers = performanceList.sort((a, b) => b.score - a.score);
      setTopPerformers(sortedPerformers.slice(0, 3));
      setLowPerformers(sortedPerformers.slice(-3).reverse());

      setStats({
        totalSubordinates: subordinates.length,
        pendingEvaluations: subordinates.length - completedCount,
        completedEvaluations: completedCount,
        averageScore: completedCount > 0 ? Math.round(totalScore / completedCount) : 0,
      });
      setSubordinateStats(gradeStats);
    } catch (error) {
      console.error('Error fetching subordinate stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePerformanceScore = (goals: Goal[]) => {
    const totalWeight = goals.reduce((sum, goal) => sum + (goal.weight || 0), 0);
    if (totalWeight === 0) return 0;

    const weightedScore = goals.reduce((sum, goal) => {
      const normalizedScore = ((goal.evaluation_score || 1) / 5) * 100;
      return sum + (normalizedScore * (goal.weight || 0) / totalWeight);
    }, 0);

    return Math.round(weightedScore);
  };

  const getGradeLevel = (score: number, grades: any[]) => {
    const grade = grades.find(g => score >= g.min_score && score <= g.max_score);
    return grade?.grade_level;
  };

  const getScoreColor = (score: number) => {
    if (score >= 81) return 'text-green-600';
    if (score >= 61) return 'text-blue-600';
    if (score >= 41) return 'text-yellow-600';
    if (score >= 21) return 'text-orange-600';
    return 'text-red-600';
  };

  const renderPerformerCard = (performer: SubordinatePerformance, type: 'top' | 'bottom') => {
    const Icon = type === 'top' ? TrendingUp : TrendingDown;
    const colorClass = type === 'top' ? 'text-green-600' : 'text-red-600';
    const bgColorClass = type === 'top' ? 'bg-green-50' : 'bg-red-50';

    return (
      <div key={performer.id} className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className={`${bgColorClass} p-2 rounded-full`}>
          <Icon className={`h-5 w-5 ${colorClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {performer.full_name}
          </p>
          {(performer.department || performer.job_name) && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {performer.department} {performer.job_name ? `• ${performer.job_name}` : ''}
            </p>
          )}
          <p className={`text-sm font-semibold ${colorClass}`}>
            {t('goals.evaluation.manager.score')}: {performer.score}%
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">{t('goals.evaluation.manager.loading')}</div>;
  }

  const managerStats = [
    {
      name: t('goals.evaluation.manager.teamMembers'),
      value: stats.totalSubordinates,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: t('goals.evaluation.manager.pendingEvaluations'),
      value: stats.pendingEvaluations,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      name: t('goals.evaluation.manager.completedEvaluations'),
      value: stats.completedEvaluations,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: t('goals.evaluation.manager.averageScore'),
      value: `${stats.averageScore}%`,
      icon: BarChart3,
      color: getScoreColor(stats.averageScore),
      bgColor: `bg-${getScoreColor(stats.averageScore).split('-')[1]}-100`,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">{t('goals.evaluation.manager.title')}</h2>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {managerStats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-md ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Distribution and Top/Bottom Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('goals.evaluation.manager.gradeDistribution')}</h3>
          <div className="space-y-4">
            {Object.entries(subordinateStats)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([level, { count, employees }]) => (
                <div key={level} className="relative">
                  <div className="flex items-center mb-1">
                    <span className={`text-sm font-medium ${getScoreColor(Number(level) * 20)}`}>
                      Level {level}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({count} {count === 1 ? t('goals.evaluation.manager.employee') : t('goals.evaluation.manager.employees')})
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getScoreColor(Number(level) * 20).replace('text', 'bg')} transition-all duration-300`}
                        style={{ width: `${(count / stats.totalSubordinates) * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-500 w-12 text-right">
                      {Math.round((count / stats.totalSubordinates) * 100)}%
                    </span>
                  </div>
                  {count > 0 && (
                    <div className="mt-1 text-xs text-gray-500">
                      {employees.join(', ')}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Top and Bottom Performers */}
        <div className="space-y-6">
          {/* Top Performers */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('goals.evaluation.manager.topPerformers')}</h3>
            <div className="space-y-3">
              {topPerformers.map(performer => renderPerformerCard(performer, 'top'))}
              {topPerformers.length === 0 && (
                <p className="text-sm text-gray-500">{t('goals.evaluation.manager.noData')}</p>
              )}
            </div>
          </div>

          {/* Bottom Performers */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('goals.evaluation.manager.needsImprovement')}</h3>
            <div className="space-y-3">
              {lowPerformers.map(performer => renderPerformerCard(performer, 'bottom'))}
              {lowPerformers.length === 0 && (
                <p className="text-sm text-gray-500">{t('goals.evaluation.manager.noData')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}