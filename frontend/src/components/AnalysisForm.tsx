import React from 'react';
import { useForm } from 'react-hook-form';
import { Github, Linkedin, Target } from 'lucide-react';
import type { FormData, ProgressData } from '../types/analysis';
import { ProfileInput } from './form/ProfileInput';
import { RepositoryInput } from './form/RepositoryInput';
import { ErrorAlert } from './form/ErrorAlert';
import { ProgressTracker } from './progress/ProgressTracker';

interface AnalysisFormProps {
  onSubmit: (data: FormData) => void;
  isAnalyzing: boolean;
  error: string | null;
  progress: ProgressData | null;
}

export const AnalysisForm: React.FC<AnalysisFormProps> = ({
  onSubmit,
  isAnalyzing,
  error,
  progress
}) => {
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

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-zinc-900 to-purple-900 flex justify-center">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 bg-white/5 backdrop-blur-md p-6 md:p-10">
        
        {/* Form Section */}
        <div className="">
          <div className="text-left mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Code Quality Analysis</h1>
            <p className="text-slate-300">
              Analyze your GitHub repositories with AI-powered insights.
            </p>
          </div>

          <div className="space-y-6">
            <ProfileInput
              icon={Github}
              label="GitHub Profile"
              placeholder="username or github.com/username"
              register={form.register('githubProfile', { required: 'GitHub profile is required' })}
              error={form.formState.errors.githubProfile?.message}
              required
            />

            <ProfileInput
              icon={Linkedin}
              label="LinkedIn Profile (Optional)"
              placeholder="linkedin.com/in/username"
              register={form.register('linkedinProfile')}
            />

            <RepositoryInput
              repositories={form.watch('repositories')}
              register={form.register}
              errors={form.formState.errors}
              onAdd={addRepository}
              onRemove={removeRepository}
            />

            {error && <ErrorAlert message={error} />}

            <button
              type="button"
              onClick={() => form.handleSubmit(onSubmit)()}
              disabled={isAnalyzing}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  Start Analysis
                </>
              )}
            </button>
          </div>
        </div>
        {/* Progress Tracker Side Panel */}
        {progress && (
          <div className="w-full md:w-[300px] bg-zinc-800 border border-zinc-700 rounded-lg p-6 text-white shadow-inner flex-shrink-0">
            <h2 className="text-lg font-semibold mb-4">Progress</h2>
            <ProgressTracker progress={progress} />
          </div>
        )}
      </div>
    </div>
  );
};
