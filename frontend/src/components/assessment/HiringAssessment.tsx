// components/assessment/HiringAssessment.tsx
import { Users, MessageSquare } from 'lucide-react';

interface HiringAssessmentProps {
  hiringPotential: {
    level: string;
    details: string;
    watchAreas: string[];
    readiness: string;
  };
}

export const HiringAssessment: React.FC<HiringAssessmentProps> = ({ hiringPotential }) => (
  <div className="rounded-sm border p-6">
    <h3 className="text-xl font-bold text-gray-400 mb-4 flex items-center gap-2">
      <Users className="w-5 h-5" />
      Hiring Assessment
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-medium text-gray-400 mb-2">Assessment Details</h4>
        <p className="text-gray-300 text-sm">{hiringPotential.details}</p>
      </div>
      <div>
        <h4 className="font-medium text-gray-400 mb-2">Areas to Monitor</h4>
        <ul className="space-y-1">
          {hiringPotential.watchAreas.map((area, index) => (
            <li key={index} className="text-sm text-gray-300 flex items-center gap-2">
              <MessageSquare className="w-3 h-3 text-gray-400" />
              {area}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);