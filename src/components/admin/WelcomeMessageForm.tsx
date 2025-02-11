import React from 'react';

interface WelcomeMessageFormProps {
  content: string;
  onChange: (content: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function WelcomeMessageForm({
  content,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
}: WelcomeMessageFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Welcome Message
        </label>
        <p className="mt-1 text-sm text-gray-500">
          This message will be displayed at the top of the dashboard for all users in your organization.
        </p>
        <textarea
          id="content"
          rows={6}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter your organization's welcome message..."
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Message'}
        </button>
      </div>
    </form>
  );
}