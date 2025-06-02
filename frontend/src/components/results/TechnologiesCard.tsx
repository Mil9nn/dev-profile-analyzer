// components/results/TechnologiesCard.tsx
interface TechnologiesCardProps {
  technologies: string[];
}

export const TechnologiesCard: React.FC<TechnologiesCardProps> = ({ technologies }) => {
  return (
    <div className="rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">Technologies Detected</h3>
      <div className="flex flex-wrap gap-2">
        {technologies.map((tech) => (
          <span
            key={tech}
            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
};