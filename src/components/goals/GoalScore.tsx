import React from 'react';
import { Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface GoalScoreProps {
  score: number;
}

export function GoalScore({ score }: GoalScoreProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center">
      <div className="flex space-x-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <Circle
            key={index}
            className={`h-4 w-4 ${
              index < score
                ? 'text-green-500 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      <span className="ml-2 text-sm font-medium text-gray-700">
        {t('goals.evaluation.score')}: {score}/5
      </span>
    </div>
  );
}