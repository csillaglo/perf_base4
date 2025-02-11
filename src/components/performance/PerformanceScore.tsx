import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Goal, PerformanceGrade } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface PerformanceScoreProps {
  goals: Goal[];
}

export function PerformanceScore({ goals }: PerformanceScoreProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [grades, setGrades] = useState<PerformanceGrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, [user?.organization_id]); // Add dependency on organization_id

  const fetchGrades = async () => {
    try {
      // Get default grades first
      const { data: defaultGrades, error: defaultError } = await supabase
        .from('performance_grades')
        .select('*')
        .is('organization_id', null)
        .order('min_score');

      if (defaultError) throw defaultError;

      // If user has an organization, try to get organization-specific grades
      if (user?.organization_id) {
        const { data: orgGrades, error: orgError } = await supabase
          .from('performance_grades')
          .select('*')
          .eq('organization_id', user.organization_id)
          .order('min_score');

        if (!orgError && orgGrades?.length > 0) {
          setGrades(orgGrades);
          return;
        }
      }

      // Fall back to default grades
      setGrades(defaultGrades || []);
    } catch (error) {
      console.error('Error fetching performance grades:', error);
      // Set default grades in case of error
      setGrades([
        { id: '1', organization_id: null, min_score: 0, max_score: 20, grade_text: 'Unsatisfactory', grade_level: 1, created_at: '', updated_at: '' },
        { id: '2', organization_id: null, min_score: 21, max_score: 40, grade_text: 'Weak', grade_level: 2, created_at: '', updated_at: '' },
        { id: '3', organization_id: null, min_score: 41, max_score: 60, grade_text: 'Normal', grade_level: 3, created_at: '', updated_at: '' },
        { id: '4', organization_id: null, min_score: 61, max_score: 80, grade_text: 'Good', grade_level: 4, created_at: '', updated_at: '' },
        { id: '5', organization_id: null, min_score: 81, max_score: 100, grade_text: 'Excellent', grade_level: 5, created_at: '', updated_at: '' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const calculateWeightedScore = () => {
    const totalWeight = goals.reduce((sum, goal) => sum + (goal.weight || 0), 0);
    let weightedScore = 0;

    if (totalWeight > 0) {
      weightedScore = goals.reduce((sum, goal) => {
        const normalizedScore = ((goal.evaluation_score || 1) / 5) * 100;
        return sum + (normalizedScore * (goal.weight || 0) / totalWeight);
      }, 0);
    }

    return Math.round(weightedScore);
  };

  const getGradeInfo = (score: number) => {
    const grade = grades.find(g => score >= g.min_score && score <= g.max_score);
    return grade || { grade_text: 'Not Rated', grade_level: 0 };
  };

  const performanceScore = calculateWeightedScore();
  const gradeInfo = getGradeInfo(performanceScore);

  const getScoreColor = (score: number) => {
    if (score >= 81) return 'text-green-600';
    if (score >= 61) return 'text-blue-600';
    if (score >= 41) return 'text-yellow-600';
    if (score >= 21) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return <div className="bg-white rounded-lg shadow p-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-16 bg-gray-200 rounded"></div>
    </div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('goals.evaluation.performance.title')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('goals.evaluation.performance.subtitle')}</p>
        </div>

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
          <div className="overflow-hidden bg-gray-50 dark:bg-gray-700 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
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
                {grades.map((grade) => (
                  <tr key={grade.id} className={performanceScore >= grade.min_score && performanceScore <= grade.max_score ? 'bg-indigo-50 dark:bg-indigo-900/50' : ''}>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                      {grade.min_score}-{grade.max_score}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                      {grade.grade_text}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                      {grade.grade_level}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}