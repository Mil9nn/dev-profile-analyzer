// backend/src/utils/astAnalyzer.js
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
const traverseAST = traverse.default;

class ASTAnalyzer {
    constructor() {
        this.metrics = {
            architecture: {
                components: [],
                apiEndpoints: [],
                utilities: [],
                services: []
            },
            complexity: {
                cyclomaticComplexity: 0,
                totalFunctions: 0,
                avgFunctionLength: 0,
                nestingDepth: 0
            },
            technologies: {
                frameworks: new Set(),
                libraries: new Set(),
                patterns: new Set(),
                database: new Set()
            },
            quality: {
                hasTests: false,
                hasTypeScript: false,
                hasLinting: false,
                testFiles: 0,
                docStrings: 0
            }
        };
    }

    analyzeProject(files) {
        this.metrics.architecture.totalFiles = Object.keys(files).length;

        for (const [filepath, content] of Object.entries(files)) {
            if (!content) continue;

            if (this.isJavaScriptFile(filepath)) {
                this.analyzeJavaScriptFile(filepath, content);
            } else if (this.isConfigFile(filepath)) {
                this.analyzeConfigFile(filepath, content);
            }
        }

        return this.generateStructuredSummary();
    }

    analyzeJavaScriptFile(filepath, content) {
        try {
            // Handle different traverse import formats
            let traverseFunction;
            if (typeof traverse === 'function') {
                traverseFunction = traverse;
            } else if (traverse && typeof traverse.default === 'function') {
                traverseFunction = traverse.default;
            } else {
                console.error('Cannot find traverse function in:', traverse);
                return; // Skip this file
            }

            const ast = parser.parse(content, {
                sourceType: 'module',
                plugins: ['jsx', 'typescript', 'decorators-legacy'],
                errorRecovery: true
            });

            let functionCount = 0;
            let totalFunctionLines = 0;
            let maxNesting = 0;

            traverseAST(ast, {
                // Detect React Components
                FunctionDeclaration: (path) => {
                    functionCount++;
                    const lines = this.getFunctionLines(path.node);
                    totalFunctionLines += lines;

                    if (this.isReactComponent(path.node, content)) {
                        this.metrics.architecture.components.push({
                            name: path.node.id?.name || 'Anonymous',
                            type: 'function',
                            file: filepath,
                            lines: lines
                        });
                        this.metrics.technologies.frameworks.add('React');
                    }
                },

                ArrowFunctionExpression: (path) => {
                    functionCount++;
                    const lines = this.getFunctionLines(path.node);
                    totalFunctionLines += lines;

                    if (this.isReactComponent(path.node, content)) {
                        this.metrics.architecture.components.push({
                            name: 'ArrowComponent',
                            type: 'arrow',
                            file: filepath,
                            lines: lines
                        });
                        this.metrics.technologies.frameworks.add('React');
                    }
                },

                // FIXED: Combined CallExpression visitor to handle both API routes and other patterns
                CallExpression: (path) => {
                    // Detect Express API Routes
                    if (this.isExpressRoute(path.node)) {
                        const method = path.node.callee.property?.name || 'unknown';
                        const route = this.extractRoutePattern(path.node);
                        
                        this.metrics.architecture.apiEndpoints.push({
                            method: method.toUpperCase(),
                            route: route,
                            file: filepath
                        });
                        this.metrics.technologies.frameworks.add('Express.js');
                        
                        console.log(`✅ Detected API endpoint: ${method.toUpperCase()} ${route} in ${filepath}`);
                    }

                    // Detect async patterns and API calls
                    if (path.node.callee.name === 'fetch' ||
                        (path.node.callee.object && path.node.callee.object.name === 'axios')) {
                        this.metrics.technologies.patterns.add('API Calls');
                    }

                    // Detect React Hooks
                    if (path.node.callee.name && path.node.callee.name.startsWith('use')) {
                        this.metrics.technologies.patterns.add('React Hooks');
                    }
                },

                // Detect Imports
                ImportDeclaration: (path) => {
                    const source = path.node.source.value;
                    this.categorizeImport(source);
                },

                // Calculate Complexity
                IfStatement: () => {
                    this.metrics.complexity.cyclomaticComplexity++;
                },

                WhileStatement: () => {
                    this.metrics.complexity.cyclomaticComplexity++;
                },

                ForStatement: () => {
                    this.metrics.complexity.cyclomaticComplexity++;
                },

                ConditionalExpression: () => {
                    this.metrics.complexity.cyclomaticComplexity++;
                },

                // Calculate nesting depth
                enter: (path) => {
                    const depth = this.getPathDepth(path);
                    if (depth > maxNesting) {
                        maxNesting = depth;
                    }
                }
            });

            this.metrics.complexity.totalFunctions += functionCount;
            this.metrics.complexity.avgFunctionLength = totalFunctionLines / Math.max(functionCount, 1);
            this.metrics.complexity.nestingDepth = Math.max(this.metrics.complexity.nestingDepth, maxNesting);

        } catch (error) {
            console.warn(`Failed to parse ${filepath}:`, error.message);
        }
    }

    // ENHANCED: Better Express route detection
    isExpressRoute(node) {
        if (!node.callee || node.callee.type !== 'MemberExpression') {
            return false;
        }

        const methodName = node.callee.property?.name;
        const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'use', 'all'];
        
        // Check if it's an HTTP method
        if (!httpMethods.includes(methodName)) {
            return false;
        }

        // Additional checks to ensure it's likely an Express route
        const objectName = node.callee.object?.name;
        const hasStringArg = node.arguments.length > 0 && 
                           (node.arguments[0].type === 'StringLiteral' || 
                            node.arguments[0].type === 'Literal');

        // Common Express patterns: app.get(), router.post(), etc.
        return (objectName === 'app' || objectName === 'router' || objectName === 'express') && hasStringArg;
    }

    // NEW: Extract route pattern from Express route definition
    extractRoutePattern(node) {
        if (node.arguments.length > 0) {
            const firstArg = node.arguments[0];
            if (firstArg.type === 'StringLiteral' || firstArg.type === 'Literal') {
                return firstArg.value || firstArg.raw || '/';
            }
        }
        return '/';
    }

    analyzeConfigFile(filepath, content) {
        if (filepath.includes('test') || filepath.includes('spec') || filepath.includes('jest')) {
            this.metrics.quality.hasTests = true;
            this.metrics.quality.testFiles++;
        }

        if (filepath.includes('eslint') || filepath.includes('prettier')) {
            this.metrics.quality.hasLinting = true;
        }

        if (filepath.endsWith('.ts') || filepath.endsWith('.tsx') || filepath.includes('tsconfig')) {
            this.metrics.quality.hasTypeScript = true;
        }

        // Parse package.json for dependencies
        if (filepath.endsWith('package.json')) {
            try {
                const pkg = JSON.parse(content);
                this.analyzeDependencies(pkg.dependencies || {});
                this.analyzeDependencies(pkg.devDependencies || {});
            } catch (e) {
                console.warn('Failed to parse package.json');
            }
        }
    }

    isReactComponent(node, content) {
        // Check if function returns JSX or contains JSX
        return content.includes('return (') && (
            content.includes('<') && content.includes('>') ||
            content.includes('jsx') ||
            content.includes('React.createElement')
        );
    }

    categorizeImport(source) {
        const frameworks = {
            'react': 'React',
            'vue': 'Vue.js',
            '@angular': 'Angular',
            'express': 'Express.js',
            'fastify': 'Fastify',
            'next': 'Next.js',
            'nuxt': 'Nuxt.js',
            'svelte': 'Svelte'
        };

        const databases = {
            'mongoose': 'MongoDB',
            'sequelize': 'SQL/Sequelize',
            'prisma': 'Prisma',
            'firebase': 'Firebase',
            'mysql': 'MySQL',
            'pg': 'PostgreSQL',
            'redis': 'Redis'
        };

        const utilities = {
            'lodash': 'Lodash',
            'axios': 'Axios',
            'socket.io': 'Socket.IO',
            'joi': 'Validation',
            'yup': 'Validation',
            'bcrypt': 'Security',
            'jsonwebtoken': 'JWT',
            'cors': 'CORS'
        };

        // Check frameworks
        for (const [key, value] of Object.entries(frameworks)) {
            if (source.includes(key)) {
                this.metrics.technologies.frameworks.add(value);
                break;
            }
        }

        // Check databases
        for (const [key, value] of Object.entries(databases)) {
            if (source.includes(key)) {
                this.metrics.technologies.database.add(value);
                break;
            }
        }

        // Check utilities
        for (const [key, value] of Object.entries(utilities)) {
            if (source.includes(key)) {
                this.metrics.technologies.libraries.add(value);
                break;
            }
        }

        // Add external libraries (not relative imports)
        if (!source.startsWith('.') && !source.startsWith('/')) {
            const libName = source.split('/')[0];
            if (libName.length > 1) {
                this.metrics.technologies.libraries.add(libName);
            }
        }
    }

    analyzeDependencies(deps) {
        Object.keys(deps).forEach(dep => {
            this.categorizeImport(dep);
        });
    }

    getFunctionLines(node) {
        if (node.loc) {
            return node.loc.end.line - node.loc.start.line + 1;
        }
        return 10; // default estimate
    }

    getPathDepth(path) {
        let depth = 0;
        let current = path;
        while (current && current.parent) {
            if (current.node && (current.node.type === 'BlockStatement' || 
                current.node.type === 'FunctionDeclaration' || 
                current.node.type === 'ArrowFunctionExpression')) {
                depth++;
            }
            current = current.parent;
        }
        return depth;
    }

    generateStructuredSummary() {
        const totalFiles = this.metrics.architecture.totalFiles;
        const architectureScore = this.calculateArchitectureScore();
        const complexityScore = this.calculateComplexityScore();
        const technologyScore = this.calculateTechnologyScore();
        const qualityScore = this.calculateQualityScore();
        
        return {
            overview: {
                totalFiles,
                components: this.metrics.architecture.components.length,
                apiEndpoints: this.metrics.architecture.apiEndpoints.length,
                totalFunctions: this.metrics.complexity.totalFunctions,
                linesOfCode: Math.round(this.metrics.complexity.avgFunctionLength * this.metrics.complexity.totalFunctions)
            },
            scores: {
                architecture: architectureScore,
                complexity: complexityScore,
                technology: technologyScore,
                quality: qualityScore
            },
            technologies: {
                frameworks: Array.from(this.metrics.technologies.frameworks),
                libraries: Array.from(this.metrics.technologies.libraries).slice(0, 8),
                databases: Array.from(this.metrics.technologies.database),
                patterns: Array.from(this.metrics.technologies.patterns)
            },
            complexity: {
                cyclomaticComplexity: this.metrics.complexity.cyclomaticComplexity,
                avgFunctionLength: Math.round(this.metrics.complexity.avgFunctionLength),
                nestingDepth: this.metrics.complexity.nestingDepth,
                complexityRating: this.getComplexityRating()
            },
            quality: {
                hasTests: this.metrics.quality.hasTests,
                hasTypeScript: this.metrics.quality.hasTypeScript,
                hasLinting: this.metrics.quality.hasLinting,
                testFiles: this.metrics.quality.testFiles
            },
            architecture: {
                componentBased: this.metrics.architecture.components.length > 0,
                hasAPI: this.metrics.architecture.apiEndpoints.length > 0,
                separation: this.calculateSeparationLevel(),
                patterns: this.detectArchitecturalPatterns()
            }
        };
    }

    // ENHANCED: Better architecture scoring that properly accounts for APIs
    calculateArchitectureScore() {
        let score = 1;

        // Component structure
        if (this.metrics.architecture.components.length > 5) score += 2;
        else if (this.metrics.architecture.components.length > 2) score += 1;

        // API structure - FIXED scoring
        const apiCount = this.metrics.architecture.apiEndpoints.length;
        if (apiCount > 5) {
            score += 3; // Strong API layer
        } else if (apiCount > 2) {
            score += 2; // Good API layer
        } else if (apiCount > 0) {
            score += 1; // Basic API layer
        }

        // File organization
        if (this.metrics.architecture.totalFiles > 10) score += 1;
        else if (this.metrics.architecture.totalFiles > 5) score += 0.5;

        // Patterns
        if (this.metrics.technologies.patterns.size > 3) score += 1;
        else if (this.metrics.technologies.patterns.size > 1) score += 0.5;

        return Math.min(Math.round(score), 9);
    }

    calculateComplexityScore() {
        const avgComplexity = this.metrics.complexity.cyclomaticComplexity / Math.max(this.metrics.architecture.totalFiles, 1);

        if (avgComplexity > 15) return 8; // High complexity
        if (avgComplexity > 10) return 6; // Medium-high complexity
        if (avgComplexity > 5) return 4;  // Medium complexity
        if (avgComplexity > 2) return 3;  // Low-medium complexity
        return 2; // Simple
    }

    calculateTechnologyScore() {
        let score = 1;

        const totalTech = this.metrics.technologies.frameworks.size +
            this.metrics.technologies.libraries.size +
            this.metrics.technologies.database.size;

        if (totalTech > 8) score += 3;
        else if (totalTech > 5) score += 2;
        else if (totalTech > 2) score += 1;

        // Modern frameworks bonus
        if (this.metrics.technologies.frameworks.has('React') ||
            this.metrics.technologies.frameworks.has('Next.js')) score += 1;

        // Database integration
        if (this.metrics.technologies.database.size > 0) score += 1;

        return Math.min(score, 9);
    }

    calculateQualityScore() {
        let score = 1;

        if (this.metrics.quality.hasTests) score += 2;
        if (this.metrics.quality.hasTypeScript) score += 2;
        if (this.metrics.quality.hasLinting) score += 1;
        if (this.metrics.quality.testFiles > 2) score += 1;

        return Math.min(score, 9);
    }

    getComplexityRating() {
        const avgComplexity = this.metrics.complexity.cyclomaticComplexity / Math.max(this.metrics.architecture.totalFiles, 1);

        if (avgComplexity > 15) return 'Very High';
        if (avgComplexity > 10) return 'High';
        if (avgComplexity > 5) return 'Medium';
        if (avgComplexity > 2) return 'Low';
        return 'Very Low';
    }

    // ENHANCED: Better separation assessment
    calculateSeparationLevel() {
        const componentCount = this.metrics.architecture.components.length;
        const apiCount = this.metrics.architecture.apiEndpoints.length;
        const hasFramework = this.metrics.technologies.frameworks.size > 0;
        
        if (componentCount > 5 && apiCount > 3 && hasFramework) {
            return 'Excellent';
        } else if (componentCount > 3 && apiCount > 1) {
            return 'Good';
        } else if (componentCount > 1 || apiCount > 0) {
            return 'Basic';
        }
        return 'Poor';
    }

    detectArchitecturalPatterns() {
        const patterns = [];

        if (this.metrics.technologies.patterns.has('React Hooks')) {
            patterns.push('Hook Pattern');
        }

        if (this.metrics.architecture.components.length > 3) {
            patterns.push('Component Architecture');
        }

        if (this.metrics.architecture.apiEndpoints.length > 2) {
            patterns.push('RESTful API');
        }

        if (this.metrics.technologies.patterns.has('API Calls')) {
            patterns.push('Service Layer');
        }

        // Add MVC pattern detection for Express apps
        if (this.metrics.technologies.frameworks.has('Express.js') && 
            this.metrics.architecture.apiEndpoints.length > 1) {
            patterns.push('MVC Architecture');
        }

        return patterns;
    }

    isJavaScriptFile(filepath) {
        return /\.(js|jsx|ts|tsx)$/.test(filepath);
    }

    isConfigFile(filepath) {
        return /\.(json|config\.(js|ts)|rc)$/.test(filepath) ||
            filepath.includes('eslint') ||
            filepath.includes('prettier') ||
            filepath.includes('jest') ||
            filepath.includes('test');
    }
}

export default ASTAnalyzer;