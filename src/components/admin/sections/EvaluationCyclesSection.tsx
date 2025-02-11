import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import type { EvaluationCycle } from '../../../types/database';
import { CycleList } from '../CycleList';

interface EvaluationCyclesSectionProps {
  cycles: EvaluationCycle[];
  onCreateNew: () => void;
  onEdit: (cycle: EvaluationCycle) => void;
  onDelete: (cycle: EvaluationCycle) => void;
  onToggleStatus: (cycle: EvaluationCycle) => void;
}

export function EvaluationCyclesSection({
  cycles,
  onCreateNew,
  onEdit,
  onDelete,
  onToggleStatus
}: EvaluationCyclesSectionProps) {
  return (
    <div className="mt-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 rounded-lg p-2">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Evaluation Cycles</h1>
        </div>
        <button
          onClick={onCreateNew}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Evaluation Cycle
        </button>
      </div>

      <div className="mt-4">
        <CycleList
          cycles={cycles}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      </div>
    </div>
  );
}