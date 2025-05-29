import express from 'express';
import dotenv from 'dotenv';
import fetchRepoFiles from '../utils/fetchRepoFiles.js';
import ASTAnalyzer from '../utils/astAnalyzer.js';
import { OpenAI } from "openai";
import { parseProjectSummary } from '../utils/parseProjectSummary.js';

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { repositories } = req.body;

    if (!repositories || repositories.length === 0) {
      return res.status(400).json({ message: "No repositories provided" });
    }

    let allFiles = {};
    let repoStats = [];

    // Fetch repository files
    for (const repoUrl of repositories.filter(Boolean)) {
      const files = await fetchRepoFiles(repoUrl);
      allFiles = { ...allFiles, ...files };
      
      const stats = calculateBasicRepoStats(files);
      repoStats.push({ url: repoUrl, ...stats });
    }

    // Use AST Analysis instead of raw code parsing
    const astAnalyzer = new ASTAnalyzer();
    const structuredAnalysis = astAnalyzer.analyzeProject(allFiles);

    // Create concise prompt using structured data
    const prompt = createStructuredPrompt(structuredAnalysis, repoStats);

    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a senior software engineer evaluating GitHub repositories for hiring decisions. You receive structured code analysis data, not raw code. Be strict in scoring - most projects should score 3-6/10. Only exceptional work deserves 7+/10.`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const aiResponse = chat.choices[0].message.content;
    const parsedSummary = parseProjectSummary(aiResponse);
    
    // Enhanced validation using AST metrics
    const adjustedSummary = validateWithASTMetrics(parsedSummary, structuredAnalysis);

    res.status(201).json({ 
      success: true, 
      aiFeedback: adjustedSummary,
      astMetrics: structuredAnalysis // Include for debugging
    });

  } catch (err) {
    console.error("AI Scoring error:", err);
    res.status(500).json({ success: false, error: "Failed to analyze repositories." });
  }
});

function createStructuredPrompt(astAnalysis, repoStats) {
  return `
STRUCTURED CODE ANALYSIS REPORT:

## Project Overview:
- Total Files: ${astAnalysis.overview.totalFiles}
- Components: ${astAnalysis.overview.components}
- API Endpoints: ${astAnalysis.overview.apiEndpoints}  
- Functions: ${astAnalysis.overview.totalFunctions}
- Est. Lines of Code: ${astAnalysis.overview.linesOfCode}

## Technology Stack:
- Frameworks: ${astAnalysis.technologies.frameworks.join(', ') || 'None detected'}
- Libraries: ${astAnalysis.technologies.libraries.join(', ') || 'Basic'}
- Databases: ${astAnalysis.technologies.databases.join(', ') || 'None'}
- Patterns: ${astAnalysis.technologies.patterns.join(', ') || 'Basic'}

## Code Quality Metrics:
- Has Tests: ${astAnalysis.quality.hasTests}
- Has TypeScript: ${astAnalysis.quality.hasTypeScript}
- Has Linting: ${astAnalysis.quality.hasLinting}
- Test Files: ${astAnalysis.quality.testFiles}

## Complexity Analysis:
- Cyclomatic Complexity: ${astAnalysis.complexity.cyclomaticComplexity}
- Avg Function Length: ${astAnalysis.complexity.avgFunctionLength} lines
- Max Nesting Depth: ${astAnalysis.complexity.nestingDepth}
- Complexity Rating: ${astAnalysis.complexity.complexityRating}

## Architecture Assessment:
- Component-Based: ${astAnalysis.architecture.componentBased}
- Has API Layer: ${astAnalysis.architecture.hasAPI}
- Code Separation: ${astAnalysis.architecture.separation}
- Detected Patterns: ${astAnalysis.architecture.patterns.join(', ') || 'None'}

## Pre-calculated Scores (for reference):
- Architecture: ${astAnalysis.scores.architecture}/9
- Complexity: ${astAnalysis.scores.complexity}/9  
- Technology: ${astAnalysis.scores.technology}/9
- Quality: ${astAnalysis.scores.quality}/9

SCORING GUIDELINES:
- 1-2: Tutorial/basic projects, minimal functionality
- 3-4: Simple projects with basic structure
- 5-6: Decent projects with good practices
- 7-8: Advanced projects with sophisticated architecture
- 9-10: Exceptional, production-ready solutions

Based on this STRUCTURED analysis (not raw code), provide your assessment in the standard format:

## Overall Score: **X/10**

### Detailed Breakdown:
- Architecture & Design: X/10 (Reason)
- Technical Complexity: X/10 (Reason)
- Technology Stack: X/10 (Reason)  
- Code Quality: X/10 (Reason)
- Innovation: X/10 (Reason)

## Technologies Detected:
[List the main technologies]

## Strengths:
[Key strengths based on metrics]

## Weaknesses:
[Areas for improvement]

## Improvements:
[Specific recommendations]

## Hiring Potential: **[Level]**
[Assessment based on structured analysis]

## Conclusion:
[Final assessment summary]
`;
}

function calculateBasicRepoStats(files) {
  const fileEntries = Object.entries(files);
  return {
    totalFiles: fileEntries.length,
    totalLines: fileEntries.reduce((sum, [_, content]) => 
      sum + (content ? content.split('\n').length : 0), 0
    ),
    languages: [...new Set(fileEntries.map(([path]) => {
      const ext = path.split('.').pop()?.toLowerCase();
      const langMap = {
        'js': 'JavaScript', 'jsx': 'React', 'ts': 'TypeScript', 'tsx': 'TypeScript React'
      };
      return langMap[ext] || ext;
    }).filter(Boolean))],
    fileTypes: [...new Set(fileEntries.map(([path]) => 
      path.split('.').pop()?.toLowerCase()
    ).filter(Boolean))]
  };
}

function validateWithASTMetrics(parsedSummary, astAnalysis) {
  const adjustments = [];
  
  // Validate architecture score
  if (parsedSummary.score > 6 && astAnalysis.overview.components < 3 && astAnalysis.overview.apiEndpoints < 2) {
    parsedSummary.score = Math.min(parsedSummary.score, 5);
    adjustments.push("Limited components/APIs - reduced architecture score");
  }
  
  // Validate complexity score  
  if (parsedSummary.score > 7 && astAnalysis.complexity.cyclomaticComplexity < 10) {
    parsedSummary.score = Math.min(parsedSummary.score, 6);
    adjustments.push("Low complexity metrics - reduced overall score");
  }
  
  // Validate technology score
  const totalTech = astAnalysis.technologies.frameworks.length + 
                   astAnalysis.technologies.libraries.length + 
                   astAnalysis.technologies.databases.length;
  
  if (parsedSummary.score > 6 && totalTech < 3) {
    parsedSummary.score = Math.min(parsedSummary.score, 5);
    adjustments.push("Limited technology stack - basic implementation");
  }
  
  // Quality validation
  if (parsedSummary.score > 7 && !astAnalysis.quality.hasTests) {
    parsedSummary.score = Math.min(parsedSummary.score, 6);
    adjustments.push("No testing framework detected - quality concern");
  }
  
  // Small project validation
  if (astAnalysis.overview.totalFiles < 5 && parsedSummary.score > 4) {
    parsedSummary.score = Math.min(parsedSummary.score, 4);
    adjustments.push("Very small project - limited scope");
  }
  
  // Add validation rationale
  if (adjustments.length > 0) {
    parsedSummary.validationAdjustments = adjustments;
  }
  
  return parsedSummary;
}

export default router;