interface HiringPotentialProps {
  hiringPotential: {
    level: string;
    details: string;
    watchAreas: string[];
  };
}

export function HiringPotential({ hiringPotential }: HiringPotentialProps) {
  if (!hiringPotential?.level) return null;

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-blue-400 mb-4">Hiring Potential</h3>

      <div className="mb-4">
        <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded-full text-sm font-medium">
          {hiringPotential.level}
        </span>
      </div>

      {hiringPotential.details && (
        <p className="text-sm text-slate-200 mb-4 leading-relaxed">
          {hiringPotential.details}
        </p>
      )}

      {hiringPotential.watchAreas && hiringPotential.watchAreas.length > 0 && (
        <div>
          <h4 className="font-medium text-slate-100 mb-2">Areas to Watch:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {hiringPotential.watchAreas.map((area, index) => (
              <li key={index} className="text-sm text-slate-400">{area}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
