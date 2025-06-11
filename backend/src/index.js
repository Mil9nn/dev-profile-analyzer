import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import OpenAI from 'openai';
import axios from 'axios';
import { connectDB } from './config/db.js';
import { Resume } from './models/resume.model.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Enhanced MongoDB Schema

// Connect to MongoDB
connectDB();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// GitHub API helper
const fetchGitHubRepo = async (repoUrl) => {
  try {
    // Extract owner and repo name from URL
    const urlParts = repoUrl.replace('https://github.com/', '').split('/');
    const owner = urlParts[0];
    const repo = urlParts[1];

    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);
    return { ...response.data, owner, repo };
  } catch (error) {
    throw new Error(`Repository not found: ${repoUrl}`);
  }
};

// Recursively fetch directory contents
const fetchDirectoryContents = async (owner, repo, path = '', depth = 0, maxDepth = 3) => {
  // Prevent infinite recursion and API rate limiting
  if (depth > maxDepth) {
    console.log(`🚫 Max depth reached for path: ${path}`);
    return [];
  }

  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents${path ? `/${path}` : ''}`;
    console.log(`📂 Fetching directory: ${path || 'root'} (depth: ${depth})`);
    
    const response = await axios.get(url);
    const items = response.data;
    
    if (!Array.isArray(items)) {
      console.log(`⚠️  Single file found at path: ${path}`);
      return [items];
    }

    let allFiles = [];
    
    for (const item of items) {
      const itemPath = path ? `${path}/${item.name}` : item.name;
      
      if (item.type === 'file') {
        console.log(`📄 File found: ${itemPath} (${item.size} bytes)`);
        allFiles.push({
          ...item,
          fullPath: itemPath,
          depth: depth
        });
      } else if (item.type === 'dir') {
        console.log(`📁 Directory found: ${itemPath}`);
        
        // Skip common directories that don't contain meaningful code
        const skipDirs = [
          'node_modules', '.git', '.github', 'dist', 'build', 
          'coverage', '.nyc_output', 'logs', 'tmp', 'temp',
          '.next', '.nuxt', 'vendor', '__pycache__', '.pytest_cache',
          '.vscode', '.idea', 'target', 'bin', 'obj',
          'seeds', 'public', 'ui',
        ];
        
        if (!skipDirs.includes(item.name.toLowerCase())) {
          try {
            // Add small delay to respect GitHub API rate limits
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const subdirFiles = await fetchDirectoryContents(owner, repo, itemPath, depth + 1, maxDepth);
            allFiles = allFiles.concat(subdirFiles);
          } catch (error) {
            console.log(`⚠️  Could not access directory ${itemPath}: ${error.message}`);
          }
        } else {
          console.log(`⏭️  Skipping directory: ${itemPath}`);
        }
      }
    }
    
    return allFiles;
  } catch (error) {
    console.error(`❌ Error fetching directory ${path}:`, error.message);
    return [];
  }
};

// Enhanced repository structure analysis with deep directory exploration
const analyzeRepoStructure = async (owner, repo) => {
  try {
    console.log(`\n🔍 Starting deep analysis of ${owner}/${repo}`);
    console.log('=' * 50);
    
    // Fetch all files recursively
    const allFiles = await fetchDirectoryContents(owner, repo);
    console.log(`\n📊 Total files discovered: ${allFiles.length}`);
    
    // Define code file extensions and their categories
    const codeExtensions = {
      // Web Technologies
      'js': 'JavaScript',
      'jsx': 'React/JavaScript',
      'ts': 'TypeScript', 
      'tsx': 'TypeScript React',
      'vue': 'Vue.js',
      'svelte': 'Svelte',
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS',
      'sass': 'Sass',
      'less': 'Less',
      
      // Backend Languages
      'py': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'cc': 'C++',
      'cxx': 'C++',
      'c': 'C',
      'h': 'C/C++ Header',
      'hpp': 'C++ Header',
      'go': 'Go',
      'rs': 'Rust',
      'php': 'PHP',
      'rb': 'Ruby',
      'swift': 'Swift',
      'kt': 'Kotlin',
      'scala': 'Scala',
      'cs': 'C#',
      'vb': 'Visual Basic',
      
      // Mobile
      'dart': 'Dart/Flutter',
      'm': 'Objective-C',
      'mm': 'Objective-C++',
      
      // Data & Config
      'json': 'JSON',
      'xml': 'XML',
      'yaml': 'YAML',
      'yml': 'YAML',
      'toml': 'TOML',
      'ini': 'INI',
      
      // Database
      'sql': 'SQL',
      'graphql': 'GraphQL',
      
      // Shell & Scripts
      'sh': 'Shell Script',
      'bash': 'Bash Script',
      'zsh': 'Zsh Script',
      'ps1': 'PowerShell',
      'bat': 'Batch Script',
      
      // Documentation
      'md': 'Markdown',
      'rst': 'reStructuredText',
      'tex': 'LaTeX'
    };

    // Filter and categorize code files
    const codeFiles = allFiles.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ext && codeExtensions[ext];
    });

    console.log(`\n💻 Code files found: ${codeFiles.length}`);
    console.log('Code files by language:');
    
    // Group by language and log
    const languageGroups = {};
    codeFiles.forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const language = codeExtensions[ext];
      
      if (!languageGroups[language]) {
        languageGroups[language] = [];
      }
      languageGroups[language].push(file);
    });

    // Log files by language
    Object.entries(languageGroups).forEach(([language, files]) => {
      console.log(`\n📝 ${language} (${files.length} files):`);
      files.slice(0, 5).forEach(file => { // Show first 5 files per language
        console.log(`   • ${file.fullPath} (${file.size} bytes)`);
      });
      if (files.length > 5) {
        console.log(`   ... and ${files.length - 5} more files`);
      }
    });

    // Look for README file
    let readmeContent = '';
    const readmeFile = allFiles.find(file => 
      file.name.toLowerCase().startsWith('readme')
    );
    
    if (readmeFile) {
      try {
        console.log(`\n📖 README found: ${readmeFile.fullPath}`);
        const readmeResponse = await axios.get(readmeFile.download_url);
        readmeContent = readmeResponse.data;
      } catch (error) {
        console.log(`⚠️  Could not fetch README content: ${error.message}`);
      }
    }

    // Identify special files and patterns
    const specialFiles = {
      packageFiles: allFiles.filter(f => 
        ['package.json', 'requirements.txt', 'pom.xml', 'Cargo.toml', 'go.mod', 'composer.json', 'Gemfile', 'setup.py'].includes(f.name)
      ),
      configFiles: allFiles.filter(f => 
        f.name.match(/\.(config|conf|cfg|ini|env|properties)$/i) || 
        ['webpack.config.js', 'vite.config.js', 'next.config.js', 'nuxt.config.js', 'tsconfig.json', '.eslintrc', '.prettierrc'].includes(f.name)
      ),
      testFiles: allFiles.filter(f => 
        f.name.toLowerCase().includes('test') || 
        f.name.toLowerCase().includes('spec') ||
        f.fullPath.toLowerCase().includes('/test/') ||
        f.fullPath.toLowerCase().includes('/tests/') ||
        f.fullPath.toLowerCase().includes('/__tests__/')
      ),
      dockerFiles: allFiles.filter(f => 
        f.name.toLowerCase().includes('dockerfile') || 
        f.name === 'docker-compose.yml' || 
        f.name === 'docker-compose.yaml'
      ),
      ciFiles: allFiles.filter(f => 
        f.fullPath.includes('.github/workflows/') ||
        f.name === '.travis.yml' ||
        f.name === 'jenkins' ||
        f.name === '.gitlab-ci.yml'
      )
    };

    // Log special files found
    console.log(`\n🔧 Special files analysis:`);
    console.log(`   Package files: ${specialFiles.packageFiles.length}`);
    console.log(`   Config files: ${specialFiles.configFiles.length}`);
    console.log(`   Test files: ${specialFiles.testFiles.length}`);
    console.log(`   Docker files: ${specialFiles.dockerFiles.length}`);
    console.log(`   CI/CD files: ${specialFiles.ciFiles.length}`);

    // Analyze project structure patterns
    const directories = [...new Set(allFiles.map(f => f.fullPath.split('/').slice(0, -1).join('/')).filter(Boolean))];
    const commonPatterns = {
      hasSrc: directories.some(d => d.includes('src')),
      hasLib: directories.some(d => d.includes('lib')),
      hasComponents: directories.some(d => d.includes('components')),
      hasPages: directories.some(d => d.includes('pages')),
      hasRoutes: directories.some(d => d.includes('routes')),
      hasControllers: directories.some(d => d.includes('controllers')),
      hasModels: directories.some(d => d.includes('models')),
      hasViews: directories.some(d => d.includes('views')),
      hasServices: directories.some(d => d.includes('services')),
      hasUtils: directories.some(d => d.includes('utils') || d.includes('helpers')),
      hasAssets: directories.some(d => d.includes('assets') || d.includes('static')),
      hasPublic: directories.some(d => d.includes('public')),
      hasApi: directories.some(d => d.includes('api'))
    };

    console.log(`\n🏗️  Project structure patterns:`);
    Object.entries(commonPatterns).forEach(([pattern, exists]) => {
      if (exists) console.log(`   ✅ ${pattern}`);
    });

    console.log('\n' + '=' * 50);
    console.log(`✅ Analysis complete for ${owner}/${repo}`);

    return {
      totalFiles: allFiles.length,
      files: allFiles.map(f => ({ 
        name: f.name, 
        type: f.type, 
        path: f.fullPath,
        size: f.size,
        depth: f.depth 
      })),
      codeFiles: codeFiles.map(f => ({ 
        name: f.name, 
        path: f.fullPath,
        language: getLanguageFromFile(f.name),
        size: f.size,
        depth: f.depth
      })),
      languageDistribution: Object.entries(languageGroups).map(([language, files]) => ({
        language,
        fileCount: files.length,
        totalSize: files.reduce((sum, f) => sum + (f.size || 0), 0)
      })),
      readmeContent: readmeContent.substring(0, 2000),
      hasDocumentation: readmeFile !== undefined,
      hasTests: specialFiles.testFiles.length > 0,
      packageFiles: specialFiles.packageFiles,
      configFiles: specialFiles.configFiles,
      testFiles: specialFiles.testFiles,
      dockerFiles: specialFiles.dockerFiles,
      ciFiles: specialFiles.ciFiles,
      projectPatterns: commonPatterns,
      directoryStructure: directories.slice(0, 20), // Limit for response size
      analysisMetadata: {
        maxDepthReached: 3,
        totalDirectories: directories.length,
        analysisTimestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error(`❌ Repository analysis failed for ${owner}/${repo}:`, error.message);
    return { 
      totalFiles: 0,
      files: [], 
      codeFiles: [], 
      languageDistribution: [],
      readmeContent: '', 
      hasDocumentation: false, 
      hasTests: false, 
      packageFiles: [],
      configFiles: [],
      testFiles: [],
      dockerFiles: [],
      ciFiles: [],
      projectPatterns: {},
      directoryStructure: [],
      analysisMetadata: {
        error: error.message,
        analysisTimestamp: new Date().toISOString()
      }
    };
  }
};

// Get programming language from file extension
const getLanguageFromFile = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const langMap = {
    'js': 'JavaScript', 'jsx': 'React/JavaScript', 'ts': 'TypeScript', 'tsx': 'TypeScript React',
    'vue': 'Vue.js', 'svelte': 'Svelte', 'html': 'HTML', 'css': 'CSS', 'scss': 'SCSS', 'sass': 'Sass',
    'py': 'Python', 'java': 'Java', 'cpp': 'C++', 'cc': 'C++', 'cxx': 'C++', 'c': 'C', 'h': 'C/C++ Header',
    'go': 'Go', 'rs': 'Rust', 'php': 'PHP', 'rb': 'Ruby', 'swift': 'Swift', 'kt': 'Kotlin',
    'scala': 'Scala', 'cs': 'C#', 'dart': 'Dart/Flutter', 'sql': 'SQL', 'graphql': 'GraphQL',
    'sh': 'Shell Script', 'bash': 'Bash Script', 'ps1': 'PowerShell', 'md': 'Markdown'
  };
  return langMap[ext] || ext?.toUpperCase() || 'Unknown';
};

// Enhanced AI analysis for project insights
const generateProjectInsights = async (repoData, structure) => {
  try {
    const prompt = `
    Analyze this GitHub repository with deep directory structure analysis:
    
    Repository: ${repoData.name}
    Description: ${repoData.description || 'No description provided'}
    Primary Language: ${repoData.language}
    Stars: ${repoData.stargazers_count}
    Forks: ${repoData.forks_count}
    
    Detailed Code Analysis:
    - Total Files: ${structure.totalFiles}
    - Code Files: ${structure.codeFiles.length}
    - Languages Found: ${structure.languageDistribution.map(l => `${l.language} (${l.fileCount} files)`).join(', ')}
    - Has Tests: ${structure.hasTests} (${structure.testFiles.length} test files)
    - Has Documentation: ${structure.hasDocumentation}
    - Has Docker: ${structure.dockerFiles.length > 0}
    - Has CI/CD: ${structure.ciFiles.length > 0}
    
    Project Structure Patterns:
    ${Object.entries(structure.projectPatterns).filter(([_, exists]) => exists).map(([pattern, _]) => `- ${pattern}`).join('\n')}
    
    Configuration Files: ${structure.configFiles.length}
    Package Files: ${structure.packageFiles.map(f => f.name).join(', ')}
    
    README Content (first 500 chars):
    ${structure.readmeContent.substring(0, 500)}
    
    Based on this comprehensive analysis, generate insights including:
    1. Project summary (2-3 sentences for resume)
    2. Technical skills demonstrated (be specific based on actual files found)
    3. Architecture patterns and best practices identified
    4. Innovation and complexity level (1-10) based on project structure
    5. Key achievements and features
    6. Skill level assessment (Beginner/Intermediate/Advanced/Expert)
    7. Industry relevance and market value
    
    Respond in JSON format with these exact keys: projectSummary, technicalSkills, architecturePatterns, innovationScore, keyFeatures, skillLevel, industryRelevance, resumeDescription
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000
    });

    let content = response.choices[0].message.content.trim();
    // Remove markdown code blocks if present
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return JSON.parse(content);
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return {
      projectSummary: `${repoData.name}: A ${repoData.language} project showcasing modern development practices with ${structure.totalFiles} files across multiple directories.`,
      technicalSkills: structure.languageDistribution.map(l => l.language),
      architecturePatterns: ['Modular Architecture', 'Best Practices'],
      innovationScore: Math.min(5 + Math.floor(structure.totalFiles / 20), 10),
      keyFeatures: ['Well-structured codebase', 'Multiple technologies', 'Comprehensive file organization'],
      skillLevel: structure.totalFiles > 100 ? 'Advanced' : structure.totalFiles > 50 ? 'Intermediate' : 'Beginner',
      industryRelevance: 'High',
      resumeDescription: `Developed ${repoData.name} using ${repoData.language}, demonstrating proficiency in modern software development with ${structure.totalFiles} files and comprehensive project structure.`
    };
  }
};

// Generate professional summary and skills
const generateProfessionalSummary = async (allAnalyses, username) => {
  try {
    const prompt = `
      Based on the following project analyses for developer ${username}, create a detailed professional summary and skill profile.

      Projects Analyzed:
      ${allAnalyses.map(analysis => `
      - ${analysis.name}: ${analysis.insights.projectSummary}
      - Skills: ${Array.isArray(analysis.insights.technicalSkills) ? analysis.insights.technicalSkills.join(', ') : (analysis.insights.technicalSkills || 'N/A')}
      - Level: ${analysis.insights.skillLevel}
      - Innovation: ${analysis.insights.innovationScore}/10
      - Total Files: ${analysis.structure.totalFiles}
      - Languages: ${analysis.structure.languageDistribution.map(l => l.language).join(', ')}
      `).join('\n')}

      Please return the following in strict JSON format. Ensure proper data types:

      {
        "professionalSummary": "string (3-4 sentences)",
        "coreSkills": {
          "Programming Languages": ["array of strings"],
          "Frameworks/Libraries": ["array of strings"],
          "Tools/Platforms": ["array of strings"]
        },
        "specializations": ["array of strings"],
        "experienceLevel": "string (e.g., Beginner, Intermediate, Advanced)",
        "industryStrengths": ["array of strings (e.g., Web Development, SaaS, EdTech)"],
        "valueProposition": "string (1-2 sentences summarizing developer's unique value)"
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600
    });

    let content = response.choices[0].message.content.trim();

    // Remove markdown code block wrapper if present
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Attempt to parse JSON
    return JSON.parse(content);
  } catch (error) {
    console.error('Summary Generation Error:', error);

    // Safe fallback
    return {
      professionalSummary: `Skilled software developer with expertise in multiple programming languages and modern development practices.`,
      coreSkills: {
        "Programming Languages": ["JavaScript", "Python"],
        "Frameworks/Libraries": ["React", "Express"],
        "Tools/Platforms": ["Git", "Docker"]
      },
      specializations: ["Full-Stack Development"],
      experienceLevel: "Intermediate",
      industryStrengths: ["Web Development"],
      valueProposition: "Delivers high-quality, scalable software solutions with modern best practices."
    };
  }
};

// Main analysis endpoint
app.post('/api/analyze-resume', async (req, res) => {
  const { repositories, linkedinUrl, username } = req.body;
  const socketId = req.headers['socket-id'];

  try {
    console.log('Socket ID:', socketId);

    if (!repositories || repositories.length === 0) {
      throw new Error('At least one repository is required');
    }

    if (repositories.length > 3) {
      throw new Error('Maximum 3 repositories allowed');
    }

    const emitProgress = (step, progress, message) => {
      if (socketId) {
        io.to(socketId).emit('analysisProgress', { step, progress, message });
      }
    };

    emitProgress('fetching', 10, 'Fetching repository information...');

    // Fetch repository data
    const repoAnalyses = [];
    for (let i = 0; i < repositories.length; i++) {
      const repoUrl = repositories[i];
      emitProgress('fetching', 10 + (i * 30 / repositories.length), `Deep analyzing ${repoUrl}...`);

      const repoData = await fetchGitHubRepo(repoUrl);
      const structure = await analyzeRepoStructure(repoData.owner, repoData.repo);
      const insights = await generateProjectInsights(repoData, structure);

      repoAnalyses.push({
        url: repoUrl,
        name: repoData.name,
        description: repoData.description,
        language: repoData.language,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        structure,
        insights
      });
    }

    emitProgress('generating', 70, 'Generating professional summary...');

    // Generate professional summary and skills
    const professionalProfile = await generateProfessionalSummary(repoAnalyses, username);

    emitProgress('generating', 85, 'Creating resume data...');

    // Compile comprehensive resume data
    const resumeData = {
      personalInfo: {
        name: username,
        githubUsername: username,
        linkedinUrl: linkedinUrl || null,
        professionalSummary: professionalProfile.professionalSummary,
        valueProposition: professionalProfile.valueProposition
      },
      skills: {
        core: professionalProfile.coreSkills,
        specializations: professionalProfile.specializations,
        experienceLevel: professionalProfile.experienceLevel
      },
      projects: repoAnalyses.map(repo => ({
        name: repo.name,
        description: repo.insights.resumeDescription,
        technologies: Array.isArray(repo.insights.technicalSkills) ? repo.insights.technicalSkills : [repo.insights.technicalSkills].filter(Boolean),
        githubUrl: repo.url,
        keyFeatures: Array.isArray(repo.insights.keyFeatures) ? repo.insights.keyFeatures : [repo.insights.keyFeatures].filter(Boolean),
        innovationScore: repo.insights.innovationScore,
        totalFiles: repo.structure.totalFiles,
        languageDistribution: repo.structure.languageDistribution
      })),
      technicalProfile: {
        totalProjects: repoAnalyses.length,
        languages: [...new Set(repoAnalyses.map(r => r.language).filter(Boolean))],
        avgInnovationScore: repoAnalyses.reduce((sum, r) => sum + r.insights.innovationScore, 0) / repoAnalyses.length,
        industryStrengths: professionalProfile.industryStrengths,
        totalFilesAnalyzed: repoAnalyses.reduce((sum, r) => sum + r.structure.totalFiles, 0),
        allLanguages: [...new Set(repoAnalyses.flatMap(r => r.structure.languageDistribution.map(l => l.language)))]
      }
    };

    // Save to database
    const resume = new Resume({
      username,
      linkedinUrl,
      repositories,
      skillAnalysis: repoAnalyses,
      resumeData,
      overallScore: resumeData.technicalProfile.avgInnovationScore
    });

    await resume.save();

    emitProgress('complete', 100, 'Resume generated successfully!');

    const responseData = {
      success: true,
      data: {
        resumeData,
        analysisId: resume._id
      }
    };

    console.log('=== SENDING RESPONSE ===');
    console.log('Response data keys:', Object.keys(responseData.data));
    console.log('Analysis ID:', responseData.data.analysisId);
    console.log('Total files analyzed:', resumeData.technicalProfile.totalFilesAnalyzed);

    if (socketId) {
      io.to(socketId).emit('analysisComplete', responseData);
    }

    res.json(responseData);

  } catch (error) {
    console.error('=== ANALYSIS ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Request data:', { repositories, username, linkedinUrl });

    if (socketId) {
      io.to(socketId).emit('analysisError', { error: error.message });
    }
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get resume data
app.get('/api/resume/:id', async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }
    res.json({ success: true, data: resume });
  } catch (error) {
    res.status(404).json({ success: false, error: 'Resume not found' });
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});