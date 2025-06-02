// components/form/RepositoryInput.tsx
import React from 'react';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import type { FormData } from '../../types/analysis';

interface RepositoryInputProps {
  repositories: string[];
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export const RepositoryInput: React.FC<RepositoryInputProps> = ({
  repositories,
  register,
  errors,
  onAdd,
  onRemove
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Repositories to Analyze (Max 3)
      </label>
      {repositories.map((_, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <input
            {...register(`repositories.${index}` as const)}
            type="text"
            placeholder="repository-name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {repositories.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      {repositories.length < 3 && (
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
        >
          <Plus className="w-4 h-4" />
          Add Repository
        </button>
      )}
    </div>
  );
};
