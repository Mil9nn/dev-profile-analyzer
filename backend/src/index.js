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

// MongoDB Schema
const AnalysisSchema = new mongoose.Schema({
  username: String,
  repositories: Array,
  skillAnalysis: Object,
  overallScore: Number,
  createdAt: { type: Date, default: Date.now }
});

const Analysis = mongoose.model('Analysis', AnalysisSchema);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/devskill');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// GitHub API helper
const fetchGitHubRepos = async (username) => {
  try {
    const response = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
    return response.data;
  } catch (error) {
    throw new Error('GitHub user not found');
  }
};

// Fetch repository contents
const fetchRepoContents = async (username, repoName) => {
  try {
    const response = await axios.get(`https://api.github.com/repos/${username}/${repoName}/contents`);
    return response.data;
  } catch (error) {
    return [];
  }
};

// Analyze code with OpenAI
const analyzeCodeWithAI = async (codeContent, language) => {
  try {
    const prompt = `
    Analyze this ${language} code and provide:
    1. Code quality score (1-10)
    2. Architecture patterns used
    3. Best practices followed
    4. Areas for improvement
    5. Skill level estimate (Beginner/Intermediate/Advanced/Expert)
    
    Code:
    ${codeContent.substring(0, 2000)}
    
    Respond in JSON format.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    return {
      codeQuality: 5,
      patterns: ["Basic"],
      skillLevel: "Intermediate",
      improvements: ["Add more comments"]
    };
  }
};

// Main analysis endpoint
app.post('/api/analyze', async (req, res) => {
  const { username } = req.body;
  const socketId = req.headers['socket-id'];

  try {
    // Emit progress updates
    const emitProgress = (step, progress, message) => {
      if (socketId) {
        io.to(socketId).emit('analysisProgress', { step, progress, message });
      }
    };

    emitProgress('fetching', 10, 'Fetching GitHub repositories...');
    const repos = await fetchGitHubRepos(username);

    emitProgress('analyzing', 30, 'Analyzing repository structures...');
    
    const analysisResults = [];
    let totalScore = 0;

    for (let i = 0; i < Math.min(repos.length, 5); i++) {
      const repo = repos[i];
      emitProgress('analyzing', 30 + (i * 40 / 5), `Analyzing ${repo.name}...`);

      const contents = await fetchRepoContents(username, repo.name);
      const codeFiles = contents.filter(file => 
        file.name.endsWith('.js') || 
        file.name.endsWith('.py') || 
        file.name.endsWith('.java') ||
        file.name.endsWith('.tsx') ||
        file.name.endsWith('.ts')
      );

      if (codeFiles.length > 0) {
        // Analyze first code file
        try {
          const fileResponse = await axios.get(codeFiles[0].download_url);
          const analysis = await analyzeCodeWithAI(fileResponse.data, repo.language);
          
          analysisResults.push({
            repository: repo.name,
            language: repo.language,
            stars: repo.stargazers_count,
            analysis
          });

          totalScore += analysis.codeQuality || 5;
        } catch (error) {
          console.log('Error analyzing file:', error.message);
        }
      }
    }

    emitProgress('generating', 80, 'Generating skill report...');

    // Calculate overall metrics
    const skillAnalysis = {
      languages: [...new Set(repos.map(r => r.language).filter(Boolean))],
      totalRepos: repos.length,
      totalStars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      averageScore: totalScore / analysisResults.length || 5,
      repositories: analysisResults
    };

    // Save to database
    const analysis = new Analysis({
      username,
      repositories: repos.slice(0, 10),
      skillAnalysis,
      overallScore: skillAnalysis.averageScore
    });

    await analysis.save();

    emitProgress('complete', 100, 'Analysis complete!');

    const responseData = {
      success: true,
      data: {
        username,
        skillAnalysis,
        analysisId: analysis._id
      }
    };

    // FIXED: Emit analysisComplete event that frontend is waiting for
    if (socketId) {
      io.to(socketId).emit('analysisComplete', responseData);
    }

    res.json(responseData);

  } catch (error) {
    if (socketId) {
      io.to(socketId).emit('analysisError', { error: error.message });
    }
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get previous analysis
app.get('/api/analysis/:id', async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(404).json({ success: false, error: 'Analysis not found' });
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