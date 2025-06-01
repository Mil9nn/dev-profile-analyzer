// Improved project analysis with deeper metrics
export function analyzeProject(files) {
    const stats = {
        // Size metrics
        totalFiles: Object.keys(files).length,
        totalLines: 0,
        fileTypes: {},
        
        // Code quality metrics
        components: {
            count: 0,
            quality: 0, // 0-5 scale
            sizeDistribution: { small: 0, medium: 0, large: 0 }, // lines: <50, 50-150, >150
            propComplexity: 0, // avg props per component
            stateComplexity: 0, // avg state vars per component
            reusability: 0 // % components with props
        },
        
        functions: {
            count: 0,
            complexity: 0, // avg cyclomatic complexity
            sizeDistribution: { small: 0, medium: 0, large: 0 }, // lines: <10, 10-30, >30
            params: 0 // avg params per function
        },
        
        hooks: {
            count: 0,
            custom: 0,
            usage: { useState: 0, useEffect: 0, useContext: 0, custom: 0 }
        },
        
        tests: {
            count: 0,
            coverage: false,
            typeDistribution: { unit: 0, integration: 0, e2e: 0 },
            assertionsPerTest: 0
        },
        
        types: {
            hasTypeScript: false,
            interfaces: 0,
            typeUsage: 0, // % of typed variables
            strictness: false // tsconfig strict mode
        },
        
        // Architecture metrics
        architecture: {
            modularity: 0, // 0-5 scale
            separation: 0, // 0-5 scale
            dependencyHealth: 0, // 0-5 scale
            circularDependencies: 0
        },
        
        errorHandling: {
            score: 0, // 0-5 scale
            errorBoundaries: 0,
            tryCatchBlocks: 0,
            globalHandlers: 0
        },
        
        documentation: {
            score: 0, // 0-5 scale
            componentDocs: 0, // % components with docs
            functionDocs: 0, // % functions with docs
            readmeQuality: 0 // 0-2 scale
        },
        
        // Performance metrics
        performance: {
            score: 0, // 0-5 scale
            optimizations: new Set(),
            issues: new Set(),
            largeRenders: 0 // components with >100 lines in render
        },
        
        // Technology stack
        technologies: {
            frameworks: new Set(),
            libraries: new Set(),
            tools: new Set(),
            stateManagement: new Set()
        },
        
        // API metrics
        api: {
            endpoints: 0,
            routes: new Set(),
            documentation: false,
            versioning: false
        },
        
        // Project health indicators
        health: {
            linting: false,
            formatting: false,
            ciCd: false,
            dependencyHealth: 0 // 0-5 scale
        }
    };

    const nonMentionable = [
        'eslint', '@eslint', '@types', 'path', 'http', '@vitejs', 'webpack', 'babel',
        'vite', 'globals', 'prettier', 'jest', 'mocha', 'react-dom',
        'eslint-plugin-', 'plugin-', 'postcss', 'autoprefixer', '@tailwindcss/'
    ];

    // Helper functions
    const countLines = (content) => content.split('\n').length;
    
    const detectTechStack = (content) => {
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
                        const isMentionable = !nonMentionable.some(prefix =>
                            pkgName.startsWith(prefix) ||
                            pkgName.includes('-plugin-') ||
                            pkgName.endsWith('-loader') ||
                            pkgName.endsWith('-config')
                        );

                        if (isMentionable) {
                            if (/(react|vue|angular|svelte)/i.test(pkgName)) {
                                stats.technologies.frameworks.add(pkgName);
                            } else if (/(redux|mobx|recoil|zustand|graphql|axios)/i.test(pkgName)) {
                                if (/(redux|mobx|recoil|zustand)/i.test(pkgName)) {
                                    stats.technologies.stateManagement.add(pkgName);
                                }
                                stats.technologies.libraries.add(pkgName);
                            } else {
                                stats.technologies.tools.add(pkgName);
                            }
                        }
                    }
                }
            }
        });
    };

    const analyzeComponent = (content, path) => {
        const lines = countLines(content);
        let quality = 0;
        let propCount = 0;
        let stateCount = 0;
        let hasProps = false;

        // Size classification
        if (lines < 50) stats.components.sizeDistribution.small++;
        else if (lines < 150) stats.components.sizeDistribution.medium++;
        else stats.components.sizeDistribution.large++;

        // Prop analysis
        const propMatches = content.match(/props\.\w+|{\s*\w+\s*}/g) || [];
        propCount = propMatches.length;
        hasProps = propCount > 0;
        
        // State analysis
        const stateMatches = content.match(/useState\(/g) || [];
        stateCount = stateMatches.length;

        // Quality indicators
        if (content.includes('PropTypes') || content.includes('interface Props')) quality += 1;
        if (content.includes('memo(') || content.includes('React.memo')) quality += 1;
        if (content.includes('useCallback(')) quality += 1;
        if (content.includes('useMemo(')) quality += 1;
        if (content.includes('ErrorBoundary') || content.includes('componentDidCatch')) quality += 1;
        if (content.match(/\/\*\*.*@component/gs)) quality += 1;

        // Check for large render methods
        const renderMatch = content.match(/render\(\)\s*\{([^}]+)\}/) || 
                           content.match(/return\s*\(([^)]+)\)/);
        if (renderMatch && countLines(renderMatch[0]) > 100) {
            stats.performance.largeRenders++;
        }

        stats.components.propComplexity += propCount;
        stats.components.stateComplexity += stateCount;
        stats.components.reusability += hasProps ? 1 : 0;
        stats.components.quality += Math.min(quality, 5);
    };

    const analyzeFunction = (content) => {
        const lines = countLines(content);
        let complexity = 1; // Start with 1 for the function itself
        
        // Size classification
        if (lines < 10) stats.functions.sizeDistribution.small++;
        else if (lines < 30) stats.functions.sizeDistribution.medium++;
        else stats.functions.sizeDistribution.large++;

        // Complexity analysis (simplified cyclomatic)
        complexity += (content.match(/if\s*\(|else\s*|case\s+|default\s*:|&&|\|\|/g) || []).length;
        
        // Parameter count
        const paramsMatch = content.match(/function\s*\w*\s*\(([^)]*)\)/) ||
                          content.match(/const\s*\w*\s*=\s*\(([^)]*)\)\s*=>/);
        const paramCount = paramsMatch ? paramsMatch[1].split(',').filter(p => p.trim()).length : 0;

        stats.functions.complexity += complexity;
        stats.functions.params += paramCount;
        stats.functions.count++;
    };

    const analyzeTestFile = (content, path) => {
        const testCount = (content.match(/test\(|it\(|describe\(/g) || []).length;
        stats.tests.count += testCount;
        
        // Test type detection
        if (path.includes('integration') || path.includes('__integration__')) {
            stats.tests.typeDistribution.integration += testCount;
        } else if (path.includes('e2e') || path.includes('__e2e__')) {
            stats.tests.typeDistribution.e2e += testCount;
        } else {
            stats.tests.typeDistribution.unit += testCount;
        }
        
        // Assertion count
        const assertions = (content.match(/expect\(|assert\(/g) || []).length;
        stats.tests.assertionsPerTest += assertions;
        
        // Coverage
        if (content.includes('coverage') || content.includes('istanbul')) {
            stats.tests.coverage = true;
        }
    };

    const analyzeArchitecture = (path) => {
        // Modularity - check for organized directory structure
        const moduleDirs = ['components/', 'hooks/', 'utils/', 'services/', 'store/'];
        if (moduleDirs.some(dir => path.includes(dir))) {
            stats.architecture.modularity += 1;
        }
        
        // Separation of concerns - check for mixed files
        if (path.includes('components/') && 
            (path.includes('utils/') || path.includes('hooks/'))) {
            stats.architecture.separation -= 0.5;
        }
    };

    const analyzeErrorHandling = (content) => {
        stats.errorHandling.tryCatchBlocks += (content.match(/try\s*\{|catch\s*\(/g) || []).length;
        stats.errorHandling.errorBoundaries += (content.match(/componentDidCatch|ErrorBoundary/g) || []).length;
        stats.errorHandling.globalHandlers += (content.match(/window\.onerror|process\.on\('unhandledRejection'|unhandledRejection/g) || []).length;
    };

    const analyzePerformance = (content) => {
        if (content.includes('useMemo(')) stats.performance.optimizations.add('useMemo');
        if (content.includes('useCallback(')) stats.performance.optimizations.add('useCallback');
        if (content.includes('React.memo')) stats.performance.optimizations.add('memo');
        if (content.includes('lazy(')) stats.performance.optimizations.add('lazy loading');
        
        // Performance issues
        if (content.match(/setState\(.*\)\s*[^,]*$/gm)) {
            stats.performance.issues.add('unbatched state updates');
        }
        if (content.match(/useEffect\(.*,\s*\[\s*\]\s*\)/)) {
            stats.performance.issues.add('empty dependency arrays');
        }
    };

    // Main analysis loop
    for (const [path, content] of Object.entries(files)) {
        if (!content) continue;

        stats.totalLines += countLines(content);
        
        // File type analysis
        const extension = path.split('.').pop();
        stats.fileTypes[extension] = (stats.fileTypes[extension] || 0) + 1;

        // Technology detection
        detectTechStack(content);

        // Component analysis
        const isComponent = path.match(/\.(jsx|tsx)$/) && 
                          (content.match(/function\s+[A-Z]\w*|class\s+[A-Z]\w*|export\s+default\s+function\s+[A-Z]\w*/) || 
                           path.includes('components/'));
        if (isComponent) {
            stats.components.count++;
            analyzeComponent(content, path);
        }

        // Function analysis
        const functionMatches = content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:\([^)]*\)\s*=>|function))/g) || [];
        functionMatches.forEach(() => analyzeFunction(content));

        // Hook analysis
        const hookMatches = content.match(/use[A-Z]\w*/g) || [];
        stats.hooks.count += hookMatches.length;
        hookMatches.forEach(hook => {
            if (hook in stats.hooks.usage) stats.hooks.usage[hook]++;
        });
        if (content.match(/const\s+use[A-Z]\w*\s*=/)) {
            stats.hooks.custom++;
            stats.hooks.usage.custom++;
        }

        // Test analysis
        if (path.match(/(test|spec)\.(js|jsx|ts|tsx)$/)) {
            analyzeTestFile(content, path);
        }

        // TypeScript analysis
        if (path.endsWith('.ts') || path.endsWith('.tsx')) {
            stats.types.hasTypeScript = true;
            stats.types.interfaces += (content.match(/interface\s+\w+/g) || []).length;
            stats.types.typeUsage += (content.match(/:\s*\w+/g) || []).length;
        }

        // Architecture analysis
        analyzeArchitecture(path);

        // Error handling analysis
        analyzeErrorHandling(content);

        // Documentation analysis
        const hasJsDoc = content.match(/\/\*\*[^*]*\*\/|@param|@return/);
        if (isComponent && hasJsDoc) stats.documentation.componentDocs++;
        if (functionMatches.length && hasJsDoc) stats.documentation.functionDocs++;
        stats.documentation.score += (content.match(/\/\/|\/\*|\* @|jsdoc/g) || []).length;

        // Performance analysis
        analyzePerformance(content);
    }

    // Calculate averages and final scores
    if (stats.components.count) {
        stats.components.quality = Math.round((stats.components.quality / stats.components.count) * 10) / 10;
        stats.components.propComplexity = Math.round((stats.components.propComplexity / stats.components.count) * 10) / 10;
        stats.components.stateComplexity = Math.round((stats.components.stateComplexity / stats.components.count) * 10) / 10;
        stats.components.reusability = Math.round((stats.components.reusability / stats.components.count) * 100);
    }

    if (stats.functions.count) {
        stats.functions.complexity = Math.round((stats.functions.complexity / stats.functions.count) * 10) / 10;
        stats.functions.params = Math.round((stats.functions.params / stats.functions.count) * 10) / 10;
    }

    if (stats.tests.count) {
        stats.tests.assertionsPerTest = Math.round((stats.tests.assertionsPerTest / stats.tests.count) * 10) / 10;
    }

    if (stats.types.typeUsage) {
        const totalVars = (stats.totalLines * 0.3); // Estimate variable count
        stats.types.typeUsage = Math.round((stats.types.typeUsage / totalVars) * 100);
    }

    // Architecture scoring
    stats.architecture.modularity = Math.min(5, Math.floor(stats.architecture.modularity / 5));
    stats.architecture.separation = Math.max(0, Math.min(5, 3 + stats.architecture.separation));
    stats.architecture.dependencyHealth = calculateDependencyHealth(stats);

    // Error handling scoring
    stats.errorHandling.score = Math.min(5, 
        Math.floor(stats.errorHandling.errorBoundaries * 2) + 
        Math.min(2, stats.errorHandling.tryCatchBlocks / 5) +
        Math.min(1, stats.errorHandling.globalHandlers)
    );

    // Documentation scoring
    stats.documentation.score = Math.min(5,
        (stats.documentation.componentDocs / stats.components.count) * 2 +
        (stats.documentation.functionDocs / Math.max(1, stats.functions.count)) * 2 +
        Math.min(1, stats.documentation.score / (stats.totalLines / 100))
    );

    // Performance scoring
    stats.performance.score = Math.min(5,
        stats.performance.optimizations.size * 0.5 +
        (5 - Math.min(5, stats.performance.issues.size * 0.5)) +
        (stats.performance.largeRenders > 0 ? -1 : 0)
    );

    // Package.json analysis
    if (files['package.json']) {
        try {
            const pkg = JSON.parse(files['package.json']);
            stats.health.linting = !!pkg.devDependencies?.eslint || !!pkg.scripts?.lint;
            stats.health.formatting = !!pkg.devDependencies?.prettier || !!pkg.scripts?.format;
            stats.health.ciCd = !!pkg.scripts?.test || !!pkg.scripts?.build;
            
            if (pkg.dependencies) {
                Object.keys(pkg.dependencies).forEach(dep => {
                    if (!nonMentionable.some(prefix => dep.startsWith(prefix))) {
                        if (/(react|vue|angular|svelte)/i.test(dep)) {
                            stats.technologies.frameworks.add(dep);
                        } else if (/(redux|mobx|graphql|axios)/i.test(dep)) {
                            stats.technologies.libraries.add(dep);
                        }
                    }
                });
            }
            
            // Check for TypeScript strict mode
            if (files['tsconfig.json']) {
                try {
                    const tsconfig = JSON.parse(files['tsconfig.json']);
                    stats.types.strictness = !!tsconfig.compilerOptions?.strict;
                } catch (e) {}
            }
        } catch (e) {}
    }

    // README analysis
    if (files['README.md']) {
        const readmeContent = files['README.md'];
        const readmeLines = countLines(readmeContent);
        const hasInstallation = readmeContent.includes('# Installation');
        const hasUsage = readmeContent.includes('# Usage');
        const hasExamples = readmeContent.includes('# Examples');
        
        stats.documentation.readmeQuality = 
            (hasInstallation ? 0.5 : 0) +
            (hasUsage ? 0.5 : 0) +
            (hasExamples ? 0.5 : 0) +
            (readmeLines > 50 ? 0.5 : 0);
    }

    // Convert Sets to Arrays
    stats.performance.optimizations = [...stats.performance.optimizations];
    stats.performance.issues = [...stats.performance.issues];
    stats.technologies.frameworks = [...stats.technologies.frameworks];
    stats.technologies.libraries = [...stats.technologies.libraries];
    stats.technologies.tools = [...stats.technologies.tools];
    stats.technologies.stateManagement = [...stats.technologies.stateManagement];
    stats.api.routes = [...stats.api.routes];

    return stats;
}

// Helper function to calculate dependency health
function calculateDependencyHealth(stats) {
    const totalDeps = stats.technologies.frameworks.length + 
                     stats.technologies.libraries.length +
                     stats.technologies.tools.length;
    
    if (totalDeps === 0) return 5;
    
    const outdatedRisk = stats.technologies.libraries.length > 5 ? 1 : 0;
    const frameworkRisk = stats.technologies.frameworks.length > 1 ? 1 : 0;
    
    return Math.max(0, 5 - outdatedRisk - frameworkRisk);
}
