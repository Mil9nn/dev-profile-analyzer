interface ConclusionSectionProps {
  conclusion: string;
}

export function ConclusionSection({ conclusion }: ConclusionSectionProps) {
  if (!conclusion) return null;

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-blue-400 mb-3">Conclusion</h3>
      <p className="text-sm text-slate-200 leading-relaxed">{conclusion}</p>
    </div>
  );
}
