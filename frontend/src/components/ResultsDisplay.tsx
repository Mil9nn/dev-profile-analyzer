import { Star, Code, Database, Brain, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { type AnalysisResult } from '../hooks/useAnalysis'

interface Props {
  result: AnalysisResult
}

export function ResultsDisplay({ result }: Props) {
  const { aiFeedback, metrics } = result
  const scoreColor = aiFeedback.score >= 7 ? 'text-green-400' : aiFeedback.score >= 5 ? 'text-yellow-400' : 'text-red-400'
  const levelColor = {
    'Senior': 'text-green-400 bg-green-400/10',
    'Mid': 'text-blue-400 bg-blue-400/10', 
    'Junior': 'text-yellow-400 bg-yellow-400/10',
    'Entry': 'text-orange-400 bg-orange-400/10'
  }[aiFeedback.hiringPotential.level] || 'text-gray-400 bg-gray-400/10'

  // Format components display
  const formatComponents = (components: { count: number, quality?: number }) => {
    return components.quality !== undefined 
      ? `${components.count} (${components.quality.toFixed(1)}/3)`
      : components.count.toString()
  }

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 space-y-6 max-w-2xl w-full">
      {/* Score Header */}
      <div className="text-center">
        <div className={`text-4xl font-bold ${scoreColor} mb-2`}>
          {aiFeedback.score}/10
        </div>
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${levelColor}`}>
          <Star className="w-4 h-4" />
          {aiFeedback.hiringPotential.level} Level
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-zinc-700/50 rounded-lg">
        {[
          { 
            icon: <Code className="w-4 h-4" />, 
            label: 'Components', 
            value: formatComponents(metrics.components) 
          },
          { 
            icon: <Database className="w-4 h-4" />, 
            label: 'Files', 
            value: metrics.totalFiles 
          },
          { 
            icon: <Brain className="w-4 h-4" />, 
            label: 'APIs', 
            value: metrics.apiEndpoints || 0 
          },
          { 
            icon: <TrendingUp className="w-4 h-4" />, 
            label: 'Technologies', 
            value: metrics.technologies?.length || 0 
          }
        ].map((metric, i) => (
          <div key={i} className="text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
              {metric.icon}
              <span className="text-xs">{metric.label}</span>
            </div>
            <div className="text-white font-semibold">{metric.value}</div>
          </div>
        ))}
      </div>

      {/* Technologies */}
      <div>
        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
          <Code className="w-4 h-4" />
          Technologies Used
        </h3>
        <div className="flex flex-wrap gap-2">
          {aiFeedback.technologies?.slice().map((tech, i) => (
            <span key={i} className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-white font-medium mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {aiFeedback.strengths?.map((strength, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-white font-medium mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Areas to Improve
          </h3>
          <ul className="space-y-2">
            {aiFeedback.weaknesses?.map((weakness, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                {weakness}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Hiring Potential */}
      <div className="bg-zinc-700/30 p-4 rounded-lg">
        <h3 className="text-white font-medium mb-2">Hiring Assessment</h3>
        <p className="text-slate-300 text-sm mb-3">{aiFeedback.hiringPotential.details}</p>
        
        <div className="space-y-2">
          <div className="text-xs text-slate-400 font-medium">Areas to Watch:</div>
          <div className="flex flex-wrap gap-2">
            {aiFeedback.hiringPotential.watchAreas?.map((area, i) => (
              <span key={i} className="px-2 py-1 bg-orange-600/20 text-orange-300 text-xs rounded">
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Conclusion */}
      <div className="text-center p-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-lg">
        <p className="text-slate-300 text-sm italic">{aiFeedback.conclusion}</p>
      </div>
    </div>
  )
}