import { AlertTriangle } from "lucide-react";

interface ErrorMessageProps {
  error: string;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <div className="mt-6 p-4 rounded-xl">
      <div className="flex items-center gap-2 text-red-400">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm">{error}</span>
      </div>
    </div>
  );
}