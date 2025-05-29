// backend/src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from "openai";

dotenv.config();

const app = express();
app.use(cors());
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
    
    // Only get essential files
    const codeFiles = data.tree.filter(file => 
        file.type === "blob" && 
        /\.(js|jsx|ts|tsx|json)$/.test(file.path) && 
        !/(node_modules|dist|build|\.git|public|assets)/.test(file.path)
    ).slice(0, 20); // Limit to 20 files max

    const files = {};
    for (const file of codeFiles) {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${file.path}`;
        try {
            const rawRes = await fetch(rawUrl, { headers });
            if (rawRes.ok) {
                const content = await rawRes.text();
                if (content.length < 10000) { // Skip very large files
                    files[file.path] = content;
                }
            }
        } catch (err) {
            console.warn(`Failed to fetch: ${file.path}`);
        }
    }

    return files;
}

// Simplified analyzer - focus on what matters
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

        // Count lines
        stats.totalLines += content.split('\n').length;

        // Detect technologies
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

        // Check file types
        if (path.includes('test') || path.includes('spec')) stats.hasTests = true;
        if (path.endsWith('.ts') || path.endsWith('.tsx')) stats.hasTypeScript = true;

        // Count React components (capitalized function/class that returns JSX)
        const componentMatches = content.match(/(?:function|const|class)\s+[A-Z]\w*|export\s+(?:default\s+)?(?:function\s+)?[A-Z]\w*/g);
        if (componentMatches && content.includes('<')) {
            stats.components += componentMatches.length;
        }

        // Count API endpoints
        const apiMatches = content.match(/\.(get|post|put|delete|patch)\s*\(/g);
        if (apiMatches) stats.apiEndpoints += apiMatches.length;

        // Count functions
        const functionMatches = content.match(/(?:function|const\s+\w+\s*=|\w+\s*:\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))/g);
        if (functionMatches) stats.functions += functionMatches.length;
    }

    return stats;
}

// Smart scoring based on actual metrics
function calculateScore(stats) {
    let score = 1;

    // File count scoring
    if (stats.totalFiles > 15) score += 2;
    else if (stats.totalFiles > 8) score += 1;
    else if (stats.totalFiles < 3) return Math.min(score + 1, 10); // Very small projects max 2

    // Component scoring
    if (stats.components > 8) score += 2;
    else if (stats.components > 4) score += 1.5;
    else if (stats.components > 1) score += 1;

    // API scoring
    if (stats.apiEndpoints > 6) score += 2;
    else if (stats.apiEndpoints > 3) score += 1.5;
    else if (stats.apiEndpoints > 0) score += 1;

    // Technology diversity
    const techCount = stats.technologies.size;
    if (techCount > 6) score += 2;
    else if (techCount > 3) score += 1.5;
    else if (techCount > 1) score += 1;

    // Quality bonuses
    if (stats.hasTests) score += 1;
    if (stats.hasTypeScript) score += 1;

    // Code volume bonus
    if (stats.totalLines > 2000) score += 1;
    else if (stats.totalLines > 1000) score += 0.5;

    // Full-stack bonus
    const hasBackend = stats.technologies.has('Express') || stats.apiEndpoints > 0;
    const hasFrontend = stats.technologies.has('React') || stats.technologies.has('Vue.js') || stats.components > 0;
    if (hasBackend && hasFrontend) score += 1.5;

    return Math.min(Math.round(score * 10) / 10, 10);
}

// Simple prompt generation
function createPrompt(stats, score) {
    const techList = Array.from(stats.technologies).join(', ') || 'Basic JavaScript';
    
    return `Analyze this GitHub repository with the following metrics:

FILES: ${stats.totalFiles} files, ${stats.totalLines} lines of code
COMPONENTS: ${stats.components} React/Vue components detected
API ENDPOINTS: ${stats.apiEndpoints} API routes found
FUNCTIONS: ${stats.functions} total functions
TECHNOLOGIES: ${techList}
QUALITY: ${stats.hasTests ? 'Has tests' : 'No tests'}, ${stats.hasTypeScript ? 'TypeScript' : 'JavaScript only'}

CALCULATED SCORE: ${score}/10

Provide a detailed assessment following this format:

## Overall Score: **${score}/10**

### Breakdown:
- Architecture: X/10 (reasoning)
- Technical Complexity: X/10 (reasoning) 
- Technology Stack: X/10 (reasoning)
- Code Quality: X/10 (reasoning)

## Technologies: ${techList}

## Strengths:
- [Key strengths based on metrics]

## Weaknesses:
- [Areas for improvement]

## Hiring Recommendation: **[Junior/Mid/Senior/Not Recommended]**

## Summary:
[Brief conclusion about the developer's skill level]

Be realistic in scoring - most projects should be 4-6/10. Only exceptional full-stack applications with advanced features deserve 8+/10.`;
}

// Main analysis endpoint
app.post("/api/analyze", async (req, res) => {
    try {
        const { repositories } = req.body;
        if (!repositories || repositories.length === 0) {
            return res.status(400).json({ message: "No repositories provided" });
        }

        // Process first repository only for efficiency
        const repoUrl = repositories[0];
        const files = await fetchRepoFiles(repoUrl);
        
        if (Object.keys(files).length === 0) {
            return res.status(400).json({ message: "No analyzable files found" });
        }

        const stats = analyzeProject(files);
        const score = calculateScore(stats);
        const prompt = createPrompt(stats, score);

        const chat = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a senior software engineer evaluating GitHub repositories for hiring. Be strict but fair in your assessment. Most projects should score 3-6/10."
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.2,
            max_tokens: 1000
        });

        const analysis = chat.choices[0].message.content;

        res.json({ 
            success: true, 
            analysis,
            metrics: {
                files: stats.totalFiles,
                components: stats.components,
                apis: stats.apiEndpoints,
                technologies: Array.from(stats.technologies),
                score: score
            }
        });

    } catch (err) {
        console.error("Analysis error:", err);
        res.status(500).json({ 
            success: false, 
            error: "Failed to analyze repository" 
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
