// backend/src/index.js
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createServer } from 'http';

import { fetchGitHubCodeData } from './utils/fetchGitHubCodeData.js';
import { analyzeCodeComplexity, extractTechStack } from './utils/codeAnalysis.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Enhanced AI analysis with better scoring logic
const analyzeCodeQuality = async (githubData, linkedinProfile, socketId = null) => {
  // Emit progress update
  if (socketId) {
    io.to(socketId).emit('progress', {
      stage: 'ai_analysis',
      message: 'Starting AI code quality analysis...',
      progress: 80
    });
  }

  const frontendAnalysis = githubData.repositories.map(repo =>
    repo.codeAnalysis.frontend.map(file => ({
      repo: repo.name,
      file: file.path,
      complexity: file.complexity,
      preview: file.content.substring(0, 1500) // Increased for better analysis
    }))
  ).flat();

  const backendAnalysis = githubData.repositories.map(repo =>
    repo.codeAnalysis.backend.map(file => ({
      repo: repo.name,
      file: file.path,
      complexity: file.complexity,
      preview: file.content.substring(0, 1500)
    }))
  ).flat();

  const overallTechStack = [...new Set(
    githubData.repositories.flatMap(repo => repo.codeAnalysis.techStack)
  )];

  // Calculate baseline metrics for better scoring
  const totalFiles = frontendAnalysis.length + backendAnalysis.length;
  const avgComplexity = [...frontendAnalysis, ...backendAnalysis].reduce((sum, file) => 
    sum + (file.complexity.cyclomaticComplexity || 0), 0) / totalFiles || 0;
  const avgLinesOfCode = [...frontendAnalysis, ...backendAnalysis].reduce((sum, file) => 
    sum + (file.complexity.linesOfCode || 0), 0) / totalFiles || 0;
  const totalStars = githubData.repositories.reduce((sum, repo) => sum + repo.stars, 0);

  const prompt = `
You are a senior technical interviewer evaluating a developer's code quality. Analyze this developer's actual code with strict, realistic standards.

SCORING GUIDELINES:
- 1-3: Beginner (basic syntax, minimal structure, no best practices)
- 4-5: Junior (working code, some structure, basic patterns)
- 6-7: Mid-level (good structure, follows patterns, handles edge cases)
- 8-9: Senior (excellent architecture, advanced patterns, scalable design)
- 10: Expert (industry-leading code, innovative solutions, perfect implementation)

FRONTEND CODE ANALYSIS (${frontendAnalysis.length} files):
${frontendAnalysis.map(file => `
Repository: ${file.repo}
File: ${file.file}
Lines of Code: ${file.complexity.linesOfCode}
Functions: ${file.complexity.functionCount}
Cyclomatic Complexity: ${file.complexity.cyclomaticComplexity}
Comment Density: ${(file.complexity.commentDensity * 100).toFixed(1)}%
Code Preview:
${file.preview}
---
`).join('')}

BACKEND CODE ANALYSIS (${backendAnalysis.length} files):
${backendAnalysis.map(file => `
Repository: ${file.repo}
File: ${file.file}
Lines of Code: ${file.complexity.linesOfCode}
Functions: ${file.complexity.functionCount}
Cyclomatic Complexity: ${file.complexity.cyclomaticComplexity}
Comment Density: ${(file.complexity.commentDensity * 100).toFixed(1)}%
Code Preview:
${file.preview}
---
`).join('')}

REPOSITORY METRICS:
${githubData.repositories.map(repo => `
- ${repo.name}: ${repo.language} (${repo.stars} stars, ${repo.forks} forks)
  Frontend Files: ${repo.codeAnalysis.frontend.length}
  Backend Files: ${repo.codeAnalysis.backend.length}
  Last Updated: ${repo.lastUpdated}
`).join('')}

TECH STACK: ${overallTechStack.join(', ')}
AVERAGE COMPLEXITY: ${avgComplexity.toFixed(2)}
AVERAGE FILE SIZE: ${avgLinesOfCode.toFixed(0)} lines
TOTAL GITHUB STARS: ${totalStars}
LinkedIn: ${linkedinProfile || 'Not provided'}

ANALYSIS FOCUS AREAS:
1. Code Architecture & Design Patterns
2. Implementation Quality & Logic
3. Error Handling & Edge Cases
4. Security Best Practices
5. Performance Considerations
6. Code Maintainability & Documentation
7. Testing Approach
8. Modern Development Standards

Be harsh but fair in your evaluation. Consider:
- Simple projects with basic CRUD = 3-5 points
- Well-structured apps with good patterns = 5-7 points
- Advanced architecture with complex features = 7-9 points
- Production-ready, scalable solutions = 8-10 points

Provide analysis in this exact JSON format:
{
  "score": number (1-10, be realistic and strict),
  "codeQualityBreakdown": {
    "architecture": number (1-10),
    "implementation": number (1-10),
    "bestPractices": number (1-10),
    "complexity": number (1-10)
  },
  "rationale": ["specific reason based on code analysis", "another specific reason", "third specific reason"],
  "technologies": ["tech1", "tech2", "tech3"],
  "strengths": ["specific strength from code", "another strength", "third strength"],
  "weaknesses": ["specific weakness from code", "another weakness"],
  "improvements": ["specific improvement needed", "another improvement", "third improvement"],
  "codeMetrics": {
    "totalFiles": ${totalFiles},
    "avgComplexity": ${avgComplexity.toFixed(2)},
    "avgFileSize": ${avgLinesOfCode.toFixed(0)},
    "techStackDiversity": ${overallTechStack.length}
  },
  "hiringPotential": {
    "level": "Junior/Mid-Level/Senior/Principal",
    "details": "detailed assessment based on actual code quality and architecture",
    "watchAreas": ["area to monitor", "another area"],
    "readiness": "production-ready/needs-mentoring/requires-training"
  },
  "conclusion": "concise summary focusing on technical capabilities demonstrated in the code"
}`;

  try {
    if (socketId) {
      io.to(socketId).emit('progress', {
        stage: 'ai_analysis',
        message: 'Processing code with AI...',
        progress: 85
      });
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content: "You are a senior software architect and technical interviewer with 15+ years of experience. You evaluate code quality for hiring decisions with high standards. Be strict but fair - most developers are not seniors. Focus on actual code implementation, architecture decisions, and technical depth rather than superficial metrics."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.2 ,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (socketId) {
      io.to(socketId).emit('progress', {
        stage: 'ai_analysis',
        message: 'Finalizing analysis results...',
        progress: 95
      });
    }

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

// Socket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Main analysis endpoint with progress tracking
app.post('/api/analyze', async (req, res) => {
  const socketId = req.headers['x-socket-id'];
  
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
        error: 'Maximum 3 repositories allowed for deep code analysis'
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

    // Emit initial progress
    if (socketId) {
      io.to(socketId).emit('progress', {
        stage: 'start',
        message: `Starting analysis for ${username}...`,
        progress: 0,
        details: {
          username,
          repositoryCount: repositories.length
        }
      });
    }

    // Fetch GitHub code data with progress tracking
    const githubData = await fetchGitHubCodeData(username, repositories, socketId ? (progress) => {
      io.to(socketId).emit('progress', progress);
    } : null);

    // Analyze code quality with AI
    const aiFeedback = await analyzeCodeQuality(githubData, linkedinProfile, socketId);

    // Final progress update
    if (socketId) {
      io.to(socketId).emit('progress', {
        stage: 'complete',
        message: 'Analysis completed successfully!',
        progress: 100
      });
    }

    const totalFrontendFiles = githubData.repositories.reduce((sum, repo) => sum + repo.codeAnalysis.frontend.length, 0);
    const totalBackendFiles = githubData.repositories.reduce((sum, repo) => sum + repo.codeAnalysis.backend.length, 0);
    const techStackDiversity = [...new Set(githubData.repositories.flatMap(repo => repo.codeAnalysis.techStack))];

    res.json({
      success: true,
      aiFeedback,
      codeMetrics: {
        totalFrontendFiles,
        totalBackendFiles,
        techStackDiversity,
        repositoriesAnalyzed: githubData.repositories.length,
        analyzedAt: new Date().toISOString()
      },
      repositoryDetails: githubData.repositories.map(repo => ({
        name: repo.name,
        language: repo.language,
        stars: repo.stars,
        forks: repo.forks,
        filesAnalyzed: repo.codeAnalysis.frontend.length + repo.codeAnalysis.backend.length,
        techStack: repo.codeAnalysis.techStack
      }))
    });

  } catch (error) {
    console.error('Analysis Error:', error.message);

    // Emit error to socket
    if (socketId) {
      io.to(socketId).emit('progress', {
        stage: 'error',
        message: error.message,
        progress: 0
      });
    }

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
    message: 'Enhanced Code Quality Analyzer API v2.1',
    version: '2.1.0',
    features: [
      'Real-time progress tracking via WebSocket',
      'Deep code analysis of up to 15 frontend + 15 backend files per repo',
      'Enhanced AI scoring with realistic evaluation criteria',
      'Comprehensive code complexity metrics and quality scoring',
      'Tech stack identification from actual code',
      'Architecture and implementation pattern analysis'
    ],
    endpoints: {
      analyze: 'POST /api/analyze',
      health: 'GET /api/health'
    },
    websocket: {
      endpoint: '/socket.io',
      events: ['progress', 'error', 'complete']
    }
  });
});

server.listen(PORT, () => {
  console.log(`Enhanced Code Quality Analyzer with WebSocket running on port ${PORT}`);
});