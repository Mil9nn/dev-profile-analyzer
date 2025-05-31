// backend/src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from "openai";

dotenv.config();

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

    const allFiles = data.tree.filter(file =>
        file.type === "blob" &&
        /\.(js|jsx|ts|tsx|json)$/.test(file.path) &&
        !/(node_modules|dist|build|\.git|public|assets)/.test(file.path)
    );

    const priorityPatterns = [
        'package.json', 'src/main', 'src/index', 'src/App',
        'src/components/', 'src/pages/', 'src/hooks/', 'server.js', 'app.js'
    ];

    const sortedFiles = allFiles.sort((a, b) => {
        const aIndex = priorityPatterns.findIndex(p => a.path.includes(p));
        const bIndex = priorityPatterns.findIndex(p => b.path.includes(p));
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    }).slice(0, 25);

    const files = {};
    for (const file of sortedFiles) {
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

    const detectedLibs = new Set();

    for (const [path, content] of Object.entries(files)) {
        if (!content) continue;

        stats.totalLines += content.split('\n').length;

        // Extract imports
        const importPatterns = [
            /import\s+(?:[^'"]*)\s+from\s+['"]([^'"]+)['"]/g,
            /import\s+['"]([^'"]+)['"]/g,
            /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
        ];

        importPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content))) {
                const lib = match[1];
                if (!lib.startsWith('.') && !lib.startsWith('/')) {
                    const pkgName = lib.startsWith('@') 
                        ? lib.split('/').slice(0, 2).join('/')
                        : lib.split('/')[0];
                    
                    if (pkgName && !pkgName.match(/^(src|components|pages|utils|hooks)/)) {
                        detectedLibs.add(pkgName);
                    }
                }
            }
        });

        if (path.includes('test') || path.includes('spec')) stats.hasTests = true;
        if (path.endsWith('.ts') || path.endsWith('.tsx')) stats.hasTypeScript = true;

        const componentMatches = content.match(/(?:function|const|class)\s+[A-Z]\w*|export\s+(?:default\s+)?(?:function\s+)?[A-Z]\w*/g);
        if (componentMatches && content.includes('<')) {
            stats.components += componentMatches.length;
        }

        const apiMatches = content.match(/\.(get|post|put|delete|patch)\s*\(/g);
        if (apiMatches) stats.apiEndpoints += apiMatches.length;

        const functionMatches = content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*\(?\s*\)?\s*=>)/g);
        if (functionMatches) stats.functions += functionMatches.length;
    }

    if (files['package.json']) {
        try {
            const pkg = JSON.parse(files['package.json']);
            Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).forEach(dep => {
                if (!dep.match(/^(eslint|@types|@vitejs|webpack|babel)/)) {
                    detectedLibs.add(dep);
                }
            });
        } catch (e) {
            console.warn('Invalid package.json');
        }
    }

    detectedLibs.forEach(lib => stats.technologies.add(lib));
    return stats;
}

function calculateScore(stats) {
    let score = 2;
    
    if (stats.totalFiles > 15) score += 2;
    else if (stats.totalFiles > 8) score += 1;
    
    if (stats.components > 8) score += 2;
    else if (stats.components > 4) score += 1;
    
    if (stats.apiEndpoints > 3) score += 1.5;
    else if (stats.apiEndpoints > 0) score += 1;
    
    if (stats.technologies.size > 5) score += 1.5;
    else if (stats.technologies.size > 3) score += 1;
    
    if (stats.hasTests) score += 1;
    if (stats.hasTypeScript) score += 1;
    if (stats.totalLines > 1500) score += 0.5;
    
    return Math.min(Math.round(score * 10) / 10, 10);
}

function createPrompt(stats, score) {
    return `Analyze this GitHub repository and return JSON:

{
  "score": ${score},
  "rationale": ["reason1", "reason2"],
  "technologies": ${JSON.stringify(Array.from(stats.technologies))},
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvements": ["improvement1", "improvement2"],
  "hiringPotential": {
    "level": "Junior/Mid/Senior/Entry",
    "details": "explanation",
    "watchAreas": ["area1", "area2"]
  },
  "conclusion": "summary"
}

Metrics: ${stats.totalFiles} files, ${stats.components} components, ${stats.apiEndpoints} APIs, ${Array.from(stats.technologies).join(', ')}`;
}

function createFallbackAnalysis(stats, score) {
    return {
        score,
        rationale: [
            `Analyzed ${stats.totalFiles} files with ${stats.totalLines} lines`,
            `Found ${stats.components} components and ${stats.apiEndpoints} API endpoints`
        ],
        technologies: Array.from(stats.technologies),
        strengths: [
            stats.hasTypeScript ? "Uses TypeScript" : "Good JavaScript structure",
            stats.components > 3 ? "Well-organized components" : "Basic project structure"
        ],
        weaknesses: [
            !stats.hasTests ? "No tests detected" : "Limited test coverage",
            stats.totalFiles < 10 ? "Small project scope" : "Could improve documentation"
        ],
        improvements: [
            "Add comprehensive tests",
            "Improve documentation",
            "Consider TypeScript if not used"
        ],
        hiringPotential: {
            level: score >= 7 ? "Senior" : score >= 5 ? "Mid" : score >= 3 ? "Junior" : "Entry",
            details: `Shows ${score >= 6 ? 'strong' : score >= 4 ? 'decent' : 'basic'} development skills with ${Array.from(stats.technologies).slice(0, 3).join(', ')}.`,
            watchAreas: [
                !stats.hasTests ? "Testing practices" : "Test coverage",
                "Code documentation",
                "Project complexity"
            ]
        },
        conclusion: `${score}/10 - ${score >= 7 ? 'Excellent' : score >= 5 ? 'Good' : score >= 3 ? 'Decent' : 'Basic'} profile with growth potential.`
    };
}

app.post("/api/analyze", async (req, res) => {
    try {
        const { repositories } = req.body;
        if (!repositories?.length) {
            return res.status(400).json({ error: "No repositories provided" });
        }

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });

        const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

        const validRepos = repositories.filter(repo => repo?.trim());
        let allFiles = {};

        for (let i = 0; i < validRepos.length; i++) {
            const repo = validRepos[i];
            send({ stage: 'fetching', repo: repo.split('/').pop(), current: i + 1, total: validRepos.length });

            try {
                const files = await fetchRepoFiles(repo);
                allFiles = { ...allFiles, ...files };
                send({ stage: 'fetched', fileCount: Object.keys(files).length });
            } catch (err) {
                send({ stage: 'error', repo, error: err.message });
                continue;
            }
        }

        if (!Object.keys(allFiles).length) {
            send({ stage: 'complete', success: false, error: "No files found" });
            return res.end();
        }

        send({ stage: 'analyzing' });
        const stats = analyzeProject(allFiles);
        const score = calculateScore(stats);

        send({ stage: 'ai-processing' });

        let aiFeedback;
        if (process.env.OPENAI_API_KEY) {
            try {
                const chat = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: "You are a senior developer. Return only valid JSON." },
                        { role: "user", content: createPrompt(stats, score) }
                    ],
                    temperature: 0.2,
                    max_tokens: 800
                });
                aiFeedback = JSON.parse(chat.choices[0].message.content);
            } catch (err) {
                aiFeedback = createFallbackAnalysis(stats, score);
            }
        } else {
            aiFeedback = createFallbackAnalysis(stats, score);
        }

        send({
            stage: 'complete',
            success: true,
            result: { aiFeedback, metrics: { ...stats, technologies: Array.from(stats.technologies), score } }
        });

        res.end();
    } catch (err) {
        console.error("Analysis error:", err);
        res.write(`data: ${JSON.stringify({ stage: 'error', error: err.message })}\n\n`);
        res.end();
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));