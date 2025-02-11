import React, { useState, useEffect } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import * as XLSX from 'xlsx';
import type { EvaluationCycle, Profile } from '../../../types/database';

interface DownloadResultsProps {
  organizationId?: string;
}

export function DownloadResultsSection({ organizationId }: DownloadResultsProps) {
  const { role } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [cycles, setCycles] = useState<EvaluationCycle[]>([]);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');

  useEffect(() => {
    fetchCycles();
    fetchEmployees();
  }, [organizationId]);

  const fetchCycles = async () => {
    try {
      const { data, error } = await supabase
        .from('evaluation_cycles')
        .select('*')
        .eq('organization_id', organizationId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setCycles(data || []);
      if (data && data.length > 0) {
        setSelectedCycleId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching cycles:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', organizationId)
        .order('full_name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleDownload = async () => {
    if (!selectedCycleId) {
      alert('Please select an evaluation cycle');
      return;
    }

    try {
      setDownloading(true);

      // Fetch employees based on selection
      let employeesQuery = supabase
        .from('profiles')
        .select('*, manager:manager_id(full_name)')
        .eq('organization_id', organizationId);

      // Add employee filter if specific employee is selected
      if (selectedEmployeeId !== 'all') {
        employeesQuery = employeesQuery.eq('id', selectedEmployeeId);
      }

      const { data: employees, error: employeesError } = await employeesQuery;

      if (employeesError) throw employeesError;

      // Prepare data array for Excel
      const excelData = [];

      // Process each employee
      for (const employee of employees) {
        // Fetch employee's goals for the selected cycle
        const { data: goals, error: goalsError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', employee.id)
          .eq('cycle_id', selectedCycleId);

        if (goalsError) throw goalsError;

        // Calculate total grade
        const totalWeight = goals?.reduce((sum, goal) => sum + (goal.weight || 0), 0) || 0;
        const totalGrade = goals?.reduce((sum, goal) => {
          const normalizedScore = ((goal.evaluation_score || 1) / 5) * 100;
          return sum + (normalizedScore * (goal.weight || 0) / totalWeight);
        }, 0) || 0;

        // Add each goal as a row
        if (goals && goals.length > 0) {
          goals.forEach(goal => {
            excelData.push({
              'Employee Name': employee.full_name || 'N/A',
              'Employee Email': employee.email || 'N/A',
              'Department': employee.department || 'N/A',
              'Job Title': employee.job_name || 'N/A',
              'Manager Name': employee.manager?.full_name || 'N/A',
              'Goal Title': goal.title,
              'Goal Description': goal.description || '',
              'Goal Status': goal.status,
              'Goal Weight': `${goal.weight}%`,
              'Evaluation Score': goal.evaluation_score ? `${goal.evaluation_score}/5` : 'Not evaluated',
              'Evaluation Notes': goal.evaluation_notes || '',
              'Due Date': goal.due_date ? new Date(goal.due_date).toLocaleDateString() : 'No due date',
              'Total Grade': `${Math.round(totalGrade)}%`,
              'Created At': new Date(goal.created_at).toLocaleDateString(),
              'Last Updated': new Date(goal.updated_at).toLocaleDateString()
            });
          });
        } else {
          // Add employee with no goals
          excelData.push({
            'Employee Name': employee.full_name || 'N/A',
            'Employee Email': employee.email || 'N/A',
            'Department': employee.department || 'N/A',
            'Job Title': employee.job_name || 'N/A',
            'Manager Name': employee.manager?.full_name || 'N/A',
            'Goal Title': 'No goals set',
            'Goal Description': '',
            'Goal Status': '',
            'Goal Weight': '',
            'Evaluation Score': '',
            'Evaluation Notes': '',
            'Due Date': '',
            'Total Grade': '',
            'Created At': '',
            'Last Updated': ''
          });
        }
      }

      // Get cycle information
      const selectedCycle = cycles.find(c => c.id === selectedCycleId);
      const cycleName = selectedCycle ? selectedCycle.name : 'performance-results';
      
      // Get employee information for filename
      const employeePart = selectedEmployeeId === 'all' ? 'all_employees' : 
        employees[0]?.full_name?.toLowerCase().replace(/\s+/g, '_') || 'employee';

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Performance Results');

      // Generate Excel file
      const currentDate = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `${cycleName}_${employeePart}_${currentDate}.xlsx`);

    } catch (error) {
      console.error('Error downloading results:', error);
      alert('Failed to download results. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (!organizationId && role !== 'superadmin') {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-100 rounded-lg p-2">
            <Download className="h-6 w-6 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Download Results</h1>
        </div>
      </div>

      <div className="mt-4 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="max-w-3xl">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Export Performance Data</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Download a comprehensive Excel report containing all employee goals, evaluations, and performance metrics.
            The report includes employee details, manager information, goal statuses, evaluation scores, and more.
          </p>
          
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="cycle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Evaluation Cycle
              </label>
              <select
                id="cycle"
                value={selectedCycleId}
                onChange={(e) => setSelectedCycleId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {cycles.map(cycle => (
                  <option key={cycle.id} value={cycle.id}>
                    {cycle.name} ({new Date(cycle.start_date).toLocaleDateString()} - {new Date(cycle.end_date).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="employee" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Employee
              </label>
              <select
                id="employee"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Employees</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.full_name || employee.email || 'Unnamed Employee'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                onClick={handleDownload}
                disabled={downloading || !selectedCycleId}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Preparing Download...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Excel Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}