import { Code } from "lucide-react";

interface TechnologiesSectionProps {
  technologies: string[];
}

export function TechnologiesSection({ technologies }: TechnologiesSectionProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Code className="w-5 h-5" />
        Technologies & Frameworks
      </h3>
      <div className="flex flex-wrap gap-2">
        {technologies.map((tech, index) => (
          <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}