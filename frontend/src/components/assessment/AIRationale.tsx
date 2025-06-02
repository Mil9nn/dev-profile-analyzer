// components/assessment/AIRationale.tsx
import { Brain } from 'lucide-react';

interface AIRationaleProps {
  rationale: string[];
}

export const AIRationale: React.FC<AIRationaleProps> = ({ rationale }) => (
  <div className="rounded-sm border p-6">
    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
      <Brain className="w-5 h-5" />
      AI Analysis Rationale
    </h3>
    <ul className="space-y-2">
      {rationale.map((reason, index) => (
        <li key={index} className="text-sm text-gray-400 flex items-start gap-2">
          <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-medium text-blue-600">{index + 1}</span>
          </div>
          {reason}
        </li>
      ))}
    </ul>
  </div>
);