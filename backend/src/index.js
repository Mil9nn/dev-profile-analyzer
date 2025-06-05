import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import OpenAI from 'openai';
import axios from 'axios';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Enhanced MongoDB Schema
const ResumeSchema = new mongoose.Schema({
  username: String,
  linkedinUrl: String,
  repositories: Array,
  skillAnalysis: Object,
  resumeData: Object,
  overallScore: Number,
  createdAt: { type: Date, default: Date.now }
});

const Resume = mongoose.model('Resume', ResumeSchema);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/devresume');

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

// Fetch repository contents and analyze structure
const analyzeRepoStructure = async (owner, repo) => {
  try {
    const contentsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents`);
    const readmeResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/readme`).catch(() => null);
    
    const files = contentsResponse.data;
    const codeFiles = files.filter(file => 
      file.name.match(/\.(js|ts|tsx|jsx|py|java|cpp|c|go|rs|php|rb|swift|kt|scala|css|html|vue|svelte)$/i)
    );
    
    let readmeContent = '';
    if (readmeResponse) {
      readmeContent = Buffer.from(readmeResponse.data.content, 'base64').toString('utf-8');
    }
    
    return {
      files: files.map(f => ({ name: f.name, type: f.type })),
      codeFiles: codeFiles.map(f => ({ name: f.name, language: getLanguageFromFile(f.name) })),
      readmeContent: readmeContent.substring(0, 2000),
      hasDocumentation: files.some(f => f.name.toLowerCase().includes('readme')),
      hasTests: files.some(f => f.name.toLowerCase().includes('test') || f.name.toLowerCase().includes('spec')),
      packageFiles: files.filter(f => ['package.json', 'requirements.txt', 'pom.xml', 'Cargo.toml', 'go.mod'].includes(f.name))
    };
  } catch (error) {
    return { files: [], codeFiles: [], readmeContent: '', hasDocumentation: false, hasTests: false, packageFiles: [] };
  }
};

// Get programming language from file extension
const getLanguageFromFile = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const langMap = {
    'js': 'JavaScript', 'ts': 'TypeScript', 'tsx': 'TypeScript React', 'jsx': 'React',
    'py': 'Python', 'java': 'Java', 'cpp': 'C++', 'c': 'C', 'go': 'Go',
    'rs': 'Rust', 'php': 'PHP', 'rb': 'Ruby', 'swift': 'Swift', 'kt': 'Kotlin',
    'scala': 'Scala', 'css': 'CSS', 'html': 'HTML', 'vue': 'Vue.js', 'svelte': 'Svelte'
  };
  return langMap[ext] || ext.toUpperCase();
};

// Enhanced AI analysis for project insights
const generateProjectInsights = async (repoData, structure) => {
  try {
    const prompt = `
    Analyze this GitHub repository and provide detailed insights:
    
    Repository: ${repoData.name}
    Description: ${repoData.description || 'No description provided'}
    Language: ${repoData.language}
    Stars: ${repoData.stargazers_count}
    Forks: ${repoData.forks_count}
    
    Code Structure:
    - Files: ${structure.codeFiles.map(f => f.name).join(', ')}
    - Languages: ${structure.codeFiles.map(f => f.language).join(', ')}
    - Has Tests: ${structure.hasTests}
    - Has Documentation: ${structure.hasDocumentation}
    
    README Content (first 500 chars):
    ${structure.readmeContent.substring(0, 500)}
    
    Generate a comprehensive analysis including:
    1. Project summary (2-3 sentences for resume)
    2. Technical skills demonstrated
    3. Architecture patterns and best practices
    4. Innovation and complexity level (1-10)
    5. Key achievements and features
    6. Skill level assessment (Beginner/Intermediate/Advanced/Expert)
    7. Industry relevance and market value
    
    Respond in JSON format with these exact keys: projectSummary, technicalSkills, architecturePatterns, innovationScore, keyFeatures, skillLevel, industryRelevance, resumeDescription
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return {
      projectSummary: `${repoData.name}: A ${repoData.language} project showcasing modern development practices.`,
      technicalSkills: [repoData.language],
      architecturePatterns: ['Standard Architecture'],
      innovationScore: 5,
      keyFeatures: ['Well-structured codebase'],
      skillLevel: 'Intermediate',
      industryRelevance: 'High',
      resumeDescription: `Developed ${repoData.name} using ${repoData.language}, demonstrating proficiency in modern software development.`
    };
  }
};

// Generate professional summary and skills
const generateProfessionalSummary = async (allAnalyses, username) => {
  try {
    const prompt = `
    Based on the following project analyses for developer ${username}, create a professional summary and skills assessment:
    
    Projects Analyzed:
    ${allAnalyses.map(analysis => `
    - ${analysis.name}: ${analysis.insights.projectSummary}
    - Skills: ${analysis.insights.technicalSkills.join(', ')}
    - Level: ${analysis.insights.skillLevel}
    - Innovation: ${analysis.insights.innovationScore}/10
    `).join('\n')}
    
    Generate:
    1. Professional summary (3-4 sentences for resume header)
    2. Core technical skills (categorized)
    3. Specialization areas
    4. Experience level assessment
    5. Industry strengths
    6. Unique value proposition
    
    Respond in JSON format with keys: professionalSummary, coreSkills, specializations, experienceLevel, industryStrengths, valueProposition
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Summary Generation Error:', error);
    return {
      professionalSummary: `Skilled software developer with expertise in multiple programming languages and modern development practices.`,
      coreSkills: {
        'Programming Languages': ['JavaScript', 'Python'],
        'Technologies': ['React', 'Node.js'],
        'Tools': ['Git', 'Docker']
      },
      specializations: ['Full-Stack Development'],
      experienceLevel: 'Intermediate',
      industryStrengths: ['Web Development'],
      valueProposition: 'Delivers high-quality, scalable software solutions with modern best practices.'
    };
  }
};

// Main analysis endpoint
app.post('/api/analyze-resume', async (req, res) => {
  const { repositories, linkedinUrl, username } = req.body;
  const socketId = req.headers['socket-id'];

  try {
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
      emitProgress('fetching', 10 + (i * 30 / repositories.length), `Analyzing ${repoUrl}...`);
      
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
        technologies: repo.insights.technicalSkills,
        githubUrl: repo.url,
        keyFeatures: repo.insights.keyFeatures,
        innovationScore: repo.insights.innovationScore
      })),
      technicalProfile: {
        totalProjects: repoAnalyses.length,
        languages: [...new Set(repoAnalyses.map(r => r.language).filter(Boolean))],
        avgInnovationScore: repoAnalyses.reduce((sum, r) => sum + r.insights.innovationScore, 0) / repoAnalyses.length,
        industryStrengths: professionalProfile.industryStrengths
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

    if (socketId) {
      io.to(socketId).emit('analysisComplete', responseData);
    }

    res.json(responseData);

  } catch (error) {
    console.error('Analysis Error:', error);
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