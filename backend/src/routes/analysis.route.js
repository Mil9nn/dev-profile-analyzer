import express from 'express';
import dotenv from 'dotenv';
import fetchRepoFiles from '../utils/fetchRepoFiles.js';
import prepareProjectSummary from "../utils/prepareProjectSummary.js";
import { OpenAI } from "openai";
import { parseProjectSummary } from '../utils/parseProjectSummary.js';

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Enhanced scoring criteria
const SCORING_CRITERIA = {
  architecture: {
    weight: 25,
    levels: {
      1: "Single file, no structure, spaghetti code",
      3: "Basic separation, minimal organization",
      5: "Good folder structure, some separation of concerns",
      7: "Clean architecture, proper layering, design patterns",
      9: "Excellent architecture, SOLID principles, advanced patterns"
    }
  },
  complexity: {
    weight: 20,
    levels: {
      1: "Hello world, basic CRUD",
      3: "Simple features, basic functionality",
      5: "Multiple features, some complexity",
      7: "Advanced features, complex business logic",
      9: "Highly sophisticated, complex systems integration"
    }
  },
  technologies: {
    weight: 20,
    levels: {
      1: "Basic HTML/CSS/JS",
      3: "One framework, basic setup",
      5: "Multiple technologies, proper integration",
      7: "Modern stack, advanced tooling, best practices",
      9: "Cutting-edge tech, microservices, sophisticated toolchain"
    }
  },
  codeQuality: {
    weight: 20,
    levels: {
      1: "Poor naming, no comments, inconsistent style",
      3: "Basic quality, some organization",
      5: "Good practices, readable code, some documentation",
      7: "High quality, well documented, consistent patterns",
      9: "Exceptional quality, comprehensive docs, exemplary practices"
    }
  },
  innovation: {
    weight: 15,
    levels: {
      1: "Copy-paste tutorial code",
      3: "Basic implementation with minor modifications",
      5: "Some original thinking, decent problem solving",
      7: "Creative solutions, good problem solving",
      9: "Highly innovative, novel approaches, exceptional creativity"
    }
  }
};

router.post("/", async (req, res) => {
  try {
    const { repositories } = req.body;

    if (!repositories || repositories.length === 0) {
      return res.status(400).json({ message: "No repositories provided" });
    }

    let allFiles = {};
    let repoStats = [];

    for (const repoUrl of repositories.filter(Boolean)) {
      const files = await fetchRepoFiles(repoUrl);
      allFiles = { ...allFiles, ...files };
      
      // Calculate basic repository statistics
      const stats = calculateRepoStats(files);
      repoStats.push({ url: repoUrl, ...stats });
    }

    const summary = prepareProjectSummary(allFiles);
    
    // Enhanced prompt with strict scoring guidelines
    const prompt = `
You are a STRICT senior software engineer evaluating GitHub repositories for hiring decisions. 

CRITICAL SCORING GUIDELINES:
- Score 1-2: Beginner/tutorial level projects, basic HTML/CSS, simple scripts
- Score 3-4: Basic projects with minimal functionality, copy-paste code
- Score 5-6: Decent projects with some complexity and good practices
- Score 7-8: Advanced projects with sophisticated architecture and innovation
- Score 9-10: Exceptional, production-ready, highly innovative solutions

REPOSITORY STATISTICS:
${repoStats.map(stat => `
Repository: ${stat.url}
- Total files: ${stat.totalFiles}
- Lines of code: ${stat.totalLines}
- Languages: ${stat.languages.join(', ')}
- File types: ${stat.fileTypes.join(', ')}
`).join('\n')}

SCORING CRITERIA (be harsh and precise):

1. **Architecture & Design (25%)**: ${SCORING_CRITERIA.architecture.levels[1]} = 1-2, ${SCORING_CRITERIA.architecture.levels[5]} = 5-6, ${SCORING_CRITERIA.architecture.levels[9]} = 9-10

2. **Technical Complexity (20%)**: ${SCORING_CRITERIA.complexity.levels[1]} = 1-2, ${SCORING_CRITERIA.complexity.levels[5]} = 5-6, ${SCORING_CRITERIA.complexity.levels[9]} = 9-10

3. **Technology Stack (20%)**: ${SCORING_CRITERIA.technologies.levels[1]} = 1-2, ${SCORING_CRITERIA.technologies.levels[5]} = 5-6, ${SCORING_CRITERIA.technologies.levels[9]} = 9-10

4. **Code Quality (20%)**: ${SCORING_CRITERIA.codeQuality.levels[1]} = 1-2, ${SCORING_CRITERIA.codeQuality.levels[5]} = 5-6, ${SCORING_CRITERIA.codeQuality.levels[9]} = 9-10

5. **Innovation & Problem Solving (15%)**: ${SCORING_CRITERIA.innovation.levels[1]} = 1-2, ${SCORING_CRITERIA.innovation.levels[5]} = 5-6, ${SCORING_CRITERIA.innovation.levels[9]} = 9-10

IMPORTANT SCORING RULES:
- If it's a basic tutorial project or simple CRUD app without innovation: MAX 4/10
- If there's no proper architecture or it's mostly boilerplate: MAX 5/10
- If it lacks advanced features or sophisticated problem-solving: MAX 6/10
- Only give 7+ for genuinely impressive, well-architected, complex solutions
- Reserve 8+ for production-quality code with excellent practices
- Reserve 9+ for truly exceptional, innovative solutions

PROVIDE YOUR ANALYSIS IN THIS EXACT FORMAT:

## Overall Score: **X/10**

### Detailed Breakdown:
- Architecture & Design: X/10 (Reason)
- Technical Complexity: X/10 (Reason)  
- Technology Stack: X/10 (Reason)
- Code Quality: X/10 (Reason)
- Innovation: X/10 (Reason)

## Technologies Detected:
- Technology 1
- Technology 2
- Technology 3

## Strengths:
- Strength 1
- Strength 2

## Weaknesses:
- Weakness 1  
- Weakness 2

## Improvements:
- Improvement 1
- Improvement 2

## Hiring Potential: **[Level]**
Details about hiring recommendation and specific areas to focus on during interview.

## Conclusion:
Final assessment summary.

Combined Project Code:
${summary}
`;

    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a senior software engineer with 15+ years of experience evaluating code for hiring decisions. You are EXTREMELY STRICT and have high standards. Most projects you see are mediocre and should score 3-5/10. Only truly exceptional work deserves 7+/10. Be harsh but fair.`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3, // Lower temperature for more consistent scoring
      max_tokens: 2000,
    });

    const aiResponse = chat.choices[0].message.content;

    // Parse the AI text response to structured JSON
    const parsedSummary = parseProjectSummary(aiResponse);
    
    // Apply score validation and adjustment if needed
    const adjustedSummary = validateAndAdjustScore(parsedSummary, repoStats);

    res.status(201).json({ success: true, aiFeedback: adjustedSummary });

  } catch (err) {
    console.error("AI Scoring error:", err);
    res.status(500).json({ success: false, error: "Failed to analyze repositories." });
  }
});

// Calculate repository statistics for better context
function calculateRepoStats(files) {
  const fileEntries = Object.entries(files);
  const stats = {
    totalFiles: fileEntries.length,
    totalLines: 0,
    languages: new Set(),
    fileTypes: new Set(),
    hasTests: false,
    hasDocumentation: false,
    hasConfigFiles: false,
    complexity: 0
  };

  for (const [filepath, content] of fileEntries) {
    if (!content) continue;

    const lines = content.split('\n').length;
    stats.totalLines += lines;
    
    const ext = filepath.split('.').pop()?.toLowerCase();
    if (ext) {
      stats.fileTypes.add(ext);
      
      // Detect languages
      const langMap = {
        'js': 'JavaScript', 'jsx': 'React', 'ts': 'TypeScript', 'tsx': 'TypeScript React',
        'py': 'Python', 'java': 'Java', 'cpp': 'C++', 'c': 'C', 'cs': 'C#',
        'php': 'PHP', 'rb': 'Ruby', 'go': 'Go', 'rs': 'Rust', 'swift': 'Swift'
      };
      
      if (langMap[ext]) {
        stats.languages.add(langMap[ext]);
      }
    }

    // Check for tests
    if (filepath.includes('test') || filepath.includes('spec') || content.includes('describe(') || content.includes('it(')) {
      stats.hasTests = true;
    }

    // Check for documentation
    if (filepath.includes('README') || filepath.includes('doc')) {
      stats.hasDocumentation = true;
    }

    // Check for config files
    if (['json', 'yml', 'yaml', 'toml', 'config'].includes(ext)) {
      stats.hasConfigFiles = true;
    }

    // Basic complexity indicators
    if (content.includes('class ') || content.includes('interface ') || content.includes('async ')) {
      stats.complexity += 1;
    }
  }

  stats.languages = Array.from(stats.languages);
  stats.fileTypes = Array.from(stats.fileTypes);
  
  return stats;
}

// Validate and adjust scores based on objective criteria
function validateAndAdjustScore(parsedSummary, repoStats) {
  let objectiveScore = 1;
  const adjustments = [];

  // Calculate objective metrics
  const totalStats = repoStats.reduce((acc, stat) => ({
    totalFiles: acc.totalFiles + stat.totalFiles,
    totalLines: acc.totalLines + stat.totalLines,
    languages: [...new Set([...acc.languages, ...stat.languages])],
    hasTests: acc.hasTests || stat.hasTests,
    hasDocumentation: acc.hasDocumentation || stat.hasDocumentation,
    complexity: acc.complexity + stat.complexity
  }), { totalFiles: 0, totalLines: 0, languages: [], hasTests: false, hasDocumentation: false, complexity: 0 });

  // Objective scoring adjustments
  if (totalStats.totalLines < 100) {
    objectiveScore = Math.min(objectiveScore + 1, 3); // Very small projects max 3
    adjustments.push("Small codebase limits complexity");
  } else if (totalStats.totalLines > 1000) {
    objectiveScore += 2;
    adjustments.push("Substantial codebase indicates complexity");
  }

  if (totalStats.languages.length > 2) {
    objectiveScore += 1;
    adjustments.push("Multiple languages show versatility");
  }

  if (totalStats.hasTests) {
    objectiveScore += 1;
    adjustments.push("Testing shows good practices");
  }

  if (totalStats.complexity > 5) {
    objectiveScore += 1;
    adjustments.push("Code complexity indicators present");
  }

  // If AI score is significantly higher than objective indicators, adjust down
  if (parsedSummary.score && parsedSummary.score > objectiveScore + 2) {
    const originalScore = parsedSummary.score;
    parsedSummary.score = Math.max(objectiveScore, parsedSummary.score - 1);
    adjustments.push(`Score adjusted from ${originalScore} based on objective metrics`);
  }

  // Add adjustment rationale
  if (adjustments.length > 0) {
    parsedSummary.rationale = [...(parsedSummary.rationale || []), ...adjustments];
  }

  return parsedSummary;
}

export default router;