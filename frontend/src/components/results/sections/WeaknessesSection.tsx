import { AlertTriangle } from "lucide-react";

interface WeaknessesSectionProps {
  weaknesses: string[];
}

export function WeaknessesSection({ weaknesses }: WeaknessesSectionProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-400" />
        Areas for Improvement
      </h3>
      <ul className="space-y-3">
        {weaknesses.map((weakness, index) => (
          <li key={index} className="text-slate-300 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            {weakness}
          </li>
        ))}
      </ul>
    </div>
  );
}