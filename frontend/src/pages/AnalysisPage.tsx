import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Github, Linkedin, Plus, X, Target, TrendingUp, AlertCircle, CheckCircle, Users, Code, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { EmptyState } from '../components/states/EmptyState';
import { axiosInstance } from '@/lib/axios';

interface FormData {
  githubProfile: string;
  linkedinProfile: string;
  repositories: string[];
}

interface AnalysisResult {
  score: number;
  rationale: string[];
  technologies: string[];
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  hiringPotential: {
    level: string;
    details: string;
    watchAreas: string[];
  };
  conclusion: string;
}

const AnalysisPage = () => {
  const [showForm, setShowForm] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    defaultValues: {
      githubProfile: '',
      linkedinProfile: '',
      repositories: ['']
    }
  });

  const addRepository = () => {
    const current = form.getValues('repositories');
    form.setValue('repositories', [...current, '']);
  };

  const removeRepository = (index: number) => {
    const current = form.getValues('repositories');
    form.setValue('repositories', current.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await axiosInstance.post('/analyze', {
        ...data,
        repositories: data.repositories.filter(repo => repo.trim())
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = response.data;

      if (result.success) {
        setAnalysisResult(result.aiFeedback);
        setShowForm(false);
      } else {
        setError(result.error || 'Analysis failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetForm = () => {
    setShowForm(true);
    setAnalysisResult(null);
    setError(null);
    form.reset();
  };

  const ScoreCircle = ({ score }: { score: number }) => (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
        <path
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="rgb(75 85 99)"
          strokeWidth="2"
        />
        <path
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={score >= 7 ? "rgb(34 197 94)" : score >= 5 ? "rgb(234 179 8)" : "rgb(239 68 68)"}
          strokeWidth="2"
          strokeDasharray={`${score * 10}, 100`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold text-white">{score}/10</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-purple-900 to-zinc-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">DevProfile Analyzer</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
              Sign Up
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Login
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8 min-h-[calc(100vh-120px)]">
          {/* Left Panel - Form or Back Button */}
          <div className="space-y-6">
            {!showForm && (
              <Button
                onClick={resetForm}
                variant="outline"
                className="text-white border-white/20 hover:bg-white/10 mb-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Form
              </Button>
            )}

            {showForm && (
              <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">Analyze Your Profile</h2>

                <Form {...form}>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="githubProfile"
                      rules={{ required: "GitHub profile is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white flex items-center gap-2">
                            <Github className="w-4 h-4" />
                            GitHub Profile
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://github.com/username"
                              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="linkedinProfile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white flex items-center gap-2">
                            <Linkedin className="w-4 h-4" />
                            LinkedIn Profile (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://linkedin.com/in/username"
                              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-white font-medium">Repositories to Analyze</label>
                        <Button
                          type="button"
                          onClick={addRepository}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>

                      {form.watch('repositories').map((_, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            {...form.register(`repositories.${index}`)}
                            placeholder="repository-name"
                            className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                          />
                          {form.watch('repositories').length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeRepository(index)}
                              size="icon"
                              variant="outline"
                              className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span>{error}</span>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={isAnalyzing}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Analyze Profile'}
                    </Button>
                  </div>
                </Form>
              </div>
            )}
          </div>

          {/* Right Panel - Results or Empty State */}
          <div>
            {!analysisResult && showForm && <EmptyState />}

            {isAnalyzing && (
              <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-white mb-2">Analyzing Your Profile</h3>
                <p className="text-gray-400">This may take a few moments...</p>
              </div>
            )}

            {analysisResult && (
              <div className="space-y-6">
                {/* Score Card */}
                <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
                  <h2 className="text-2xl font-bold text-white mb-6">Profile Analysis Results</h2>
                  <ScoreCircle score={analysisResult.score} />
                  <p className="text-gray-300 mt-4">{analysisResult.conclusion}</p>
                </div>

                {/* Hiring Potential */}
                <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Hiring Potential</h3>
                  </div>
                  <div className="mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${analysisResult.hiringPotential.level === 'Senior' ? 'bg-green-500/20 text-green-400' :
                        analysisResult.hiringPotential.level === 'Mid' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                      }`}>
                      {analysisResult.hiringPotential.level} Level
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{analysisResult.hiringPotential.details}</p>
                </div>

                {/* Technologies */}
                <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <Code className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Tech Stack</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.technologies.map((tech, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <h3 className="text-lg font-semibold text-white">Strengths</h3>
                    </div>
                    <ul className="space-y-2">
                      {analysisResult.strengths.map((strength, index) => (
                        <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                          <Star className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-orange-400" />
                      <h3 className="text-lg font-semibold text-white">Improvements</h3>
                    </div>
                    <ul className="space-y-2">
                      {analysisResult.improvements.map((improvement, index) => (
                        <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                          <TrendingUp className="w-3 h-3 text-orange-400 mt-1 flex-shrink-0" />
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;