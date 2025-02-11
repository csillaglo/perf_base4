import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Goal } from '../../types/database';

interface GoalRadarChartProps {
  goals: Goal[];
}

export function GoalRadarChart({ goals }: GoalRadarChartProps) {
  const { t } = useTranslation();

  // Calculate normalized scores (0-100) for each goal
  const goalScores = goals.map(goal => ({
    name: goal.title,
    score: ((goal.evaluation_score || 1) / 5) * 100,
    weight: goal.weight || 0
  }));

  // Sort by weight to show most important goals first
  goalScores.sort((a, b) => b.weight - a.weight);

  // Calculate chart dimensions
  const size = 300;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size / 2) - 40; // Leave margin for labels
  const numPoints = goalScores.length;
  const angleStep = (2 * Math.PI) / numPoints;

  // Calculate points for the radar chart
  const points = goalScores.map((goal, i) => {
    const angle = i * angleStep - Math.PI / 2; // Start from top
    const distance = (goal.score / 100) * radius;
    return {
      x: centerX + distance * Math.cos(angle),
      y: centerY + distance * Math.sin(angle),
      labelX: centerX + (radius + 25) * Math.cos(angle),
      labelY: centerY + (radius + 25) * Math.sin(angle),
      ...goal
    };
  });

  // Generate grid circles
  const gridCircles = [20, 40, 60, 80, 100].map(percent => {
    const r = (percent / 100) * radius;
    return {
      r,
      percent
    };
  });

  // Generate SVG path for the radar shape
  const shapePath = points
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x},${point.y}`)
    .join(' ') + ' Z';

  // Generate grid lines
  const gridLines = points.map((point, i) => ({
    x1: centerX,
    y1: centerY,
    x2: centerX + radius * Math.cos(i * angleStep - Math.PI / 2),
    y2: centerY + radius * Math.sin(i * angleStep - Math.PI / 2)
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('goals.evaluation.radar.title')}</h2>
      <div className="flex justify-center">
        <svg width={size} height={size} className="overflow-visible">
          {/* Grid circles */}
          {gridCircles.map(({ r, percent }) => (
            <circle
              key={r}
              cx={centerX}
              cy={centerY}
              r={r}
              fill="none"
              stroke="currentColor"
              className="text-gray-200 dark:text-gray-700"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Grid lines */}
          {gridLines.map((line, i) => (
            <line
              key={i}
              {...line}
              stroke="currentColor"
              className="text-gray-200 dark:text-gray-700"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Data shape */}
          <path
            d={shapePath}
            fill="currentColor"
            className="text-indigo-500/20 dark:text-indigo-400/20"
            stroke="currentColor"
            className="text-indigo-500 dark:text-indigo-400"
            strokeWidth="2"
          />

          {/* Data points */}
          {points.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="4"
              className="fill-indigo-500 dark:fill-indigo-400"
            />
          ))}

          {/* Labels */}
          {points.map((point, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const alignRight = Math.cos(angle) > 0;
            const alignBottom = Math.sin(angle) > 0;
            
            return (
              <g key={i}>
                <text
                  x={point.labelX}
                  y={point.labelY}
                  textAnchor={alignRight ? 'start' : 'end'}
                  dominantBaseline={alignBottom ? 'hanging' : 'auto'}
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                >
                  {point.name} ({t('goals.evaluation.radar.weight')}: {point.weight}%)
                </text>
              </g>
            );
          })}

          {/* Score labels on circles */}
          {gridCircles.map(({ r, percent }) => (
            <text
              key={r}
              x={centerX}
              y={centerY - r}
              textAnchor="middle"
              dominantBaseline="auto"
              className="text-xs fill-gray-400 dark:fill-gray-600"
            >
              {percent}%
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}