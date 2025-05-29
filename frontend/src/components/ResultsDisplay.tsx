import { Award, Code, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react'
import type { AnalysisResult } from '../hooks/useAnalysis'

export function ResultsDisplay({ result }: { result: AnalysisResult }) {
  const { aiFeedback } = result

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400'
    if (score >= 6) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Score */}
      <div className="bg-zinc-800 p-6 rounded-lg text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Award className="w-5 h-5 text-purple-400" />
          <span className="text-white">Overall Score</span>
        </div>
        <div className={`text-5xl font-bold mb-4 ${getScoreColor(aiFeedback.score)}`}>
          {aiFeedback.score}/10
        </div>
        {aiFeedback.rationale?.length > 0 && (
          <div className="text-left">
            <h4 className="text-white font-semibold mb-2">Rationale:</h4>
            <ul className="space-y-1">
              {aiFeedback.rationale.map((item, i) => (
                <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Technologies */}
      {aiFeedback.technologies?.length > 0 && (
        <div className="bg-zinc-800 p-6 rounded-lg">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-400" />
            Technologies
          </h3>
          <div className="flex flex-wrap gap-2">
            {aiFeedback.technologies.map((tech, i) => (
              <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {aiFeedback.strengths?.length > 0 && (
        <div className="bg-zinc-800 p-6 rounded-lg">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {aiFeedback.strengths.map((strength, i) => (
              <li key={i} className="text-slate-300 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {aiFeedback.weaknesses?.length > 0 && (
        <div className="bg-zinc-800 p-6 rounded-lg">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {aiFeedback.weaknesses.map((weakness, i) => (
              <li key={i} className="text-slate-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                {weakness}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {aiFeedback.improvements?.length > 0 && (
        <div className="bg-zinc-800 p-6 rounded-lg">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Suggestions
          </h3>
          <ul className="space-y-2">
            {aiFeedback.improvements.map((improvement, i) => (
              <li key={i} className="text-slate-300 flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                {improvement}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Hiring Potential */}
      {aiFeedback.hiringPotential?.level && (
        <div className="bg-zinc-800 p-6 rounded-lg">
          <h3 className="text-white font-bold mb-4">Hiring Potential</h3>
          <div className="mb-4">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
              {aiFeedback.hiringPotential.level}
            </span>
          </div>
          {aiFeedback.hiringPotential.details && (
            <p className="text-slate-300 mb-4">{aiFeedback.hiringPotential.details}</p>
          )}
          {aiFeedback.hiringPotential.watchAreas?.length > 0 && (
            <div>
              <h4 className="text-white font-medium mb-2">Watch Areas:</h4>
              <ul className="space-y-1">
                {aiFeedback.hiringPotential.watchAreas.map((area, i) => (
                  <li key={i} className="text-slate-400 text-sm">• {area}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Conclusion */}
      {aiFeedback.conclusion && (
        <div className="bg-zinc-800 p-6 rounded-lg">
          <h3 className="text-white font-bold mb-3">Conclusion</h3>
          <p className="text-slate-300">{aiFeedback.conclusion}</p>
        </div>
      )}
    </div>
  )
}
