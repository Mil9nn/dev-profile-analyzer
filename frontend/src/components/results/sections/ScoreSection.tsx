import { Award } from "lucide-react";

interface ScoreSectionProps {
  score: number;
  rationale: string[];
}

export function ScoreSection({ score, rationale }: ScoreSectionProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-500";
    if (score >= 6) return "text-yellow-500";
    return "text-red-500";
  };

  const hasContent = (arr: any): arr is string[] => {
    return Array.isArray(arr) && arr.length > 0;
  };

  const safeArray = (arr: any): string[] => {
    return Array.isArray(arr) ? arr : [];
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm text-slate-300 mb-4">
          <Award className="w-4 h-4" />
          Overall Score
        </div>
        <div className={`text-6xl font-bold mb-4 ${getScoreColor(score)}`}>
          {score}/10
        </div>
        {hasContent(rationale) && (
          <div className="text-left">
            <h4 className="font-semibold text-slate-200 mb-3">Rationale:</h4>
            <ul className="space-y-2">
              {safeArray(rationale).map((item, index) => (
                <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}