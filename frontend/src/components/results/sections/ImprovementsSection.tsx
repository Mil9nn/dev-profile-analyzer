import { TrendingUp } from "lucide-react";

interface ImprovementsSectionProps {
  improvements: string[];
}

export function ImprovementsSection({ improvements }: ImprovementsSectionProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-purple-400" />
        Suggested Improvements
      </h3>
      <ul className="space-y-3">
        {improvements.map((improvement, index) => (
          <li key={index} className="text-slate-300 flex items-start gap-3">
            <TrendingUp className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
            {improvement}
          </li>
        ))}
      </ul>
    </div>
  );
}