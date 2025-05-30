// backend/src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from "openai";

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // Adjust for your frontend port
  credentials: true
}));
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Simplified file fetcher
async function fetchRepoFiles(repoUrl) {
    const [owner, repo] = repoUrl.split("github.com/")[1].split("/");
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;
    
    const headers = {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
    };

    const treeRes = await fetch(apiUrl, { headers });
    if (!treeRes.ok) throw new Error(`Failed to fetch repo: ${treeRes.status}`);

    const data = await treeRes.json();
    
    const codeFiles = data.tree.filter(file => 
        file.type === "blob" && 
        /\.(js|jsx|ts|tsx|json)$/.test(file.path) && 
        !/(node_modules|dist|build|\.git|public|assets)/.test(file.path)
    ).slice(0, 15);

    const files = {};
    for (const file of codeFiles) {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${file.path}`;
        try {
            const rawRes = await fetch(rawUrl, { headers });
            if (rawRes.ok) {
                const content = await rawRes.text();
                if (content.length < 8000) {
                    files[file.path] = content;
                }
            }
        } catch (err) {
            console.warn(`Failed to fetch: ${file.path}`);
        }
    }

    return files;
}

function analyzeProject(files) {
    const stats = {
        totalFiles: Object.keys(files).length,
        components: 0,
        apiEndpoints: 0,
        functions: 0,
        technologies: new Set(),
        hasTests: false,
        hasTypeScript: false,
        totalLines: 0
    };

    for (const [path, content] of Object.entries(files)) {
        if (!content) continue;

        stats.totalLines += content.split('\n').length;

        if (content.includes('react') || content.includes('React')) stats.technologies.add('React');
        if (content.includes('express') || content.includes('Express')) stats.technologies.add('Express');
        if (content.includes('mongoose') || content.includes('MongoDB')) stats.technologies.add('MongoDB');
        if (content.includes('axios')) stats.technologies.add('Axios');
        if (content.includes('cors')) stats.technologies.add('CORS');
        if (content.includes('jwt') || content.includes('jsonwebtoken')) stats.technologies.add('JWT');
        if (content.includes('bcrypt')) stats.technologies.add('Bcrypt');
        if (content.includes('prisma')) stats.technologies.add('Prisma');
        if (content.includes('next')) stats.technologies.add('Next.js');
        if (content.includes('vue') || content.includes('Vue')) stats.technologies.add('Vue.js');
        if (content.includes('tailwind')) stats.technologies.add('Tailwind');

        if (path.includes('test') || path.includes('spec')) stats.hasTests = true;
        if (path.endsWith('.ts') || path.endsWith('.tsx')) stats.hasTypeScript = true;

        const componentMatches = content.match(/(?:function|const|class)\s+[A-Z]\w*|export\s+(?:default\s+)?(?:function\s+)?[A-Z]\w*/g);
        if (componentMatches && content.includes('<')) {
            stats.components += componentMatches.length;
        }

        const apiMatches = content.match(/\.(get|post|put|delete|patch)\s*\(/g);
        if (apiMatches) stats.apiEndpoints += apiMatches.length;

        const functionMatches = content.match(/(?:function|const\s+\w+\s*=|\w+\s*:\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))/g);
        if (functionMatches) stats.functions += functionMatches.length;
    }

    return stats;
}

function calculateScore(stats) {
    let score = 1;

    if (stats.totalFiles > 15) score += 2;
    else if (stats.totalFiles > 8) score += 1;
    else if (stats.totalFiles < 3) return Math.min(score + 1, 10);

    if (stats.components > 8) score += 2;
    else if (stats.components > 4) score += 1.5;
    else if (stats.components > 1) score += 1;

    if (stats.apiEndpoints > 6) score += 2;
    else if (stats.apiEndpoints > 3) score += 1.5;
    else if (stats.apiEndpoints > 0) score += 1;

    const techCount = stats.technologies.size;
    if (techCount > 6) score += 2;
    else if (techCount > 3) score += 1.5;
    else if (techCount > 1) score += 1;

    if (stats.hasTests) score += 1;
    if (stats.hasTypeScript) score += 1;

    if (stats.totalLines > 2000) score += 1;
    else if (stats.totalLines > 1000) score += 0.5;

    const hasBackend = stats.technologies.has('Express') || stats.apiEndpoints > 0;
    const hasFrontend = stats.technologies.has('React') || stats.technologies.has('Vue.js') || stats.components > 0;
    if (hasBackend && hasFrontend) score += 1.5;

    return Math.min(Math.round(score * 10) / 10, 10);
}

function createPrompt(stats, score) {
    const techList = Array.from(stats.technologies).join(', ') || 'Basic JavaScript';
    
    return `Analyze this GitHub repository and return a JSON response with the following structure:

{
  "score": ${score},
  "rationale": ["reason1", "reason2"],
  "technologies": [${JSON.stringify(Array.from(stats.technologies))}],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvements": ["improvement1", "improvement2"],
  "hiringPotential": {
    "level": "Junior/Mid/Senior/Not Recommended",
    "details": "explanation",
    "watchAreas": ["area1", "area2"]
  },
  "conclusion": "summary"
}

Repository metrics:
- ${stats.totalFiles} files, ${stats.totalLines} lines
- ${stats.components} components, ${stats.apiEndpoints} API endpoints
- Technologies: ${techList}
- Tests: ${stats.hasTests ? 'Yes' : 'No'}, TypeScript: ${stats.hasTypeScript ? 'Yes' : 'No'}

Be realistic - most projects score 4-6/10. Return only valid JSON.`;
}

// Main analysis endpoint with progress updates
app.post("/api/analyze", async (req, res) => {
    console.log('Received analysis request:', req.body); // Debug log
    
    try {
        const { repositories } = req.body;
        if (!repositories || repositories.length === 0) {
            return res.status(400).json({ success: false, error: "No repositories provided" });
        }

        // Set up Server-Sent Events headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control, Content-Type',
            'Access-Control-Allow-Methods': 'POST'
        });

        const sendProgress = (stage, data = {}) => {
            const message = JSON.stringify({ stage, ...data });
            console.log('Sending progress:', message); // Debug log
            res.write(`data: ${message}\n\n`);
        };

        // Process all valid repositories
        const validRepos = repositories.filter(repo => repo && repo.trim());
        let allFiles = {};
        
        for (let i = 0; i < validRepos.length; i++) {
            const repo = validRepos[i];
            sendProgress('fetching', { repo, index: i + 1, total: validRepos.length });
            
            try {
                const files = await fetchRepoFiles(repo);
                allFiles = { ...allFiles, ...files };
                sendProgress('fetched', { repo, fileCount: Object.keys(files).length });
            } catch (err) {
                console.error(`Error fetching ${repo}:`, err);
                sendProgress('error', { repo, error: err.message });
                continue; // Continue with other repos
            }
        }
        
        if (Object.keys(allFiles).length === 0) {
            sendProgress('complete', { success: false, error: "No analyzable files found" });
            return res.end();
        }

        sendProgress('analyzing');
        const stats = analyzeProject(allFiles);
        const score = calculateScore(stats);
        
        sendProgress('ai-processing');
        
        let aiFeedback;
        
        // Try AI analysis if OpenAI is configured
        if (process.env.OPENAI_API_KEY) {
            try {
                const prompt = createPrompt(stats, score);
                const chat = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "system",
                            content: "You are a senior software engineer. Return only valid JSON matching the requested structure."
                        },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.2,
                    max_tokens: 1000
                });

                aiFeedback = JSON.parse(chat.choices[0].message.content);
            } catch (aiErr) {
                console.error('AI analysis failed:', aiErr);
                // Fall back to basic analysis
                aiFeedback = createFallbackAnalysis(stats, score);
            }
        } else {
            // Use fallback if no OpenAI key
            aiFeedback = createFallbackAnalysis(stats, score);
        }

        sendProgress('complete', {
            success: true,
            aiFeedback,
            metrics: {
                files: stats.totalFiles,
                components: stats.components,
                apis: stats.apiEndpoints,
                technologies: Array.from(stats.technologies),
                score: score
            }
        });

        res.end();

    } catch (err) {
        console.error("Analysis error:", err);
        try {
            res.write(`data: ${JSON.stringify({ stage: 'error', error: err.message })}\n\n`);
            res.end();
        } catch (writeErr) {
            console.error("Failed to send error response:", writeErr);
        }
    }
});

// Fallback analysis function
function createFallbackAnalysis(stats, score) {
    return {
        score: score,
        rationale: [
            `Analyzed ${stats.totalFiles} files with ${stats.totalLines} lines of code`,
            `Found ${stats.components} components and ${stats.apiEndpoints} API endpoints`,
            `Uses ${stats.technologies.size} different technologies`
        ],
        technologies: Array.from(stats.technologies),
        strengths: [
            stats.hasTypeScript ? "Uses TypeScript for better code quality" : "Functional JavaScript implementation",
            stats.components > 5 ? "Good component organization" : "Basic project structure",
            stats.technologies.size > 3 ? "Diverse technology stack" : "Focused technology approach"
        ],
        weaknesses: [
            !stats.hasTests ? "No test files detected" : "Limited test coverage",
            stats.totalFiles < 10 ? "Small project scope" : "Could improve documentation",
            "Consider adding more error handling"
        ],
        improvements: [
            "Add comprehensive test coverage",
            "Improve code documentation",
            "Consider adding TypeScript if not already used",
            "Implement better error handling patterns"
        ],
        hiringPotential: {
            level: score >= 7 ? "Senior" : score >= 5 ? "Mid" : score >= 3 ? "Junior" : "Entry Level",
            details: `Based on the analysis of ${stats.totalFiles} files and ${Array.from(stats.technologies).join(', ')} technologies, this profile shows ${score >= 6 ? 'strong' : score >= 4 ? 'decent' : 'basic'} development skills.`,
            watchAreas: [
                !stats.hasTests ? "Testing practices" : "Test coverage expansion",
                stats.totalFiles < 10 ? "Project complexity" : "Code organization",
                "Documentation and code comments"
            ]
        },
        conclusion: `${score}/10 - ${score >= 7 ? 'Excellent' : score >= 5 ? 'Good' : score >= 3 ? 'Decent' : 'Basic'} developer profile with room for growth in testing and documentation.`
    };
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));