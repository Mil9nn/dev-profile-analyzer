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
  MapPin
} from 'lucide-react';

const ResumeDisplay = () => {
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
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .section h2 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 5px; }
        .project { background: #f8f9fa; padding: 15px; margin-bottom: 15px; border-radius: 8px; }
        .skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .skill-category { background: #e3f2fd; padding: 10px; border-radius: 5px; }
        @media print { body { padding: 0; } }
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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Resume Generated Successfully!</h2>
            <p className="text-purple-200">AI-powered professional resume for {personalInfo.name}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={downloadResume}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />