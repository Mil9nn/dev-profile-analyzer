// components/results/QualityBreakdown.tsx
interface QualityBreakdownProps {
  breakdown: {
    architecture: number;
    implementation: number;
    bestPractices: number;
    complexity: number;
  };
}

export const QualityBreakdown: React.FC<QualityBreakdownProps> = ({ breakdown }) => {
  return (
    <div className="p-6">
      <h3 className="text-xl font-bold text-white mb-4">Quality Breakdown</h3>
      <div className="space-y-4">
        {Object.entries(breakdown).map(([key, value]) => (
          <div key={key}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-400 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="text-sm font-bold text-gray-400">{value}/10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  value >= 8 ? 'bg-green-500' : value >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${(value / 10) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};