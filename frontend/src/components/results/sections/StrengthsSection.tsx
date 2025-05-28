import { CheckCircle } from "lucide-react";

interface StrengthsSectionProps {
  strengths: string[];
}

export function StrengthsSection({ strengths }: StrengthsSectionProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-400" />
        Strengths
      </h3>
      <ul className="space-y-3">
        {strengths.map((strength, index) => (
          <li key={index} className="text-slate-300 flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            {strength}
          </li>
        ))}
      </ul>
    </div>
  );
}