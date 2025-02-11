import React from 'react';
import { Circle, AlertCircle, Clock, CheckCircle, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { EvaluationCycle } from '../../types/database';

interface GoalFormProps {
  formData: {
    title: string;
    description: string;
    weight: number;
    evaluation_score: number;
    evaluation_notes: string;
    due_date: string;
    status: string;
    cycle_id: string;
  };
  evaluationCycles: EvaluationCycle[];
  onChange: (field: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isEditing: boolean;
}

export function GoalForm({
  formData,
  evaluationCycles,
  onChange,
  onSubmit,
  onCancel,
  onDelete,
  isEditing,
}: GoalFormProps) {
  const { role } = useAuth();
  const { t, i18n } = useTranslation();
  const canModifyEvaluation = role === 'manager' || role === 'company_admin' || role === 'hr_admin';

  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: AlertCircle, color: 'text-gray-500 bg-gray-100' },
    { value: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-yellow-800 bg-yellow-100' },
    { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'text-green-800 bg-green-100' },
  ];

  // Fordítás mentése az adatbázisba
  const saveTranslation = async (field: string, value: string) => {
    if (isEditing && formData.id) {
      await supabase.rpc('set_translation', {
        p_record_id: formData.id,
        p_table_name: 'goals',
        p_field_name: field,
        p_language: i18n.language,
        p_translation: value
      });
    }
  };

  const handleChange = async (field: string, value: string) => {
    onChange(field, value);
    if (field === 'title' || field === 'description') {
      await saveTranslation(field, value);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">{t('goals.form.title')}</label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">{t('goals.form.description')}</label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('goals.form.status')}</label>
        <div className="mt-1 grid grid-cols-3 gap-3">
          {statusOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange('status', option.value)}
                className={`flex items-center justify-center px-2 py-1 border text-xs rounded-md ${
                  formData.status === option.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('goals.form.weight')}</label>
        <input
          type="number"
          min="0"
          max="100"
          value={formData.weight}
          onChange={(e) => onChange('weight', parseInt(e.target.value) || 0)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          required
        />
      </div>

      {/* Only show evaluation fields when editing */}
      {isEditing && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('goals.form.evaluationScore')}
              {!canModifyEvaluation && (
                <span className="ml-2 text-sm text-gray-500">
                  {t('goals.form.onlyManagersCanModify')}
                </span>
              )}
            </label>
            <div className="mt-2 flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => canModifyEvaluation && onChange('evaluation_score', score)}
                  className={`p-1 rounded-full ${
                    !canModifyEvaluation ? 'cursor-not-allowed opacity-50' : 
                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  } ${
                    formData.evaluation_score >= score ? 'text-green-500' : 'text-gray-300'
                  }`}
                  disabled={!canModifyEvaluation}
                >
                  <Circle className="h-6 w-6 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* Evaluation Notes - Only visible to managers when editing */}
          {canModifyEvaluation && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('goals.form.evaluationNotes')}
                <span className="ml-2 text-sm text-gray-500">
                  {t('goals.form.onlyVisibleToManagers')}
                </span>
              </label>
              <textarea
                value={formData.evaluation_notes || ''}
                onChange={(e) => onChange('evaluation_notes', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                rows={3}
                placeholder={t('goals.form.addEvaluationNotes')}
              />
            </div>
          )}
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('goals.form.dueDate')}</label>
        <input
          type="date"
          value={formData.due_date}
          onChange={(e) => onChange('due_date', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
        />
      </div>
      <div>
        <label htmlFor="cycle_id" className="block text-sm font-medium text-gray-700">
          {t('goals.form.evaluationCycle')}
        </label>
        <select
          id="cycle_id"
          value={formData.cycle_id}
          onChange={(e) => onChange('cycle_id', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">{t('goals.form.selectCycle')}</option>
          {evaluationCycles
            .filter(cycle => cycle.status === 'active')
            .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
            .map(cycle => (
              <option key={cycle.id} value={cycle.id}>
                {cycle.name} ({new Date(cycle.start_date).toLocaleDateString()} - {new Date(cycle.end_date).toLocaleDateString()})
              </option>
            ))}
        </select>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-2 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            {t('goals.form.cancel')}
          </button>
          {isEditing && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="px-2 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 inline-flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('goals.form.deleteGoal')}
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-2 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isEditing ? t('goals.form.update') : t('goals.form.create')}
        </button>
      </div>
    </form>
  );
}