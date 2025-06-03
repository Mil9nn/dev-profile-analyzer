import { Target } from "lucide-react";

export function EmptyState() {

  return (
    <div className="flex flex-col items-center backdrop-blur-xl p-8 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Target className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Ready to Analyze</h3>
      <p className="text-slate-400 max-w-sm">Fill out the form to get comprehensive AI feedback on your developer profile and projects.</p>
    </div>
  );
}