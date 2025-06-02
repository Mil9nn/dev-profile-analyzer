// components/form/ProfileInput.tsx
interface ProfileInputProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  placeholder: string;
  register: any;
  error?: string;
  required?: boolean;
}

export const ProfileInput: React.FC<ProfileInputProps> = ({
  icon: Icon,
  label,
  placeholder,
  register,
  error,
  required = false
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Icon className="w-4 h-4 inline mr-2" />
        {label}
      </label>
      <input
        {...register}
        type="text"
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};
