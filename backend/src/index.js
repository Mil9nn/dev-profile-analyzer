// server.js - Main Express server with AST parsing and OpenAI integration
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const fs = require('fs').promises;
const path = require('path');
const { OpenAI } = require('openai');
const { exec } = require('child_process');
const { promisify } = require('util');

require('dotenv').config();

const app = express();
const execAsync = promisify(exec);

// Middleware
app.use(cors());
app.use(express.json());

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// File filter configuration
const IGNORE_PATTERNS = [
  'node_modules', 'dist', 'build', '.next', '.git', '.vscode', '.idea',
  'coverage', 'test', 'tests', '__tests__', 'cypress', 'public', 'assets',
  '.env', '.env.local', '.env.production', 'package-lock.json', 'yarn.lock',
  '.gitignore', 'README.md', 'LICENSE', '.DS_Store', 'Thumbs.db'
];

const PRIORITY_FILES = {
  frontend: [
    'App.jsx', 'App.js', 'index.js', 'index.jsx', 'main.js', 'main.jsx',
    'routes', 'router', 'components', 'pages', 'hooks', 'store', 'context',
    'utils', 'services', 'api', 'layouts', 'hoc'
  ],
  backend: [
    'server.js', 'app.js', 'index.js', 'main.js', 'routes', 'controllers',
    'models', 'middleware', 'config', 'services', 'utils', 'helpers',
    'validators', 'auth', 'database', 'db'
  ]
};

// GitHub API helper
class GitHubAnalyzer {
  constructor(repoUrl) {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) throw new Error('Invalid GitHub URL');
    
    this.owner = match[1];
    this.repo = match[2].replace('.git', '');
    this.apiBase = 'https://api.github.com';
  }

  async getRepoInfo() {
    const response = await axios.get(`${this.apiBase}/repos/${this.owner}/${this.repo}`);
    return {
      name: response.data.name,
      description: response.data.description,
      language: response.data.language,
      stars: response.data.stargazers_count,
      forks: response.data.forks_count,
      size: response.data.size,
      topics: response.data.topics
    };
  }

  async getFileTree() {
    const response = await axios.get(`${this.apiBase}/repos/${this.owner}/${this.repo}/git/trees/main?recursive=1`);
    return response.data.tree.filter(item => 
      item.type === 'blob' && 
      !IGNORE_PATTERNS.some(pattern => item.path.includes(pattern))
    );
  }

  async getFileContent(path) {
    try {
      const response = await axios.get(`${this.apiBase}/repos/${this.owner}/${this.repo}/contents/${path}`);
      return Buffer.from(response.data.content, 'base64').toString('utf-8');
    } catch (error) {
      console.warn(`Failed to fetch ${path}:`, error.message);
      return null;
    }
  }
}

// AST Parser for different file types
class ASTAnalyzer {
  constructor() {
    this.metrics = {
      complexity: 0,
      depth: 0,
      patterns: [],
      imports: [],
      exports: [],
      functions: [],
      classes: [],
      hooks: [],
      components: []
    };
  }

  parseJavaScript(code, filename) {
    try {
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties']
      });

      this.analyzeAST(ast, filename);
      return this.metrics;
    } catch (error) {
      console.warn(`Failed to parse ${filename}:`, error.message);
      return null;
    }
  }

  analyzeAST(ast, filename) {
    let depth = 0;
    let maxDepth = 0;

    traverse(ast, {
      enter(path) {
        depth++;
        maxDepth = Math.max(maxDepth, depth);
      },
      exit() {
        depth--;
      },
      
      ImportDeclaration: (path) => {
        this.metrics.imports.push({
          source: path.node.source.value,
          specifiers: path.node.specifiers.map(spec => spec.local.name)
        });
      },

      ExportDeclaration: (path) => {
        this.metrics.exports.push({
          type: path.node.type,
          name: path.node.declaration?.id?.name || 'default'
        });
      },

      FunctionDeclaration: (path) => {
        this.metrics.functions.push({
          name: path.node.id?.name,
          params: path.node.params.length,
          async: path.node.async,
          generator: path.node.generator
        });
        this.metrics.complexity += path.node.params.length + 1;
      },

      ArrowFunctionExpression: (path) => {
        this.metrics.functions.push({
          name: 'anonymous',
          params: path.node.params.length,
          async: path.node.async
        });
      },

      ClassDeclaration: (path) => {
        this.metrics.classes.push({
          name: path.node.id.name,
          superClass: path.node.superClass?.name,
          methods: path.node.body.body.filter(item => item.type === 'MethodDefinition').length
        });
      },

      JSXElement: (path) => {
        const elementName = path.node.openingElement.name.name;
        if (elementName && elementName[0] === elementName[0].toUpperCase()) {
          this.metrics.components.push(elementName);
        }
      },

      CallExpression: (path) => {
        const callee = path.node.callee;
        if (callee.name && callee.name.startsWith('use')) {
          this.metrics.hooks.push(callee.name);
        }
        
        // Detect patterns
        if (callee.property?.name === 'map' || callee.property?.name === 'filter') {
          this.metrics.patterns.push('functional-programming');
        }
      },

      IfStatement: () => {
        this.metrics.complexity += 1;
      },

      ConditionalExpression: () => {
        this.metrics.complexity += 1;
      },

      LogicalExpression: () => {
        this.metrics.complexity += 1;
      }
    });

    this.metrics.depth = maxDepth;
  }
}

// Code Quality Analyzer
class CodeQualityAnalyzer {
  constructor() {
    this.astAnalyzer = new ASTAnalyzer();
  }

  async analyzeRepository(repoUrl) {
    const github = new GitHubAnalyzer(repoUrl);
    
    // Get repository information
    const repoInfo = await github.getRepoInfo();
    const fileTree = await github.getFileTree();
    
    // Categorize and prioritize files
    const prioritizedFiles = this.prioritizeFiles(fileTree);
    
    // Analyze high-priority files
    const analysisResults = await this.analyzeFiles(github, prioritizedFiles);
    
    // Generate AI-powered insights
    const aiAnalysis = await this.generateAIAnalysis(analysisResults, repoInfo);
    
    return {
      repository: repoInfo,
      analysis: analysisResults,
      aiInsights: aiAnalysis,
      scores: this.calculateScores(analysisResults, aiAnalysis)
    };
  }

  prioritizeFiles(fileTree) {
    const categorized = {
      frontend: [],
      backend: [],
      config: [],
      other: []
    };

    fileTree.forEach(file => {
      const pathLower = file.path.toLowerCase();
      const ext = path.extname(file.path);
      
      // Skip non-code files
      if (!['.js', '.jsx', '.ts', '.tsx', '.vue', '.py', '.java', '.cpp', '.c'].includes(ext)) {
        return;
      }

      // Categorize files
      if (this.isFrontendFile(pathLower)) {
        categorized.frontend.push(file);
      } else if (this.isBackendFile(pathLower)) {
        categorized.backend.push(file);
      } else if (this.isConfigFile(pathLower)) {
        categorized.config.push(file);
      } else {
        categorized.other.push(file);
      }
    });

    // Sort by priority and limit to top files
    categorized.frontend = this.sortByPriority(categorized.frontend, PRIORITY_FILES.frontend).slice(0, 15);
    categorized.backend = this.sortByPriority(categorized.backend, PRIORITY_FILES.backend).slice(0, 15);

    return categorized;
  }

  isFrontendFile(pathLower) {
    return pathLower.includes('src/') || 
           pathLower.includes('components/') ||
           pathLower.includes('pages/') ||
           pathLower.includes('hooks/') ||
           pathLower.includes('store/') ||
           pathLower.includes('context/') ||
           PRIORITY_FILES.frontend.some(pattern => pathLower.includes(pattern.toLowerCase()));
  }

  isBackendFile(pathLower) {
    return pathLower.includes('server') ||
           pathLower.includes('api/') ||
           pathLower.includes('routes/') ||
           pathLower.includes('controllers/') ||
           pathLower.includes('models/') ||
           pathLower.includes('middleware/') ||
           PRIORITY_FILES.backend.some(pattern => pathLower.includes(pattern.toLowerCase()));
  }

  isConfigFile(pathLower) {
    return pathLower.includes('config') ||
           pathLower.includes('.config.') ||
           pathLower.includes('webpack') ||
           pathLower.includes('babel') ||
           pathLower.includes('eslint');
  }

  sortByPriority(files, priorities) {
    return files.sort((a, b) => {
      const aScore = priorities.reduce((score, pattern, index) => {
        return a.path.toLowerCase().includes(pattern.toLowerCase()) ? score + (priorities.length - index) : score;
      }, 0);
      
      const bScore = priorities.reduce((score, pattern, index) => {
        return b.path.toLowerCase().includes(pattern.toLowerCase()) ? score + (priorities.length - index) : score;
      }, 0);
      
      return bScore - aScore;
    });
  }

  async analyzeFiles(github, categorizedFiles) {
    const results = {
      frontend: { files: [], metrics: [], patterns: [] },
      backend: { files: [], metrics: [], patterns: [] }
    };

    // Analyze frontend files
    for (const file of categorizedFiles.frontend) {
      const content = await github.getFileContent(file.path);
      if (content) {
        const metrics = this.astAnalyzer.parseJavaScript(content, file.path);
        if (metrics) {
          results.frontend.files.push(file.path);
          results.frontend.metrics.push(metrics);
          results.frontend.patterns.push(...metrics.patterns);
        }
      }
    }

    // Analyze backend files
    for (const file of categorizedFiles.backend) {
      const content = await github.getFileContent(file.path);
      if (content) {
        const metrics = this.astAnalyzer.parseJavaScript(content, file.path);
        if (metrics) {
          results.backend.files.push(file.path);
          results.backend.metrics.push(metrics);
          results.backend.patterns.push(...metrics.patterns);
        }
      }
    }

    return results;
  }

  async generateAIAnalysis(analysisResults, repoInfo) {
    const prompt = this.buildAnalysisPrompt(analysisResults, repoInfo);
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a senior software engineer and technical interviewer with expertise in code quality assessment. Analyze the provided code metrics and repository data to give detailed, realistic feedback about job-readiness."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getFallbackAnalysis(analysisResults);
    }
  }

  buildAnalysisPrompt(analysisResults, repoInfo) {
    const frontendSummary = this.summarizeMetrics(analysisResults.frontend);
    const backendSummary = this.summarizeMetrics(analysisResults.backend);

    return `
Analyze this GitHub repository for job-readiness assessment:

Repository Info:
- Name: ${repoInfo.name}
- Language: ${repoInfo.language}
- Stars: ${repoInfo.stars}
- Size: ${repoInfo.size}KB
- Topics: ${repoInfo.topics?.join(', ') || 'None'}

Frontend Analysis (${analysisResults.frontend.files.length} files):
${frontendSummary}

Backend Analysis (${analysisResults.backend.files.length} files):
${backendSummary}

Please provide a JSON response with this exact structure:
{
  "frontend": {
    "score": 0-10,
    "framework": "detected framework",
    "libraries": ["list", "of", "libraries"],
    "concepts": ["advanced", "concepts", "found"],
    "strengths": ["specific", "strengths"],
    "weaknesses": ["areas", "for", "improvement"],
    "architecture": "description of code structure"
  },
  "backend": {
    "score": 0-10,
    "framework": "detected framework",
    "database": "detected database tech",
    "concepts": ["advanced", "concepts", "found"],
    "strengths": ["specific", "strengths"],
    "weaknesses": ["areas", "for", "improvement"],
    "architecture": "description of API structure"
  },
  "overall": {
    "score": 0-10,
    "jobReadiness": "Poor|Fair|Good|Excellent",
    "verdict": "detailed assessment paragraph",
    "recommendations": ["specific", "improvement", "suggestions"],
    "hireability": "honest assessment for entry-level positions"
  }
}

Be realistic and critical. Consider current job market standards where even skilled developers struggle to get interviews.
`;
  }

  summarizeMetrics(categoryData) {
    if (!categoryData.metrics.length) return "No files analyzed";

    const totalComplexity = categoryData.metrics.reduce((sum, m) => sum + m.complexity, 0);
    const avgComplexity = totalComplexity / categoryData.metrics.length;
    const totalFunctions = categoryData.metrics.reduce((sum, m) => sum + m.functions.length, 0);
    const allImports = categoryData.metrics.flatMap(m => m.imports.map(imp => imp.source));
    const uniqueLibraries = [...new Set(allImports)];

    return `
- Files analyzed: ${categoryData.files.join(', ')}
- Average complexity: ${avgComplexity.toFixed(2)}
- Total functions: ${totalFunctions}
- Libraries used: ${uniqueLibraries.slice(0, 10).join(', ')}
- Patterns detected: ${[...new Set(categoryData.patterns)].join(', ')}
`;
  }

  getFallbackAnalysis(analysisResults) {
    // Fallback analysis if OpenAI fails
    return {
      frontend: {
        score: 6.0,
        framework: "React (detected)",
        libraries: ["axios", "react-router"],
        concepts: ["Component architecture", "State management"],
        strengths: ["Basic component structure", "Modern React patterns"],
        weaknesses: ["Limited analysis due to API issues"],
        architecture: "Standard React application structure"
      },
      backend: {
        score: 6.0,
        framework: "Express.js (detected)",
        database: "Unknown",
        concepts: ["REST API", "Middleware"],
        strengths: ["Basic API structure"],
        weaknesses: ["Limited analysis due to API issues"],
        architecture: "Standard Express.js structure"
      },
      overall: {
        score: 6.0,
        jobReadiness: "Fair",
        verdict: "Analysis limited due to technical issues, but basic structure appears present.",
        recommendations: ["Complete full analysis", "Add comprehensive testing"],
        hireability: "Requires deeper analysis for accurate assessment"
      }
    };
  }

  calculateScores(analysisResults, aiAnalysis) {
    // Calculate technical scores based on metrics
    const frontendScore = this.calculateFrontendScore(analysisResults.frontend);
    const backendScore = this.calculateBackendScore(analysisResults.backend);
    
    return {
      frontend: Math.min(10, Math.max(0, frontendScore)),
      backend: Math.min(10, Math.max(0, backendScore)),
      overall: Math.min(10, Math.max(0, (frontendScore + backendScore) / 2)),
      aiAdjusted: {
        frontend: aiAnalysis.frontend?.score || frontendScore,
        backend: aiAnalysis.backend?.score || backendScore,
        overall: aiAnalysis.overall?.score || (frontendScore + backendScore) / 2
      }
    };
  }

  calculateFrontendScore(frontendData) {
    if (!frontendData.metrics.length) return 0;

    let score = 5; // Base score
    
    // Component usage
    const totalComponents = frontendData.metrics.reduce((sum, m) => sum + m.components.length, 0);
    if (totalComponents > 5) score += 1;
    
    // Hook usage
    const totalHooks = frontendData.metrics.reduce((sum, m) => sum + m.hooks.length, 0);
    if (totalHooks > 3) score += 1;
    
    // Import diversity (libraries used)
    const uniqueImports = new Set(frontendData.metrics.flatMap(m => m.imports.map(imp => imp.source)));
    if (uniqueImports.size > 5) score += 1;
    
    // Complexity balance
    const avgComplexity = frontendData.metrics.reduce((sum, m) => sum + m.complexity, 0) / frontendData.metrics.length;
    if (avgComplexity > 3 && avgComplexity < 15) score += 1;
    
    // File organization
    if (frontendData.files.length > 3) score += 1;

    return score;
  }

  calculateBackendScore(backendData) {
    if (!backendData.metrics.length) return 0;

    let score = 5; // Base score
    
    // Function organization
    const totalFunctions = backendData.metrics.reduce((sum, m) => sum + m.functions.length, 0);
    if (totalFunctions > 10) score += 1;
    
    // Async usage
    const asyncFunctions = backendData.metrics.reduce((sum, m) => 
      sum + m.functions.filter(f => f.async).length, 0);
    if (asyncFunctions > 0) score += 1;
    
    // Import diversity
    const uniqueImports = new Set(backendData.metrics.flatMap(m => m.imports.map(imp => imp.source)));
    if (uniqueImports.size > 5) score += 1;
    
    // File structure
    if (backendData.files.length > 3) score += 1;
    
    // Complexity management
    const avgComplexity = backendData.metrics.reduce((sum, m) => sum + m.complexity, 0) / backendData.metrics.length;
    if (avgComplexity > 5 && avgComplexity < 20) score += 1;

    return score;
  }
}

// API Routes
app.post('/api/analyze', async (req, res) => {
  try {
    const { repoUrl } = req.body;
    
    if (!repoUrl) {
      return res.status(400).json({ error: 'Repository URL is required' });
    }

    const analyzer = new CodeQualityAnalyzer();
    const results = await analyzer.analyzeRepository(repoUrl);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze repository',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : 'Contact support'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 GitHub Repository Analyzer API running on port ${PORT}`);
  console.log(`📊 AST parsing and AI analysis ready`);
});

module.exports = app;