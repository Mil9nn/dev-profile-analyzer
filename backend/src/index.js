// backend/src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from "openai";
import complexity from 'cyclomatic-complexity';
import { normalizeTech } from './utils/techNormalizer.js';

dotenv.config();

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper functions
const isConfigFile = (path) => 
    /(config|\.env|settings)/i.test(path) && 
    !/(node_modules|dist|build)/.test(path);

const isTestFile = (path) => 
    /(test|spec|__tests__)/i.test(path) && 
    /\.(js|jsx|ts|tsx)$/.test(path);

const isCIFile = (path) => 
    /(\.github|\.gitlab|\.circleci|\.travis|azure-pipelines|bitbucket-pipelines)/i.test(path);

// Enhanced file fetcher with better error handling
async function fetchRepoFiles(repoUrl) {
    try {
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
            /\.(js|jsx|ts|tsx|json|yml|yaml|md|txt|sh|env|gitignore)$/.test(file.path) &&
            !/(node_modules|dist|build|\.git|public\/assets)/.test(file.path)
        );

        const priorityPatterns = [
            // Config files
            'package.json', 'vite.config', 'webpack.config', 'tailwind.config',
            'jest.config', '.eslintrc', '.prettierrc', 'tsconfig.json',
            'dockerfile', '.github/', '.gitlab-ci.yml', '.env',
            
            // Core application files
            'src/main', 'src/index', 'src/App', 
            'src/components/', 'src/pages/', 'src/routes/', 
            'src/hooks/', 'src/store/', 'src/context/', 
            'src/services/', 'src/utils/', 'src/models/',
            
            // Test files
            '__tests__/', '.test.', '.spec.'
        ];

        const sortedFiles = allFiles.sort((a, b) => {
            const aIndex = priorityPatterns.findIndex(p => a.path.includes(p));
            const bIndex = priorityPatterns.findIndex(p => b.path.includes(p));
            return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
        });

        const files = {};
        for (const file of sortedFiles.slice(0, 50)) { // Limit to top 50 files for practicality
            const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${file.path}`;
            try {
                const rawRes = await fetch(rawUrl, { headers });
                if (rawRes.ok) {
                    const content = await rawRes.text();
                    if (content.length < 15000) { // Larger limit for config files
                        files[file.path] = content;
                    }
                }
            } catch (err) {
                console.warn(`Failed to fetch: ${file.path}`);
            }
        }

        return files;
    } catch (error) {
        console.error('Error fetching repo files:', error);
        throw error;
    }
}

// Enhanced project analyzer
function analyzeProject(files) {
    const analysis = {
        metrics: {
            totalFiles: Object.keys(files).length,
            linesOfCode: 0,
            components: 0,
            apiEndpoints: 0,
            testFiles: 0,
            technologies: new Set(),
            architectureIndicators: {
                hasConfig: false,
                hasUtils: false,
                hasServices: false,
                hasLayers: false,
                hasHooks: false
            }
        },
        qualityIndicators: {
            errorHandling: 0,
            documentation: {
                hasReadme: false,
                hasComments: 0,
                hasJsdoc: 0
            },
            complexity: {
                highComplexFiles: 0,
                avgComplexity: 0,
                complexFunctions: []
            },
            patterns: new Set(),
            imports: {
                internal: 0,
                external: 0,
                deepExternal: 0
            }
        },
        testCoverage: {
            testFiles: 0,
            testTypes: new Set(),
            coverageFiles: 0,
            testTools: new Set()
        },
        professionalIndicators: {
            hasCI: false,
            hasLinting: false,
            hasFormatting: false,
            hasHusky: false,
            hasCommitLinting: false,
            hasDocker: false
        },
        securityIndicators: {
            hasEnvExample: false,
            hasGitignore: false,
            hasLockfile: false,
            sensitiveData: 0
        }
    };

    // First pass for config files and documentation
    for (const [path, content] of Object.entries(files)) {
        if (path.toLowerCase().includes('readme')) {
            analysis.qualityIndicators.documentation.hasReadme = true;
        }
        
        if (isConfigFile(path)) {
            analysis.metrics.architectureIndicators.hasConfig = true;
            
            if (path.includes('eslint') || path.includes('prettier')) {
                analysis.professionalIndicators.hasLinting = true;
            }
            
            if (path.includes('docker')) {
                analysis.professionalIndicators.hasDocker = true;
            }
        }
        
        if (path.includes('.env.example')) {
            analysis.securityIndicators.hasEnvExample = true;
        }
        
        if (path.includes('.gitignore')) {
            analysis.securityIndicators.hasGitignore = true;
        }
    }

    // Second pass for code analysis
    let totalComplexity = 0;
    let analyzedFiles = 0;
    
    for (const [path, content] of Object.entries(files)) {
        if (!content || !/\.(js|jsx|ts|tsx)$/.test(path)) continue;
        
        analysis.metrics.linesOfCode += content.split('\n').length;
        
        // Complexity analysis
        try {
            const complex = complexity(content);
            totalComplexity += complex;
            analyzedFiles++;
            
            if (complex > 15) {
                analysis.qualityIndicators.complexity.highComplexFiles++;
                analysis.qualityIndicators.complexity.complexFunctions.push({
                    file: path,
                    complexity: complex
                });
            }
        } catch (e) {
            console.warn(`Complexity analysis failed for ${path}`);
        }
        
        // Documentation analysis
        const commentLines = content.split('\n').filter(line => 
            line.trim().startsWith('//') || line.trim().startsWith('/*')
        ).length;
        
        analysis.qualityIndicators.documentation.hasComments += commentLines;
        analysis.qualityIndicators.documentation.hasJsdoc += (content.match(/\/\*\*.*?\*\//gs) || []).length;
        
        // Component detection
        const componentPatterns = [
            /(?:function|const|class)\s+([A-Z]\w*)/g,
            /export\s+(?:default\s+)?(?:function\s+)?([A-Z]\w*)/g
        ];
        
        componentPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content))) {
                if (content.includes('return') && content.includes('<' + match[1])) {
                    analysis.metrics.components++;
                }
            }
        });
        
        // API endpoint detection
        const apiPatterns = [
            /\.(get|post|put|delete|patch)\s*\(/g,
            /router\.(get|post|put|delete|patch)\s*\(/g
        ];
        
        apiPatterns.forEach(pattern => {
            analysis.metrics.apiEndpoints += (content.match(pattern) || []).length;
        });
        
        // Test file analysis
        if (isTestFile(path)) {
            analysis.testCoverage.testFiles++;
            
            if (path.includes('__tests__')) {
                analysis.testCoverage.testTypes.add('unit');
            } else if (path.includes('integration')) {
                analysis.testCoverage.testTypes.add('integration');
            } else if (path.includes('e2e')) {
                analysis.testCoverage.testTypes.add('e2e');
            }
            
            if (path.includes('jest')) {
                analysis.testCoverage.testTools.add('jest');
            } else if (path.includes('mocha')) {
                analysis.testCoverage.testTools.add('mocha');
            } else if (path.includes('cypress')) {
                analysis.testCoverage.testTools.add('cypress');
            }
        }
        
        // Architecture indicators
        if (path.includes('utils/') || path.includes('helpers/')) {
            analysis.metrics.architectureIndicators.hasUtils = true;
        }
        
        if (path.includes('services/') || path.includes('api/')) {
            analysis.metrics.architectureIndicators.hasServices = true;
        }
        
        if (path.includes('hooks/') || path.includes('hooks.')) {
            analysis.metrics.architectureIndicators.hasHooks = true;
        }
        
        // Error handling detection
        analysis.qualityIndicators.errorHandling += (content.match(/try\s*\{|catch\s*\(|\.catch\s*\(/g) || []).length;
        
        // Pattern detection
        if (content.includes('useState') || content.includes('useEffect')) {
            analysis.qualityIndicators.patterns.add('react-hooks');
        }
        
        if (content.includes('redux') || content.includes('useSelector')) {
            analysis.qualityIndicators.patterns.add('redux');
        }
        
        if (content.includes('context') && content.includes('Provider')) {
            analysis.qualityIndicators.patterns.add('context-api');
        }
        
        // Import analysis
        const importLines = content.split('\n').filter(line => line.includes('import ') || line.includes('require('));
        
        importLines.forEach(line => {
            if (line.includes('./') || line.includes('../')) {
                analysis.qualityIndicators.imports.internal++;
            } else {
                analysis.qualityIndicators.imports.external++;
                
                // Check for deep imports
                if (line.split('/').length > 2) {
                    analysis.qualityIndicators.imports.deepExternal++;
                }
            }
        });
    }
    
    // Calculate average complexity
    if (analyzedFiles > 0) {
        analysis.qualityIndicators.complexity.avgComplexity = 
            Math.round((totalComplexity / analyzedFiles) * 10) / 10;
    }
    
    // Package.json analysis
    if (files['package.json']) {
        try {
            const pkg = JSON.parse(files['package.json']);
            
            // Check for technologies
            const allDeps = {...pkg.dependencies, ...pkg.devDependencies};
            Object.keys(allDeps).forEach(dep => {
                const normalized = normalizeTech(dep);
                if (normalized) analysis.metrics.technologies.add(normalized);
            });
            
            // Check for professional practices
            if (pkg.scripts) {
                if (pkg.scripts.test) analysis.testCoverage.testTools.add('npm-test');
                if (pkg.scripts.lint) analysis.professionalIndicators.hasLinting = true;
                if (pkg.scripts.format) analysis.professionalIndicators.hasFormatting = true;
                if (pkg.scripts.prepare || pkg.scripts.prepush) {
                    analysis.professionalIndicators.hasHusky = true;
                }
            }
            
            if (pkg.husky) {
                analysis.professionalIndicators.hasHusky = true;
                if (pkg.husky.hooks && pkg.husky.hooks['commit-msg']) {
                    analysis.professionalIndicators.hasCommitLinting = true;
                }
            }
            
            if (allDeps['husky']) analysis.professionalIndicators.hasHusky = true;
            if (allDeps['commitlint']) analysis.professionalIndicators.hasCommitLinting = true;
            
            // Check for lockfile
            if (files['package-lock.json'] || files['yarn.lock']) {
                analysis.securityIndicators.hasLockfile = true;
            }
        } catch (e) {
            console.warn('Failed to parse package.json');
        }
    }
    
    // CI/CD detection
    for (const path in files) {
        if (isCIFile(path)) {
            analysis.professionalIndicators.hasCI = true;
            break;
        }
    }
    
    return analysis;
}

// Enhanced evaluation with multiple dimensions
function evaluateCandidate(analysis) {
    const evaluation = {
        technicalAssessment: {
            strengths: [],
            concerns: [],
            recommendations: []
        },
        experienceLevel: {
            likelyLevel: 'Junior',
            confidence: 0.7,
            growthAreas: []
        },
        teamFit: {
            likelyRoles: [],
            collaborationSignals: []
        },
        hiringRecommendation: {
            recommendation: 'Neutral',
            rationale: ''
        }
    };
    
    // Technical strengths
    if (analysis.metrics.technologies.size > 5) {
        evaluation.technicalAssessment.strengths.push(
            `Diverse technology exposure (${analysis.metrics.technologies.size} major technologies)`
        );
    }
    
    if (analysis.testCoverage.testFiles > 3) {
        evaluation.technicalAssessment.strengths.push(
            `Good test coverage (${analysis.testCoverage.testFiles} test files)`
        );
    }
    
    if (analysis.qualityIndicators.errorHandling > 10) {
        evaluation.technicalAssessment.strengths.push(
            `Strong error handling (${analysis.qualityIndicators.errorHandling} try/catch blocks)`
        );
    }
    
    // Technical concerns
    if (analysis.qualityIndicators.complexity.highComplexFiles > 3) {
        evaluation.technicalAssessment.concerns.push(
            `${analysis.qualityIndicators.complexity.highComplexFiles} highly complex files (complexity > 15)`
        );
    }
    
    if (!analysis.qualityIndicators.documentation.hasReadme) {
        evaluation.technicalAssessment.concerns.push('Missing README documentation');
    }
    
    if (analysis.qualityIndicators.imports.deepExternal > 5) {
        evaluation.technicalAssessment.concerns.push(
            `${analysis.qualityIndicators.imports.deepExternal} deep external imports (potential dependency issues)`
        );
    }
    
    // Experience level assessment
    let levelScore = 0;
    
    if (analysis.metrics.components > 10) levelScore += 1;
    if (analysis.metrics.apiEndpoints > 5) levelScore += 1;
    if (analysis.testCoverage.testTypes.size > 1) levelScore += 1;
    if (analysis.professionalIndicators.hasCI) levelScore += 1;
    if (analysis.qualityIndicators.patterns.size > 2) levelScore += 1;
    
    if (levelScore >= 4) {
        evaluation.experienceLevel.likelyLevel = 'Senior';
        evaluation.experienceLevel.confidence = 0.8;
    } else if (levelScore >= 2) {
        evaluation.experienceLevel.likelyLevel = 'Mid';
        evaluation.experienceLevel.confidence = 0.7;
    } else {
        evaluation.experienceLevel.likelyLevel = 'Junior';
        evaluation.experienceLevel.confidence = 0.6;
    }
    
    // Team fit assessment
    const techs = Array.from(analysis.metrics.technologies);
    
    if (techs.some(t => ['react', 'vue', 'angular'].includes(t))) {
        evaluation.teamFit.likelyRoles.push('Frontend');
    }
    
    if (techs.some(t => ['express', 'nestjs', 'spring'].includes(t))) {
        evaluation.teamFit.likelyRoles.push('Backend');
    }
    
    if (evaluation.teamFit.likelyRoles.length > 1) {
        evaluation.teamFit.likelyRoles = ['Full-stack'];
    }
    
    // Collaboration signals
    if (analysis.professionalIndicators.hasLinting) {
        evaluation.teamFit.collaborationSignals.push('Uses linting (consistent code style)');
    }
    
    if (analysis.professionalIndicators.hasHusky) {
        evaluation.teamFit.collaborationSignals.push('Uses git hooks (professional workflow)');
    }
    
    if (analysis.professionalIndicators.hasCI) {
        evaluation.teamFit.collaborationSignals.push('CI/CD configured (team-ready)');
    }
    
    // Hiring recommendation
    const recommendationScore = 
        (evaluation.technicalAssessment.strengths.length * 2) - 
        (evaluation.technicalAssessment.concerns.length * 1.5) +
        (evaluation.experienceLevel.likelyLevel === 'Senior' ? 3 : 
         evaluation.experienceLevel.likelyLevel === 'Mid' ? 2 : 1);
    
    if (recommendationScore >= 5) {
        evaluation.hiringRecommendation.recommendation = 'Strong Yes';
        evaluation.hiringRecommendation.rationale = 'Demonstrates strong technical skills and professional practices';
    } else if (recommendationScore >= 3) {
        evaluation.hiringRecommendation.recommendation = 'Yes';
        evaluation.hiringRecommendation.rationale = 'Shows good potential with some areas for improvement';
    } else if (recommendationScore >= 1) {
        evaluation.hiringRecommendation.recommendation = 'Neutral';
        evaluation.hiringRecommendation.rationale = 'Mixed signals, would benefit from interview evaluation';
    } else {
        evaluation.hiringRecommendation.recommendation = 'No';
        evaluation.hiringRecommendation.rationale = 'Significant gaps in key areas';
    }
    
    return evaluation;
}

// API endpoint with enhanced analysis
app.post("/api/analyze", async (req, res) => {
    try {
        const { repositories } = req.body;
        if (!repositories?.length) {
            return res.status(400).json({ error: "No repositories provided" });
        }

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
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
        const analysis = analyzeProject(allFiles);
        
        send({ stage: 'evaluating' });
        const evaluation = evaluateCandidate(analysis);

        send({ stage: 'ai-processing' });

        let aiFeedback;
        if (process.env.OPENAI_API_KEY) {
            try {
                const prompt = `Analyze this codebase evaluation and provide detailed feedback in JSON format:
                
                ${JSON.stringify({ analysis, evaluation }, null, 2)}
                
                Return JSON with these fields:
                {
                    "summary": "overall summary",
                    "technicalStrengths": [],
                    "technicalWeaknesses": [],
                    "professionalPractices": [],
                    "recommendedRoles": [],
                    "interviewQuestions": [],
                    "finalAssessment": ""
                }`;
                
                const chat = await openai.chat.completions.create({
                    model: "gpt-4",
                    messages: [
                        { role: "system", content: "You are a senior engineering manager. Provide detailed but concise feedback." },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.3,
                    max_tokens: 1000,
                    response_format: { type: "json_object" }
                });
                
                aiFeedback = JSON.parse(chat.choices[0].message.content);
            } catch (err) {
                console.error('AI analysis failed:', err);
                aiFeedback = { error: "AI analysis failed", details: err.message };
            }
        }

        send({
            stage: 'complete',
            success: true,
            result: { 
                analysis,
                evaluation,
                aiFeedback: aiFeedback || { note: "OpenAI integration not configured" }
            }
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