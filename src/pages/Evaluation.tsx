import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Profile, Goal, EvaluationStatus } from '../types/database';

interface UserWithEmail extends Profile {
  email: string;
  average_score?: number;
  evaluation_status?: EvaluationStatus;
}

export function Evaluation() {
  const { t } = useTranslation();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [subordinates, setSubordinates] = useState<UserWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubordinates();
  }, []);

  const fetchSubordinates = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('status', 'active');  // Only fetch active users

      // If HR admin, get all users from the organization
      if (role === 'hr_admin') {
        query = query.eq('organization_id', user.organization_id);
      } else {
        // For managers, only get their direct reports
        query = query.eq('manager_id', user.id);
      }

      const { data: profiles, error: profilesError } = await query;

      if (profilesError) throw profilesError;

      // Get emails for subordinates
      const { data: emailData, error: emailsError } = await supabase
        .rpc('get_user_emails');

      if (emailsError) throw emailsError;

      // Create email map
      const emailMap = new Map(emailData.map((item: any) => [item.id, item.email]));

      // Get goals for all subordinates
      const { data: allGoals, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .in('user_id', (profiles || []).map(p => p.id));

      if (goalsError) throw goalsError;

      // Calculate average scores and get latest evaluation status
      const scoreMap = new Map();
      const statusMap = new Map();
      if (allGoals) {
        // Group goals by user
        const goalsByUser = allGoals.reduce((acc, goal) => {
          if (!acc.has(goal.user_id)) {
            acc.set(goal.user_id, []);
          }
          acc.get(goal.user_id).push(goal);
          return acc;
        }, new Map<string, Goal[]>());

        // Calculate weighted average for each user
        for (const [userId, userGoals] of goalsByUser.entries()) {
          const totalWeight = userGoals.reduce((sum, goal) => sum + (goal.weight || 0), 0);
          if (totalWeight > 0) {
            const weightedScore = userGoals.reduce((sum, goal) => {
              const normalizedScore = ((goal.evaluation_score || 1) / 5) * 100;
              return sum + (normalizedScore * (goal.weight || 0) / totalWeight);
            }, 0);
            scoreMap.set(userId, Math.round(weightedScore));
          }

          // Track the latest evaluation status
          statusMap.set(userId, userGoals[0]?.evaluation_status || 'awaiting_goal_setting');
        }
      }

      // Combine profiles with emails, scores, and status
      const subordinatesWithData = (profiles || []).map(profile => ({
        ...profile,
        email: emailMap.get(profile.id) || 'No email',
        average_score: scoreMap.get(profile.id),
        evaluation_status: statusMap.get(profile.id) || 'awaiting_goal_setting'
      }));

      setSubordinates(subordinatesWithData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: EvaluationStatus) => {
    switch (status) {
      case 'awaiting_goal_setting':
        return 'text-gray-600 bg-gray-100';
      case 'awaiting_evaluation':
        return 'text-yellow-800 bg-yellow-100';
      case 'awaiting_approval':
        return 'text-blue-800 bg-blue-100';
      case 'finalized':
        return 'text-green-800 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatStatus = (status: EvaluationStatus) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return <div className="text-center py-8">{t('admin.evaluation.loading')}</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {t('common.error')}: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-indigo-100 rounded-lg p-2">
          <Users className="h-6 w-6 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">{t('admin.evaluation.subordinates')}</h1>
      </div>

      {subordinates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {t('admin.evaluation.noTeamMembers')}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('profile.department')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('goals.evaluation.score')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.evaluation.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subordinates.map((subordinate) => (
                <tr 
                  key={subordinate.id}
                  onClick={() => navigate(`/evaluation/${subordinate.id}`)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {subordinate.full_name || t('common.noNameSet')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{subordinate.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {subordinate.department || '-'}
                      {subordinate.job_name && (
                        <div className="text-xs text-gray-400">
                          {subordinate.job_name}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {subordinate.average_score !== undefined ? (
                      <div className={`text-sm font-medium ${
                        subordinate.average_score >= 80 ? 'text-green-600' :
                        subordinate.average_score >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {subordinate.average_score}%
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">
                        {t('goals.noGoals')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusColor(subordinate.evaluation_status || 'awaiting_goal_setting')
                    }`}>
                      {formatStatus(subordinate.evaluation_status || 'awaiting_goal_setting')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end">
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}