import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

import { fetchGitHubCodeData } from './utlis/fetchGitHubCodeData.js';
import { categorizeFiles } from './utlis/categorizeFiles.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Helper function to fetch file content
const fetchFileContent = async (username, repo, filePath, githubConfig) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${username}/${repo}/contents/${filePath}`,
      githubConfig
    );

    if (response.data.content) {
      return Buffer.from(response.data.content, 'base64').toString('utf-8');
    }
    return null;
  } catch (error) {
    console.warn(`Could not fetch ${filePath}: ${error.message}`);
    return null;
  }
};

// Analyze code complexity
const analyzeCodeComplexity = (content, filePath) => {
  const lines = content.split('\n').length;
  const functions = (content.match(/function\s+\w+|const\s+\w+\s*=\s*\(|def\s+\w+|class\s+\w+/g) || []).length;
  const imports = (content.match(/import\s+|from\s+|require\(|#include|using\s+/g) || []).length;
  const comments = (content.match(/\/\/|\/\*|\*\/|#|<!--/g) || []).length;
  const complexPatterns = (content.match(/if\s*\(|for\s*\(|while\s*\(|switch\s*\(|try\s*{|catch\s*\(/g) || []).length;

  return {
    linesOfCode: lines,
    functionCount: functions,
    importCount: imports,
    commentDensity: comments / lines,
    cyclomaticComplexity: complexPatterns,
    codeQualityScore: Math.min(10, (comments / lines * 10) + (functions > 0 ? 2 : 0) + (imports > 0 ? 1 : 0))
  };
};

// Extract tech stack from config files
const extractTechStack = (content, filePath) => {
  const techStack = [];

  if (filePath.includes('package.json')) {
    try {
      const packageData = JSON.parse(content);
      const deps = { ...packageData.dependencies, ...packageData.devDependencies };
      Object.keys(deps).forEach(dep => {
        if (dep.includes('react')) techStack.push('React');
        if (dep.includes('vue')) techStack.push('Vue.js');
        if (dep.includes('angular')) techStack.push('Angular');
        if (dep.includes('express')) techStack.push('Express.js');
        if (dep.includes('typescript')) techStack.push('TypeScript');
        if (dep.includes('webpack')) techStack.push('Webpack');
        if (dep.includes('tailwind')) techStack.push('Tailwind CSS');
      });
    } catch (e) {
      console.warn('Could not parse package.json');
    }
  }

  if (filePath.includes('requirements.txt') || filePath.includes('.py')) {
    if (content.includes('django')) techStack.push('Django');
    if (content.includes('flask')) techStack.push('Flask');
    if (content.includes('fastapi')) techStack.push('FastAPI');
    if (content.includes('pandas')) techStack.push('Pandas');
    if (content.includes('numpy')) techStack.push('NumPy');
  }

  return techStack;
};

// Enhanced AI analysis focusing on code quality
const analyzeCodeQuality = async (githubData, linkedinProfile) => {
  // Prepare comprehensive code analysis prompt
  const frontendAnalysis = githubData.repositories.map(repo =>
    repo.codeAnalysis.frontend.map(file => ({
      repo: repo.name,
      file: file.path,
      complexity: file.complexity,
      preview: file.content.substring(0, 1000) // First 1000 chars for analysis
    }))
  ).flat();

  const backendAnalysis = githubData.repositories.map(repo =>
    repo.codeAnalysis.backend.map(file => ({
      repo: repo.name,
      file: file.path,
      complexity: file.complexity,
      preview: file.content.substring(0, 1000)
    }))
  ).flat();

  const overallTechStack = [...new Set(
    githubData.repositories.flatMap(repo => repo.codeAnalysis.techStack)
  )];

  const prompt = `
Analyze this developer's code quality based on actual code examination:

FRONTEND CODE ANALYSIS (${frontendAnalysis.length} files):
${frontendAnalysis.map(file => `
File: ${file.file}
Complexity Metrics: ${JSON.stringify(file.complexity)}
Code Preview: ${file.preview}
---
`).join('')}

BACKEND CODE ANALYSIS (${backendAnalysis.length} files):
${backendAnalysis.map(file => `
File: ${file.file}
Complexity Metrics: ${JSON.stringify(file.complexity)}
Code Preview: ${file.preview}
---
`).join('')}

TECH STACK IDENTIFIED: ${overallTechStack.join(', ')}

REPOSITORY METRICS:
${githubData.repositories.map(repo => `
- ${repo.name}: ${repo.language} (${repo.stars} stars, Frontend: ${repo.codeAnalysis.frontend.length} files, Backend: ${repo.codeAnalysis.backend.length} files)
`).join('')}

LinkedIn: ${linkedinProfile || 'Not provided'}

Focus your analysis on:
1. Code structure, organization, and architectural patterns
2. Function depth, complexity, and logic implementation quality
3. Modern development practices and design patterns usage
4. Error handling, security considerations, and best practices
5. Code maintainability, readability, and documentation
6. Technology stack depth and expertise level
7. Full-stack capability assessment

Provide analysis in this exact JSON format:
{
  "score": number (1-10),
  "codeQualityBreakdown": {
    "architecture": number (1-10),
    "implementation": number (1-10),
    "bestPractices": number (1-10),
    "complexity": number (1-10)
  },
  "rationale": ["reason1", "reason2", "reason3"],
  "technologies": ["tech1", "tech2", "tech3"],
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "hiringPotential": {
    "level": "Junior/Mid/Senior",
    "details": "detailed assessment based on code quality",
    "watchAreas": ["area1", "area2"]
  },
  "conclusion": "overall summary focusing on technical capabilities"
}`;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "o4-mini-2025-04-16", // Using GPT-4 for better code analysis
      messages: [
        {
          role: "system",
          content: "You are a senior software developer who evaluates code quality for hiring decisions. Focus on actual code implementation, architecture, and technical depth rather than superficial metrics."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_completion_tokens: 900,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const aiResponse = response.data.choices[0].message.content;
    const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedResponse);

  } catch (error) {
    console.error('OpenAI API Error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      throw new Error('Invalid OpenAI API key');
    }
    if (error.response?.status === 429) {
      throw new Error('OpenAI API rate limit exceeded');
    }
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse AI response');
    }

    throw new Error(`AI analysis failed: ${error.message}`);
  }
};

// Main analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { githubProfile, linkedinProfile, repositories } = req.body;

    // Validate input
    if (!githubProfile || !repositories || repositories.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'GitHub profile and at least one repository are required'
      });
    }

    // Limit repositories to prevent API exhaustion
    if (repositories.length > 3) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 03 repositories allowed for deep code analysis'
      });
    }

    const username = githubProfile.includes('/')
      ? githubProfile.split('/').filter(Boolean).pop()
      : githubProfile;

    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'Invalid GitHub profile format'
      });
    }

    console.log(`Starting deep code analysis for: ${username}`);

    // Fetch GitHub code data
    const githubData = await fetchGitHubCodeData(username, repositories);

    // Analyze code quality with AI
    const aiFeedback = await analyzeCodeQuality(githubData, linkedinProfile);

    console.log(`Code analysis completed for ${username} - Score: ${aiFeedback.score}/10`);

    res.json({
      success: true,
      aiFeedback,
      codeMetrics: {
        totalFrontendFiles: githubData.repositories.reduce((sum, repo) => sum + repo.codeAnalysis.frontend.length, 0),
        totalBackendFiles: githubData.repositories.reduce((sum, repo) => sum + repo.codeAnalysis.backend.length, 0),
        techStackDiversity: [...new Set(githubData.repositories.flatMap(repo => repo.codeAnalysis.techStack))],
        analyzedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Analysis Error:', error.message);

    const statusCode = error.message.includes('not found') ? 404 :
      error.message.includes('rate limit') ? 429 :
        error.message.includes('API key') ? 401 : 500;

    res.status(statusCode).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Enhanced Code Quality Analyzer API',
    version: '2.0.0',
    features: [
      'Deep code analysis of up to 15 frontend + 15 backend files per repo',
      'Code complexity metrics and quality scoring',
      'Tech stack identification from actual code',
      'Architecture and implementation pattern analysis'
    ],
    endpoints: {
      analyze: 'POST /api/analyze',
      health: 'GET /api/health'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Enhanced Code Quality Analyzer running on port ${PORT}`);
});