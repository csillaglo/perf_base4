import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useCycleStore } from '../stores/cycleStore';
import { supabase } from '../lib/supabase';
import type { Goal, PerformanceGrade } from '../types/database';
import { WelcomeMessage } from '../components/WelcomeMessage';
import { SubordinateGradeChart } from '../components/performance/SubordinateGradeChart';
import { OwnPerformanceOverview } from '../components/dashboard/OwnPerformanceOverview';
import { SuperAdminOverview } from '../components/dashboard/SuperAdminOverview';
import { ManagerOverview } from '../components/dashboard/ManagerOverview';

interface DashboardStats {
  totalOrganizations: number;
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalAdmins: number;
  totalManagers: number;
  totalEmployees: number;
  organizationsWithoutAdmins: number;
}

export function Dashboard() {
  const { t } = useTranslation();
  const { user, role } = useAuth();
  const { selectedCycleId } = useCycleStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [grades, setGrades] = useState<PerformanceGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0,
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalAdmins: 0,
    totalManagers: 0,
    totalEmployees: 0,
    organizationsWithoutAdmins: 0,
  });

  useEffect(() => {
    if (role === 'superadmin') {
      fetchSuperadminData();
    } else {
      fetchWelcomeMessage();
      if (selectedCycleId) {
        fetchData();
      }
    }
  }, [selectedCycleId, user?.organization_id]);

  const fetchWelcomeMessage = async () => {
    if (!user?.organization_id) return;

    try {
      const { data, error } = await supabase
        .from('welcome_messages')
        .select('content')
        .eq('organization_id', user.organization_id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setWelcomeMessage(data?.content || '');
    } catch (err) {
      console.error('Error fetching welcome message:', err);
    }
  };

  const fetchSuperadminData = async () => {
    try {
      setLoading(true);
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('*');

      if (orgsError) throw orgsError;

      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*');

      if (usersError) throw usersError;

      const activeUsers = users.filter(u => u.status === 'active');
      const inactiveUsers = users.filter(u => u.status === 'inactive');
      const admins = users.filter(u => u.role === 'company_admin');
      const managers = users.filter(u => u.role === 'manager');
      const employees = users.filter(u => u.role === 'employee');

      const orgsWithoutAdmins = orgs.filter(org => 
        !admins.some(admin => admin.organization_id === org.id)
      ).length;

      setStats({
        totalOrganizations: orgs.length,
        totalUsers: users.length,
        activeUsers: activeUsers.length,
        inactiveUsers: inactiveUsers.length,
        totalAdmins: admins.length,
        totalManagers: managers.length,
        totalEmployees: employees.length,
        organizationsWithoutAdmins: orgsWithoutAdmins,
      });
    } catch (error) {
      console.error('Error fetching superadmin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchGoals(), fetchGrades()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    try {
      if (!selectedCycleId) return;

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('cycle_id', selectedCycleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (err) {
      console.error('Error fetching goals:', err);
    }
  };

  const fetchGrades = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_performance_grades', {
          org_id: user.organization_id || null
        });

      if (error) throw error;
      setGrades(data || []);
    } catch (error) {
      console.error('Error fetching performance grades:', error);
      setGrades([
        { id: '1', organization_id: null, min_score: 0, max_score: 20, grade_text: 'Unsatisfactory', grade_level: 1, created_at: '', updated_at: '' },
        { id: '2', organization_id: null, min_score: 21, max_score: 40, grade_text: 'Weak', grade_level: 2, created_at: '', updated_at: '' },
        { id: '3', organization_id: null, min_score: 41, max_score: 60, grade_text: 'Normal', grade_level: 3, created_at: '', updated_at: '' },
        { id: '4', organization_id: null, min_score: 61, max_score: 80, grade_text: 'Good', grade_level: 4, created_at: '', updated_at: '' },
        { id: '5', organization_id: null, min_score: 81, max_score: 100, grade_text: 'Excellent', grade_level: 5, created_at: '', updated_at: '' },
      ]);
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

  if (role === 'superadmin') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('admin.systemOverview')}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('common.welcomeBack', { name: user?.full_name || user?.email })}
          </p>
        </div>

        <SuperAdminOverview stats={stats} />
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('common.dashboard')}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('common.welcomeBack', { name: user?.full_name || user?.email })}
        </p>
      </div>

      {/* Welcome Message */}
      {welcomeMessage && (
        <div>
          <WelcomeMessage message={welcomeMessage} />
        </div>
      )}

      {/* Manager Overview Section */}
      {role === 'manager' && (
        <ManagerOverview grades={grades} />
      )}

      {/* Own Performance Overview Section */}
      <OwnPerformanceOverview
        goals={goals}
        performanceScore={performanceScore}
        gradeInfo={gradeInfo}
      />
    </div>
  );
}