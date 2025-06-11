import { useState, useEffect } from 'react';
import axiosInstance from '../config/axios.ts';
import { Loader2, Github, Linkedin, Code, Zap, Trophy, User, Briefcase, AlignLeft, FolderGit2, Mail, Download, DownloadCloud, FilePlus } from 'lucide-react';

import { useRef } from 'react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import InputForm from './InputForm.tsx';
import { useAnalysisStore } from '@/store/useAnalysisStore.ts';
import ProgressTracker from './ProgressTracker.tsx';

interface FormData {
    username: string;
    linkedinUrl: string;
    repositories: string[];
}

const PersonalInfo = ({ personalInfo }: { personalInfo: any }) => (
    <div className="">
        <div className="border-b border-zinc-700 pb-4 mb-6">
            <h2 className="text-2xl text-center font-bold mb-4 pb-1 text-white">
                Murli Manohar Milan Singh
            </h2>
            <div className="flex flex-wrap gap-4 text-sm text-zinc-400 mt-2">
                <div className="flex items-center gap-1">
                    <Mail className="inline size-4" />
                    Email: <a href="mailto:milansingh@example.com" className="text-blue-400 hover:underline">milansingh@example.com</a>
                </div>
                <div>
                    Phone: <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-1">
                    <Github className="inline size-4" />
                    GitHub: <a href="https://github.com/milansingh" target="_blank" className="text-blue-400 hover:underline">github.com/milansingh</a>
                </div>
                <div className="flex items-center gap-1">
                    <Linkedin className="inline size-4" />
                    LinkedIn: <a href="https://linkedin.com/in/milansingh" target="_blank" className="text-blue-400 hover:underline">linkedin.com/in/milansingh</a>
                </div>
            </div>
        </div>

        <div>
            <h2 className="text-2xl font-bold mb-4 pb-1 text-white">
                <AlignLeft className="inline-block mr-2 text-blue-400" />
                Summary
            </h2>
            <p className="text-zinc-200 text-base mb-3 leading-relaxed">
                {personalInfo.professionalSummary}
            </p>
            <p className="text-blue-300 italic text-sm mb-4">
                {personalInfo.valueProposition}
            </p>
        </div>

        <div className="flex gap-4 mt-4">
            <a
                href={`https://github.com/${personalInfo.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm px-3 py-2 rounded-md transition-colors"
            >
                <Github className="w-4 h-4" />
                GitHub
            </a>

            {personalInfo.linkedinUrl && (
                <a
                    href={personalInfo.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-md transition-colors"
                >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                </a>
            )}
        </div>
    </div>
);

const Skills = ({ skills }: { skills: any }) => (
    <div className="">
        <h2 className="text-2xl font-bold mb-4 pb-1 text-white">
            <Code className="inline-block mr-2 text-blue-400" />
            Technical Skills
        </h2>

        <div className="grid md:grid-cols-1 gap-6">
            <div>
                <h3 className="text-lg font-semibold text-zinc-200 mb-3">Core Skills</h3>
                {Object.entries(skills.core).map(([category, skillList]: [string, any]) => (
                    <div key={category} className="mb-4">
                        <h4 className="font-medium text-zinc-400 mb-1">{category}</h4>
                        <div className="flex flex-wrap gap-2">
                            {skillList.map((skill: string, index: number) => (
                                <span
                                    key={index}
                                    className="bg-blue-800/20 text-blue-300 px-3 py-1 rounded-full text-sm border border-blue-700/50"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const Projects = ({ projects }: { projects: any[] }) => (
    <div className="">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-blue-400" />
            Projects
        </h2>

        <div className="space-y-6">
            {projects.map((project, index) => (
                <div key={index}>
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                        <div className="flex items-center gap-2">
                            <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300"
                            >
                                <Github className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    <p className="text-zinc-300 mb-3">{project.description}</p>

                    <div className="mb-3">
                        <h4 className="font-medium text-zinc-400 mb-1">Technologies</h4>
                        <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech, techIndex) => (
                                <span
                                    key={techIndex}
                                    className="bg-green-500/10 text-green-300 px-3 py-1 rounded-full text-sm border border-green-400/20"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium text-zinc-400 mb-1">Key Features</h4>
                        <ul className="list-disc list-inside text-zinc-300 text-sm space-y-1">
                            {project.keyFeatures.map((feature, featureIndex) => (
                                <li key={featureIndex}>{feature}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const TechnicalProfile = ({ technicalProfile, skills, projects }) => (
  <div className="bg-white dark:bg-zinc-900 shadow-xl p-6 md:p-10 mb-8 border border-zinc-200 dark:border-zinc-800">
    <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-8 flex items-center gap-3">
      <Trophy className="w-6 h-6 text-yellow-500" />
      Technical Profile
    </h2>

    {/* Stats */}
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-blue-100 dark:bg-blue-500/10 p-4 rounded-sm text-center">
        <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-300 uppercase tracking-wide mb-2">
          Projects Analyzed
        </h3>
        <p className="text-4xl font-bold text-blue-700 dark:text-blue-400">
          {technicalProfile.totalProjects}
        </p>
      </div>

      <div className="bg-purple-100 dark:bg-purple-500/10 p-4 rounded-sm text-center">
        <h3 className="text-sm font-semibold text-purple-600 dark:text-purple-300 uppercase tracking-wide mb-2">
          Avg Innovation Score
        </h3>
        <p className="text-4xl font-bold text-purple-700 dark:text-purple-400">
          {technicalProfile.avgInnovationScore.toFixed(1)}/10
        </p>
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-sm text-center">
        <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide mb-2">
          Experience Level
        </h3>
        <p className="text-base font-medium text-zinc-800 dark:text-zinc-300">
          {skills.experienceLevel}
        </p>
      </div>
    </div>

    {/* Primary Languages */}
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-400 uppercase tracking-wide mb-3">
        Primary Languages
      </h3>
      <div className="flex flex-wrap gap-2">
        {technicalProfile.languages.map((lang, i) => (
          <span key={i} className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-sm text-zinc-800 dark:text-white rounded-full">
            {lang}
          </span>
        ))}
      </div>
    </div>

    {/* Industry Strengths & Specializations */}
    <div className="grid sm:grid-cols-2 gap-8 mb-8">
      <div>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-400 uppercase tracking-wide mb-3">
          Industry Strengths
        </h3>
        <div className="flex flex-wrap gap-2">
          {technicalProfile.industryStrengths.map((strength, i) => (
            <span key={i} className="px-3 py-1.5 bg-orange-100 dark:bg-orange-500/10 text-sm text-orange-700 dark:text-orange-300 rounded-full">
              {strength}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-400 uppercase tracking-wide mb-3">
          Specializations
        </h3>
        <div className="flex flex-wrap gap-2">
          {skills.specializations.map((spec, i) => (
            <span key={i} className="px-3 py-1.5 bg-purple-100 dark:bg-purple-500/10 text-sm text-purple-700 dark:text-purple-300 rounded-full">
              {spec}
            </span>
          ))}
        </div>
      </div>
    </div>

    {/* Project Innovation Scores */}
    <div>
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-400 uppercase tracking-wide mb-3">
        Project Innovation Scores
      </h3>
      <div className="space-y-3 grid grid-cols-3">
        {projects.map((project, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-4 py-3 rounded-sm bg-yellow-100 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20"
          >
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300 truncate">
              {project.name}
            </span>
            <div className="flex items-center gap-1 text-yellow-700 dark:text-yellow-300">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold">{project.innovationScore}/10</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ErrorMessage = ({ error, onRetry }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <h3 className="text-red-800 font-semibold mb-2">Error</h3>
        <p className="text-red-600 mb-3">{error}</p>
        <button
            onClick={onRetry}
            className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600"
        >
            Try Again
        </button>
    </div>
);

// Main App Component
const ResumeAnalyzer = () => {
    const {
        resumeData, setResumeData,
        error, setError,
        progress, setProgress,
        isPrintMode, setIsPrintMode,
        isAnalyzing,
        startAnalysis,
        resetAnalysis,
        initializeSocket,
        disconnectSocket
    } = useAnalysisStore();

    const resumeRef = useRef();

    // Initialize socket when component mounts
    useEffect(() => {
        initializeSocket().catch(console.error);

        // Cleanup on unmount
        return () => {
            disconnectSocket();
        };
    }, [initializeSocket, disconnectSocket]);

    const handleDownload = async () => {
        if (!resumeRef.current) {
            console.error('No resume ref found!');
            return;
        }

        const element = resumeRef.current;

        try {
            element.classList.add('print-mode');
            setIsPrintMode(true);
            await new Promise((resolve) => setTimeout(resolve, 200));

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#fff',
                scrollY: -window.scrollY
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const imgWidth = pdfWidth;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save('resume.pdf');

        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            element.classList.remove('print-mode');
            setIsPrintMode(false);
        }
    };

    const handleAnalyze = async (formData: FormData) => {
        await startAnalysis(formData);
    };

    const handleRetry = () => {
        resetAnalysis();
    };

    return (
        <div>
            <div className="container mx-auto p-4">
                
                {isAnalyzing && (
                    <ProgressTracker
                        isAnalyzing={isAnalyzing}
                        progress={progress}
                        error={error}
                    />
                )}

                {!resumeData && !isAnalyzing && (
                    <InputForm onSubmit={handleAnalyze} loading={isAnalyzing} />
                )}

                {resumeData && (
                    <div>
                        <TechnicalProfile
                            technicalProfile={resumeData.technicalProfile}
                            skills={resumeData.skills}
                            projects={resumeData.projects}
                        />

                        <div className="flex items-center justify-between mt-8 space-x-4">
                            <div className="flex items-center gap-5">
                                <button onClick={handleDownload}
                                    className="relative overflow-hidden group inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium cursor-pointer">
                                    <span className="relative z-10 flex items-center gap-2">
                                        <Download className="w-4 h-4" />
                                        Download
                                    </span>
                                    <span className="absolute inset-0 bg-purple-600 scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100 z-0 rounded-full" />
                                </button>

                                <button
                                    onClick={resetAnalysis}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    <FilePlus className="w-4 h-4" />
                                    Regenerate
                                </button>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <span className="text-sm text-zinc-300">Print Theme</span>
                                <div
                                    onClick={() => setIsPrintMode(!isPrintMode)}
                                    className={`w-10 h-5 flex items-center bg-zinc-600 rounded-full p-1 transition-colors duration-300 ${isPrintMode ? 'bg-blue-500' : 'bg-zinc-700'
                                        }`}
                                >
                                    <div
                                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isPrintMode ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </div>
                            </label>
                        </div>

                        <div ref={resumeRef} className={`pdf-friendly mx-auto my-10 p-10 shadow-2xl border 
                            ${isPrintMode ? 'print-mode' : ''}
                            resume-section`}
                            style={{ width: '794px', minHeight: '1123px' }}
                        >
                            <PersonalInfo personalInfo={resumeData.personalInfo} />
                            <hr className="border-zinc-800 my-8" />
                            <Skills skills={resumeData.skills} />
                            <hr className="border-zinc-800 my-8" />
                            <Projects projects={resumeData.projects} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeAnalyzer;