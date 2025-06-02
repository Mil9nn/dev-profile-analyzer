// components/AnalysisResults.tsx
import React from 'react';
import { ArrowLeft, Award, CheckCircle, FileCode, TrendingUp, Code, Settings, Star, AlertCircle } from 'lucide-react';
import type { AnalysisResult } from '../types/analysis';
import { ScoreCircle } from './results/ScoreCircle';
import { MetricCard } from './results/MetricsCard';
import { QualityBreakdown } from './results/QualityBreakdown';
import { TechnologiesCard } from './results/TechnologiesCard';
import { AnalysisSection } from './assessment/AnalysisSection';
import { HiringAssessment } from './assessment/HiringAssessment';
import { AIRationale } from './assessment/AIRationale';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onReset: () => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, onReset }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-purple-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 hover:text-gray-900 border rounded-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            New Analysis
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Analysis Results</h1>
            <p className="text-gray-400">AI-powered code quality assessment</p>
          </div>
        </div>

        {/* Overall Score */}
        <div className="rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-purple-600 mb-2">Overall Code Quality Score</h2>
              <p className="text-gray-400 mb-4">{result.conclusion}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">{result.hiringPotential.level}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">{result.hiringPotential.readiness}</span>
                </div>
              </div>
            </div>
            <ScoreCircle score={result.score} />
          </div>
        </div>

        {/* Code Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard 
            icon={FileCode} 
            title="Total Files" 
            value={result.codeMetrics.totalFiles}
            subtitle="Analyzed"
          />
          <MetricCard 
            icon={TrendingUp} 
            title="Avg Complexity" 
            value={result.codeMetrics.avgComplexity}
            subtitle="Cyclomatic"
          />
          <MetricCard 
            icon={Code} 
            title="Avg File Size" 
            value={`${result.codeMetrics.avgFileSize}`}
            subtitle="Lines of code"
          />
          <MetricCard 
            icon={Settings} 
            title="Tech Stack" 
            value={result.codeMetrics.techStackDiversity}
            subtitle="Technologies"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <QualityBreakdown breakdown={result.codeQualityBreakdown} />
          <TechnologiesCard technologies={result.technologies} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <AnalysisSection
            title="Strengths"
            icon={CheckCircle}
            items={result.strengths}
            iconColor="text-green-500"
            titleColor="text-green-800"
            itemIcon={Star}
          />
          
          <AnalysisSection
            title="Areas to Watch"
            icon={AlertCircle}
            items={result.weaknesses}
            iconColor="text-yellow-500"
            titleColor="text-yellow-800"
            itemIcon={AlertCircle}
          />
          
          <AnalysisSection
            title="Improvements"
            icon={TrendingUp}
            items={result.improvements}
            iconColor="text-blue-500"
            titleColor="text-blue-800"
            itemIcon={TrendingUp}
          />
        </div>

        <HiringAssessment hiringPotential={result.hiringPotential} />
        
        <div className="mt-8">
          <AIRationale rationale={result.rationale} />
        </div>
      </div>
    </div>
  );
};