import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="backdrop-blur-xl rounded-2xl p-8">
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="size-10 animate-spin" />
        <p className="text-slate-300 text-lg">Analyzing your repositories...</p>
        <p className="text-slate-400 text-sm mt-2">This may take a few moments</p>
      </div>
    </div>
  );
}