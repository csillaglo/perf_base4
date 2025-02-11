import React from 'react';
import { MessageSquare } from 'lucide-react';

interface WelcomeMessageProps {
  message: string;
}

export function WelcomeMessage({ message }: WelcomeMessageProps) {
  if (!message) return null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="bg-blue-100 rounded-lg p-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="prose dark:prose-invert max-w-none">
            {message}
          </div>
        </div>
      </div>
    </div>
  );
}