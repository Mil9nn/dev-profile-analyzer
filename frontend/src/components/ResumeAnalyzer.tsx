import { useState } from 'react';
import axiosInstance from '../config/axios.ts';
import { Loader2, Github, Linkedin, Code, Zap, Trophy, User, Briefcase } from 'lucide-react';

import { useRef } from 'react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import InputForm from './InputForm.tsx';
import { useAppStore } from '@/store/useAnalysisStore.ts';

// Components
const LoadingSpinner = ({ message }) => (
    <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">{message}</p>
    </div>
);


const PersonalInfo = ({ personalInfo }) => (
    <div className="">
        <div className="flex items-center gap-4 mb-4">
            <div className="bg-zinc-800  p-3 rounded-full">
                <User className="w-8 h-8 text-blue-400" />
            </div>
            <div>
                <h1 className="text-2xl font-semibold text-white">{personalInfo.name}</h1>
                <p className="text-zinc-400 text-sm">@{personalInfo.githubUsername}</p>
            </div>
        </div>

        <p className="text-zinc-200 text-base mb-3 leading-relaxed">
            {personalInfo.professionalSummary}
        </p>
        <p className="text-blue-300 italic text-sm mb-4">
            {personalInfo.valueProposition}
        </p>

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



const Skills = ({ skills }) => (
    <div className="">
        <h2 className="text-2xl font-bold mb-4 pb-1">
            <Code className="inline-block mr-2 text-blue-400" />
            Technical Skills
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
            {/* Core Skills */}
            <div>
                <h3 className="text-lg font-semibold text-zinc-200 mb-3">Core Skills</h3>
                {Object.entries(skills.core).map(([category, skillList]) => (
                    <div key={category} className="mb-4">
                        <h4 className="font-medium text-zinc-400 mb-1">{category}</h4>
                        <div className="flex flex-wrap gap-2">
                            {skillList.map((skill, index) => (
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

            {/* Specializations */}
            <div>
                <h3 className="text-lg font-semibold text-zinc-200 mb-3">Specializations</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                    {skills.specializations.map((spec, index) => (
                        <span
                            key={index}
                            className="bg-purple-800/20 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-700/50"
                        >
                            {spec}
                        </span>
                    ))}
                </div>

                {/* Experience Level */}
                <div className="bg-zinc-800 p-3 rounded-lg border border-zinc-700">
                    <p className="text-sm text-zinc-300">
                        <strong className="text-zinc-100">Experience Level:</strong>{' '}
                        {skills.experienceLevel}
                    </p>
                </div>
            </div>
        </div>
    </div>
);

const Projects = ({ projects }) => (
    <div className="">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-400" />
            Projects
        </h2>

        <div className="space-y-6">
            {projects.map((project, index) => (
                <div key={index}>
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-300 px-2 py-1 rounded-md text-sm border border-yellow-500/20">
                                <Zap className="w-4 h-4" />
                                {project.innovationScore}/10
                            </div>
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

const TechnicalProfile = ({ technicalProfile }) => (
    <div className="rounded-xl shadow-md p-6 mb-6 bg-zinc-900 border border-zinc-800">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Technical Profile
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-400/20">
                    <h3 className="font-medium text-blue-300 mb-1">Projects Analyzed</h3>
                    <p className="text-2xl font-bold text-blue-400">
                        {technicalProfile.totalProjects}
                    </p>
                </div>
                <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-400/20">
                    <h3 className="font-medium text-purple-300 mb-1">Average Innovation Score</h3>
                    <p className="text-2xl font-bold text-purple-400">
                        {technicalProfile.avgInnovationScore.toFixed(1)}/10
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <h3 className="font-medium text-zinc-400 mb-2">Primary Languages</h3>
                    <div className="flex flex-wrap gap-2">
                        {technicalProfile.languages.map((lang, index) => (
                            <span
                                key={index}
                                className="bg-zinc-700 text-white px-3 py-1 rounded-md text-sm border border-zinc-600"
                            >
                                {lang}
                            </span>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="font-medium text-zinc-400 mb-2">Industry Strengths</h3>
                    <div className="flex flex-wrap gap-2">
                        {technicalProfile.industryStrengths.map((strength, index) => (
                            <span
                                key={index}
                                className="bg-orange-500/10 text-orange-300 px-3 py-1 rounded-md text-sm border border-orange-400/20"
                            >
                                {strength}
                            </span>
                        ))}
                    </div>
                </div>
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
            className="bg-red-500  px-4 py-2 rounded-md hover:bg-red-600"
        >
            Try Again
        </button>
    </div>
);

// Main App Component
const ResumeAnalyzer = () => {
    const {
    resumeData, setResumeData,
    loading, setLoading,
    error, setError,
    progress, setProgress,
    isPrintMode, setIsPrintMode
  } = useAppStore();

    const resumeRef = useRef();

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

            // Use html2canvas-pro with some options for better quality
            const canvas = await html2canvas(element, {
                scale: 2,                // Increase scale for higher resolution
                useCORS: true,           // Enable if you have cross-origin images
                backgroundColor: '#fff', // Set white background (important if your resume has transparent bg)
                scrollY: -window.scrollY // Fix for vertical scroll offset
            });

            const imgData = canvas.toDataURL('image/png');

            // Create jsPDF instance - 'p' for portrait, 'mm' units, A4 size
            const pdf = new jsPDF('p', 'mm', 'a4');

            // Calculate width & height of PDF page in px
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Calculate canvas image dimensions to fit PDF while keeping aspect ratio
            const imgProps = pdf.getImageProperties(imgData);
            const imgWidth = pdfWidth;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

            // Add image to PDF (starting at top-left corner)
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            // Save/download the PDF file
            pdf.save('resume.pdf');

        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            element.classList.remove('print-mode');
            setIsPrintMode(false);
        }
    };

    const handleAnalyze = async (formData) => {
        setLoading(true);
        setError(null);
        setResumeData(null);
        setProgress({ step: 'starting', progress: 0, message: 'Initializing analysis...' });

        try {
            const response = await axiosInstance.post('/analyze-resume', formData);

            const { success, data, error } = response.data;

            if (success) {
                setResumeData(data.resumeData);
                setProgress({ step: 'complete', progress: 100, message: 'Analysis complete!' });
            } else {
                throw new Error(error || 'Analysis failed');
            }
        } catch (err) {
            console.error('Analysis error:', err);

            const errorMessage = err.response?.data?.error || err.message || 'Failed to analyze repositories';

            setError(errorMessage);
            setProgress({ step: 'error', progress: 0, message: 'Analysis failed' });
        } finally {
            setLoading(false);
        }

    };

    const handleRetry = () => {
        setError(null);
        setResumeData(null);
        setProgress({ step: '', progress: 0, message: '' });
    };

    return (
        <div>
            <div className="container mx-auto p-4">
                {error && <ErrorMessage error={error} onRetry={handleRetry} />}

                {resumeData && (
                    <div className="max-w-4xl mx-auto">
                        <div>
                            <TechnicalProfile technicalProfile={resumeData.technicalProfile} />
                        </div>

                        <div>
                            <button className="bg-zinc-700 cursor-pointer p-2 rounded-md" onClick={() => { setIsPrintMode(!isPrintMode) }}>Print Theme</button>
                        </div>

                        {/* Resume Section */}
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

                        <div className="text-center mt-8 space-x-4">
                            <button
                                onClick={handleDownload}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
                            >
                                Download Resume (PDF)
                            </button>
                            <button
                                onClick={() => {
                                    setResumeData(null);
                                    setProgress({ step: '', progress: 0, message: '' });
                                }}
                                className="bg-gray-500  px-6 py-2 rounded-md hover:bg-gray-600"
                            >
                                Generate Another Resume
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeAnalyzer;