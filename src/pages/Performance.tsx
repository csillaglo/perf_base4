import React, { useEffect, useState } from 'react';
import { Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCycleStore } from '../stores/cycleStore';
import type { Goal } from '../types/database';
import type { PerformanceGrade } from '../types/database';
import { PerformanceScore } from '../components/performance/PerformanceScore';
import { PerformanceMetrics } from '../components/performance/PerformanceMetrics';
import { GoalImpactList } from '../components/performance/GoalImpactList';
import { generatePerformanceReport } from '../components/performance/PerformanceReport';

export function Performance() {
  const { user } = useAuth();
  const { selectedCycleId } = useCycleStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [grades, setGrades] = useState<PerformanceGrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedCycleId) {
      Promise.all([fetchGoals(), fetchGrades()]);
    }
  }, [selectedCycleId]);

  const fetchGrades = async () => {
    try {
      const { data, error } = await supabase
        .from('performance_grades')
        .select('*')
        .order('min_score');

      if (error) throw error;
      setGrades(data || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
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

  const handleDownloadReport = () => {
    const performanceScore = calculateWeightedScore();
    const gradeInfo = getGradeInfo(performanceScore);
    
    generatePerformanceReport({
      user,
      goals,
      performanceScore,
      gradeText: gradeInfo.grade_text,
      gradeLevel: gradeInfo.grade_level,
    });
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading performance data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Performance Score</h1>
        <div className="flex space-x-3">
          <button 
            onClick={handleDownloadReport}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Award className="h-4 w-4 mr-2" />
            Download Report
          </button>
        </div>
      </div>

      <PerformanceScore goals={goals} />
      <PerformanceMetrics goals={goals} />
      <GoalImpactList goals={goals} />
    </div>
  );
}