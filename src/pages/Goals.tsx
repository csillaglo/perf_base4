import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Goal, EvaluationCycle } from '../types/database';
import { GoalList } from '../components/goals/GoalList';
import { GoalForm } from '../components/goals/GoalForm';
import { Modal } from '../components/admin/Modal';
import { useCycleStore } from '../stores/cycleStore';

interface GoalsProps {
  title?: string;
}

interface SummaryEvaluation {
  id: string;
  user_id: string;
  cycle_id: string;
  summary: string;
  suggestions: string;
  created_at: string;
  updated_at: string;
}

export function Goals({ title }: GoalsProps) {
  const { t } = useTranslation();
  const { user, role } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [evaluationCycles, setEvaluationCycles] = useState<EvaluationCycle[]>([]);
  const { selectedCycleId, setSelectedCycleId } = useCycleStore();
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    weight: 0,
    evaluation_score: 1,
    due_date: '',
    status: 'pending',
    cycle_id: '',
  });
  const [summaryEvaluation, setSummaryEvaluation] = useState<SummaryEvaluation | null>(null);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [summaryForm, setSummaryForm] = useState({
    summary: '',
    suggestions: ''
  });

  const canEditSummary = role === 'manager' || role === 'company_admin' || role === 'hr_admin';

  useEffect(() => {
    fetchGoals();
    fetchEvaluationCycles();
  }, [selectedCycleId]);

  useEffect(() => {
    if (selectedCycleId) {
      fetchSummaryEvaluation();
    }
  }, [selectedCycleId]);

  useEffect(() => {
    if (evaluationCycles.length > 0 && !selectedCycleId) {
      setSelectedCycleId(evaluationCycles[0].id);
    }
  }, [evaluationCycles]);

  const fetchSummaryEvaluation = async () => {
    try {
      const { data, error } = await supabase
        .from('summary_evaluations')
        .select('*')
        .eq('user_id', user.id)
        .eq('cycle_id', selectedCycleId)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no rows gracefully

      if (error) throw error;
      
      setSummaryEvaluation(data);
      if (data) {
        setSummaryForm({
          summary: data.summary || '',
          suggestions: data.suggestions || ''
        });
      } else {
        // Reset form when no summary exists
        setSummaryForm({
          summary: '',
          suggestions: ''
        });
      }
    } catch (error) {
      console.error('Error fetching summary evaluation:', error);
    }
  };

  const handleSaveSummary = async () => {
    try {
      const { data, error } = await supabase
        .from('summary_evaluations')
        .upsert({
          user_id: user.id,
          cycle_id: selectedCycleId,
          summary: summaryForm.summary,
          suggestions: summaryForm.suggestions,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      setSummaryEvaluation(data);
      setIsEditingSummary(false);
    } catch (error) {
      console.error('Error saving summary evaluation:', error);
    }
  };

  const fetchEvaluationCycles = async () => {
    try {
      const { data, error } = await supabase
        .from('evaluation_cycles')
        .select('*')
        .eq('status', 'active')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setEvaluationCycles(data || []);

      if (data && data.length > 0 && !isEditing) {
        setEditForm(prev => ({ ...prev, cycle_id: data[0].id }));
      }
    } catch (err) {
      console.error('Error fetching evaluation cycles:', err);
    }
  };

  const fetchGoals = async () => {
    try {
      let query = supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);

      if (selectedCycleId) {
        query = query.eq('cycle_id', selectedCycleId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (err) {
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setEditForm({
      title: goal.title,
      description: goal.description || '',
      weight: goal.weight || 0,
      evaluation_score: goal.evaluation_score || 1,
      due_date: goal.due_date || '',
      status: goal.status || 'pending',
      cycle_id: goal.cycle_id || '',
    });
    setIsEditing(true);
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([{
          title: editForm.title,
          description: editForm.description,
          weight: editForm.weight,
          evaluation_score: 1,
          due_date: editForm.due_date || null,
          user_id: user.id,
          status: editForm.status,
          cycle_id: editForm.cycle_id || null
        }])
        .select()
        .single();

      if (error) throw error;

      setGoals([data, ...goals]);
      setIsEditing(false);
      setSelectedGoal(null);
      setEditForm({
        title: '',
        description: '',
        weight: 0,
        evaluation_score: 1,
        due_date: '',
        status: 'pending',
        cycle_id: ''
      });
    } catch (err) {
      console.error('Error creating goal:', err);
    }
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;

    try {
      const { error } = await supabase
        .from('goals')
        .update({
          title: editForm.title,
          description: editForm.description,
          weight: editForm.weight,
          evaluation_score: editForm.evaluation_score,
          due_date: editForm.due_date || null,
          status: editForm.status,
          cycle_id: editForm.cycle_id || null
        })
        .eq('id', selectedGoal.id);

      if (error) throw error;

      setGoals(goals.map(g => 
        g.id === selectedGoal.id 
          ? { ...g, ...editForm }
          : g
      ));
      setIsEditing(false);
      setSelectedGoal(null);
    } catch (err) {
      console.error('Error updating goal:', err);
    }
  };

  const handleDeleteGoal = async () => {
    if (!selectedGoal) return;

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', selectedGoal.id)
        .throwOnError();

      if (error) throw error;

      await fetchGoals();
      setShowDeleteConfirm(false);
      setIsEditing(false);
      setSelectedGoal(null);
    } catch (err) {
      console.error('Error deleting goal:', err);
    }
  };

  const handleNewGoal = () => {
    setSelectedGoal(null);
    setEditForm({
      title: '',
      description: '',
      weight: 0,
      evaluation_score: 1,
      due_date: '',
      status: 'pending',
      cycle_id: evaluationCycles.length > 0 ? evaluationCycles[0].id : '',
    });
    setIsEditing(true);
  };

  const calculateTotalWeight = () => {
    return goals.reduce((total, goal) => total + (goal.weight || 0), 0);
  };

  if (loading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {title || t('goals.pageTitle')}
        </h1>
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('goals.form.evaluationCycle')}
            </span>
            <select
              value={selectedCycleId}
              onChange={(e) => {
                setSelectedCycleId(e.target.value);
                fetchGoals();
              }}
              className="block min-w-[300px] rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 h-11 py-2.5"
              required
            >
              {evaluationCycles
                .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
                .map(cycle => (
                  <option key={cycle.id} value={cycle.id}>
                    {cycle.name}
                  </option>
                ))}
            </select>
          </div>
          <button
            onClick={handleNewGoal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('goals.form.create')}
          </button>
        </div>
      </div>

      <GoalList
        goals={goals}
        onGoalClick={handleGoalClick}
        totalWeight={calculateTotalWeight()}
      />

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('goals.evaluation.summary')}
          </h2>
          {canEditSummary && (
            <button
              onClick={() => setIsEditingSummary(!isEditingSummary)}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isEditingSummary ? t('common.cancel') : t('common.edit')}
            </button>
          )}
        </div>

        {isEditingSummary ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('goals.evaluation.overallEvaluation')}
              </label>
              <textarea
                value={summaryForm.summary}
                onChange={(e) => setSummaryForm(prev => ({ ...prev, summary: e.target.value }))}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder={t('goals.form.addEvaluationNotes')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('goals.evaluation.furtherSuggestions')}
              </label>
              <textarea
                value={summaryForm.suggestions}
                onChange={(e) => setSummaryForm(prev => ({ ...prev, suggestions: e.target.value }))}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder={t('goals.form.addEvaluationNotes')}
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSaveSummary}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('goals.evaluation.overallEvaluation')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {summaryEvaluation?.summary || t('goals.evaluation.noEvaluationProvided')}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('goals.evaluation.furtherSuggestions')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {summaryEvaluation?.suggestions || t('goals.evaluation.noSuggestionsProvided')}
              </p>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isEditing}
        onClose={() => {
          setIsEditing(false);
          setSelectedGoal(null);
        }}
        title={selectedGoal ? t('goals.form.update') : t('goals.form.create')}
      >
        <GoalForm
          formData={editForm}
          evaluationCycles={evaluationCycles}
          onChange={(field, value) => setEditForm(prev => ({ ...prev, [field]: value }))}
          onSubmit={selectedGoal ? handleUpdateGoal : handleCreateGoal}
          onCancel={() => {
            setIsEditing(false);
            setSelectedGoal(null);
          }}
          onDelete={() => setShowDeleteConfirm(true)}
          isEditing={!!selectedGoal}
        />
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={t('goals.form.deleteGoal')}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {t('goals.evaluation.deleteConfirmation')}
          </p>
          {selectedGoal && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-900">{selectedGoal.title}</h3>
              {selectedGoal.description && (
                <p className="mt-1 text-sm text-gray-500">{selectedGoal.description}</p>
              )}
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleDeleteGoal}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {t('goals.form.deleteGoal')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
