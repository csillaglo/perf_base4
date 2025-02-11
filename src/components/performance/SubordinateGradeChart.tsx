import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Profile, Goal, PerformanceGrade } from '../../types/database';
import { useAuth } from '../../contexts/AuthContext';

interface SubordinateGradeChartProps {
  grades: PerformanceGrade[];
}

interface SubordinateStats {
  [key: number]: {
    count: number;
    employees: string[];
  };
}

export function SubordinateGradeChart({ grades }: SubordinateGradeChartProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [subordinateStats, setSubordinateStats] = useState<SubordinateStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchSubordinateStats();
    }
  }, [user?.id, grades]); // Add dependency on grades

  const fetchSubordinateStats = async () => {
    try {
      // Get all subordinates
      const { data: subordinates, error: subError } = await supabase
        .from('profiles')
        .select('id, full_name, manager_id')
        .eq('manager_id', user.id);

      if (subError) throw subError;

      if (!subordinates?.length) {
        setLoading(false);
        return;
      }

      // Initialize stats for all grade levels
      const stats: SubordinateStats = {};
      grades.forEach(grade => {
        stats[grade.grade_level] = { count: 0, employees: [] };
      });

      // Get all goals for each subordinate
      for (const subordinate of subordinates) {
        const { data: subordinateGoals, error: goalsError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', subordinate.id);

        if (goalsError) throw goalsError;

        if (subordinateGoals && subordinateGoals.length > 0) {
          const score = calculatePerformanceScore(subordinateGoals);
          const gradeLevel = getGradeLevel(score, grades);
          
          if (gradeLevel && stats[gradeLevel]) {
            stats[gradeLevel].count++;
            stats[gradeLevel].employees.push(subordinate.full_name || 'Unnamed Employee');
          }
        }
      }

      setSubordinateStats(stats);
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

  const getGradeLevel = (score: number, grades: PerformanceGrade[]) => {
    const grade = grades.find(g => score >= g.min_score && score <= g.max_score);
    return grade?.grade_level;
  };

  const getGradeColor = (level: number) => {
    switch (level) {
      case 5: return 'bg-green-500';
      case 4: return 'bg-blue-500';
      case 3: return 'bg-yellow-500';
      case 2: return 'bg-orange-500';
      case 1: return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getGradeTextColor = (level: number) => {
    switch (level) {
      case 5: return 'text-green-700';
      case 4: return 'text-blue-700';
      case 3: return 'text-yellow-700';
      case 2: return 'text-orange-700';
      case 1: return 'text-red-700';
      default: return 'text-gray-700';
    }
  };

  const getGradeText = (level: number) => {
    const grade = grades.find(g => g.grade_level === level);
    return grade?.grade_text || `Level ${level}`;
  };

  const totalSubordinates = Object.values(subordinateStats).reduce((sum, stat) => sum + stat.count, 0);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    return <div className="text-center py-8">{t('goals.evaluation.manager.loading')}</div>;
  }

  if (totalSubordinates === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="h-6 w-6 text-gray-400" />
          <h2 className="text-lg font-medium text-gray-900">{t('goals.evaluation.manager.title')}</h2>
        </div>
        <p className="text-gray-500 text-center py-8">{t('goals.evaluation.manager.noData')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-2 mb-6">
        <BarChart3 className="h-6 w-6 text-gray-400" />
        <h2 className="text-lg font-medium text-gray-900">{t('goals.evaluation.manager.title')}</h2>
      </div>

      <div className="space-y-4">
        {Object.entries(subordinateStats)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([level, stats]) => {
            const percentage = (stats.count / totalSubordinates) * 100;
            return (
              <div key={level} className="relative">
                <div className="flex items-center mb-1">
                  <span className={`text-sm font-medium ${getGradeTextColor(Number(level))}`}>
                    {getGradeText(Number(level))}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({count} {count === 1 ? t('goals.evaluation.manager.employee') : t('goals.evaluation.manager.employees')})
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getGradeColor(Number(level))} transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-500 w-12 text-right">
                    {Math.round(percentage)}%
                  </span>
                </div>
                {stats.count > 0 && (
                  <div className="mt-1 text-xs text-gray-500">
                    {stats.employees.join(', ')}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}