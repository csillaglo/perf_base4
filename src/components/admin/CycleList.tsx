import React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { EvaluationCycle } from '../../types/database';

interface CycleListProps {
  cycles: EvaluationCycle[];
  onEdit: (cycle: EvaluationCycle) => void;
  onDelete: (cycle: EvaluationCycle) => void;
  onToggleStatus: (cycle: EvaluationCycle) => void;
}

export function CycleList({ 
  cycles, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: CycleListProps) {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t('admin.cycles.table.name')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t('admin.cycles.table.startDate')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t('admin.cycles.table.endDate')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t('admin.cycles.table.status')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t('admin.cycles.table.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
          {cycles.map((cycle) => (
            <tr key={cycle.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {cycle.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {new Date(cycle.start_date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {new Date(cycle.end_date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  cycle.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {cycle.status === 'active' 
                    ? t('admin.cycles.activated') 
                    : t('admin.cycles.deactivated')
                  }
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                <button 
                  onClick={() => onEdit(cycle)}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-600"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => onDelete(cycle)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => onToggleStatus(cycle)}
                  className={`${
                    cycle.status === 'active' 
                      ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-600' 
                      : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-600'
                  }`}
                >
                  {cycle.status === 'active' ? (
                    <ToggleRight className="h-5 w-5" />
                  ) : (
                    <ToggleLeft className="h-5 w-5" />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}