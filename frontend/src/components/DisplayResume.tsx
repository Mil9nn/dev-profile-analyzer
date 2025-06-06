import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAnalysisStore } from '../store/useAnalysisStore';
import { 
  Github, 
  Linkedin, 
  Star, 
  Code, 
  Award, 
  Download, 
  ExternalLink,
  User,
  Briefcase,
  TrendingUp,
  BookOpen,
  Mail,
  Phone,
  MapPin,
  ArrowLeft
} from 'lucide-react';

const DisplayResume = () => {
  const { analysisResult, reset } = useAnalysisStore();
  const [activeTab, setActiveTab] = useState('resume');

  if (!analysisResult?.data?.resumeData) return null;

  const { resumeData } = analysisResult.data;
  const { personalInfo, skills, projects, technicalProfile } = resumeData;

  const downloadResume = () => {
    const resumeHtml = document.getElementById('resume-content').innerHTML;
    const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${personalInfo.name} - Resume</title>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background: #f8f9fa; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #2563eb; }
        .header h1 { margin: 0; color: #1e293b; font-size: 2.5em; }
        .header p { margin: 5px 0; color: #64748b; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #2563eb; font-size: 1.5em; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }
        .project { background: #f8fafc; padding: 20px; margin-bottom: 20px; border-radius: 8px; border-left: 4px solid #2563eb; }
        .project h3 { margin: 0 0 10px 0; color: #1e293b; }
        .project-meta { display: flex; gap: 15px; margin-bottom: 10px; }
        .project-meta span { background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 0.85em; color: #475569; }
        .skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .skill-category { background: #f1f5f9; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .skill-category h3 { margin: 0 0 10px 0; color: #1e293b; font-size: 1.1em; }
        .skill-list { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill-tag { background: #2563eb; color: white; padding: 4px 12px; border-radius: 15px; font-size: 0.85em; }
        .contact-info { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin-top: 15px; }
        .contact-info a { color: #2563eb; text-decoration: none; }
        .contact-info a:hover { text-decoration: underline; }
        .summary { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; font-style: italic; }
        @media print { 
          body { background: white; padding: 0; } 
          .container { box-shadow: none; padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${resumeHtml}
      </div>
    </body>
    </html>
    `;
    
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${personalInfo.name.replace(/\s+/g, '_')}_Resume.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(resumeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${personalInfo.name.replace(/\s+/g, '_')}_ResumeData.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Action Bar */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Resume Generated Successfully!</h2>
            <p className="text-purple-200">AI-powered professional resume for {personalInfo.name}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={downloadResume}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download HTML
            </button>
            <button
              onClick={downloadJSON}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Code className="w-4 h-4" />
              Export JSON
            </button>
            <button
              onClick={reset}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              New Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
        <div className="flex border-b border-white/20">
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'resume'
                ? 'text-white bg-purple-600/30 border-b-2 border-purple-400'
                : 'text-purple-200 hover:text-white'
            }`}
          >
            Resume Preview
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'analysis'
                ? 'text-white bg-purple-600/30 border-b-2 border-purple-400'
                : 'text-purple-200 hover:text-white'
            }`}
          >
            Detailed Analysis
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'resume' && (
            <div id="resume-content" className="bg-white text-gray-800 p-8 rounded-lg">
              {/* Header */}
              <div className="text-center mb-8 pb-6 border-b-2 border-blue-600">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{personalInfo.name}</h1>
                <p className="text-lg text-gray-600 mb-3">Software Developer</p>
                <div className="flex justify-center items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    <span>@{personalInfo.githubUsername}</span>
                  </div>
                  {personalInfo.linkedinUrl && (
                    <div className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4" />
                      <a href={personalInfo.linkedinUrl} className="text-blue-600 hover:underline">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Summary */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-blue-600 mb-4 pb-2 border-b border-gray-300">
                  Professional Summary
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg italic text-gray-700 leading-relaxed">
                  {personalInfo.professionalSummary}
                </div>
                {personalInfo.valueProposition && (
                  <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <strong className="text-blue-800">Value Proposition: </strong>
                    <span className="text-gray-700">{personalInfo.valueProposition}</span>
                  </div>
                )}
              </section>

              {/* Technical Skills */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-blue-600 mb-4 pb-2 border-b border-gray-300">
                  Technical Skills
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(skills.core).map(([category, skillList]) => (
                    <div key={category} className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">{category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {skillList.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {skills.specializations && skills.specializations.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Specializations:</h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm border border-green-300"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Projects */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-blue-600 mb-4 pb-2 border-b border-gray-300">
                  Key Projects
                </h2>
                <div className="space-y-6">
                  {projects.map((project, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-600">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                        <div className="flex items-center gap-2 text-yellow-600">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-sm font-medium">Score: {project.innovationScore}/10</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4 leading-relaxed">{project.description}</p>
                      
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {project.technologies.map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {project.keyFeatures && project.keyFeatures.length > 0 && (
                        <div className="mb-3">
                          <h4 className="font-medium text-gray-900 mb-2">Key Features:</h4>
                          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                            {project.keyFeatures.map((feature, featureIndex) => (
                              <li key={featureIndex}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-blue-600">
                        <Github className="w-4 h-4" />
                        <a href={project.githubUrl} className="hover:underline text-sm">
                          View on GitHub
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Technical Profile Summary */}
              <section>
                <h2 className="text-2xl font-bold text-blue-600 mb-4 pb-2 border-b border-gray-300">
                  Technical Profile
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{technicalProfile.totalProjects}</div>
                    <div className="text-sm text-gray-600">Projects Analyzed</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{technicalProfile.languages.length}</div>
                    <div className="text-sm text-gray-600">Programming Languages</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{technicalProfile.avgInnovationScore.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Avg Innovation Score</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">{skills.experienceLevel}</div>
                    <div className="text-sm text-gray-600">Experience Level</div>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Industry Strengths:</h4>
                  <div className="flex flex-wrap gap-2">
                    {technicalProfile.industryStrengths.map((strength, index) => (
                      <span
                        key={index}
                        className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                      >
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* Detailed Project Analysis */}
              <h3 className="text-2xl font-bold text-white mb-6">Detailed Project Analysis</h3>
              
              {analysisResult.data.skillAnalysis.map((repo, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 rounded-xl p-6 border border-white/10"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">{repo.name}</h4>
                      <p className="text-purple-200 mb-2">{repo.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-300">
                        <span>Language: {repo.language}</span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {repo.stars} stars
                        </span>
                        <span>Forks: {repo.forks}</span>
                      </div>
                    </div>
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {repo.insights && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-white font-medium mb-2">Technical Skills</h5>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {repo.insights.technicalSkills.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        <h5 className="text-white font-medium mb-2">Architecture Patterns</h5>
                        <div className="flex flex-wrap gap-2">
                          {repo.insights.architecturePatterns.map((pattern, patternIndex) => (
                            <span
                              key={patternIndex}
                              className="bg-green-600/30 text-green-200 px-2 py-1 rounded text-sm"
                            >
                              {pattern}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="mb-4">
                          <h5 className="text-white font-medium mb-2">Innovation Score</h5>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-white/10 rounded-full h-3">
                              <div
                                className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full"
                                style={{ width: `${repo.insights.innovationScore * 10}%` }}
                              />
                            </div>
                            <span className="text-white font-bold">{repo.insights.innovationScore}/10</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h5 className="text-white font-medium mb-2">Skill Level</h5>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            repo.insights.skillLevel === 'Expert' ? 'bg-red-600/30 text-red-200' :
                            repo.insights.skillLevel === 'Advanced' ? 'bg-orange-600/30 text-orange-200' :
                            repo.insights.skillLevel === 'Intermediate' ? 'bg-yellow-600/30 text-yellow-200' :
                            'bg-green-600/30 text-green-200'
                          }`}>
                            {repo.insights.skillLevel}
                          </span>
                        </div>

                        <div>
                          <h5 className="text-white font-medium mb-2">Industry Relevance</h5>
                          <span className="bg-purple-600/30 text-purple-200 px-3 py-1 rounded-full text-sm">
                            {repo.insights.industryRelevance}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {repo.structure && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <h5 className="text-white font-medium mb-3">Repository Structure Analysis</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="bg-white/5 p-3 rounded">
                          <div className="text-purple-200">Total Files</div>
                          <div className="text-white font-bold">{repo.structure.files.length}</div>
                        </div>
                        <div className="bg-white/5 p-3 rounded">
                          <div className="text-purple-200">Code Files</div>
                          <div className="text-white font-bold">{repo.structure.codeFiles.length}</div>
                        </div>
                        <div className="bg-white/5 p-3 rounded">
                          <div className="text-purple-200">Has Tests</div>
                          <div className={`font-bold ${repo.structure.hasTests ? 'text-green-400' : 'text-red-400'}`}>
                            {repo.structure.hasTests ? 'Yes' : 'No'}
                          </div>
                        </div>
                        <div className="bg-white/5 p-3 rounded">
                          <div className="text-purple-200">Documentation</div>
                          <div className={`font-bold ${repo.structure.hasDocumentation ? 'text-green-400' : 'text-red-400'}`}>
                            {repo.structure.hasDocumentation ? 'Yes' : 'No'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DisplayResume;