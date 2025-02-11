import React from 'react';

interface OrganizationFormProps {
  formData: {
    name: string;
    slug: string;
    app_name: string;
  };
  onChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function OrganizationForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
}: OrganizationFormProps) {
  const handleSlugChange = (value: string) => {
    // Convert to lowercase and replace spaces with hyphens
    const slug = value.toLowerCase().replace(/\s+/g, '-');
    onChange('slug', slug);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Organization Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => {
            onChange('name', e.target.value);
            handleSlugChange(e.target.value);
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
          URL Slug
        </label>
        <input
          type="text"
          id="slug"
          value={formData.slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
          pattern="[a-z0-9-]+"
        />
        <p className="mt-1 text-sm text-gray-500">
          This will be used in URLs and cannot be changed later. Only lowercase letters, numbers, and hyphens are allowed.
        </p>
      </div>

      <div>
        <label htmlFor="app_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          App Name
        </label>
        <input
          type="text"
          id="app_name"
          value={formData.app_name}
          onChange={(e) => onChange('app_name', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="e.g., HR Performance"
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Custom name that will be displayed in the application header
        </p>
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
          {isSubmitting ? 'Creating...' : 'Create Organization'}
        </button>
      </div>
    </form>
  );
}