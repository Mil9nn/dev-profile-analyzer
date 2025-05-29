// backend/src/utils/analyzers/JavaScriptAnalyzer.js
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import ComponentDetector from './ComponentDetector.js';
import ImportAnalyzer from './ImportAnalyzer.js';

const traverseAST = traverse.default;

class JavaScriptAnalyzer {
    constructor() {
        this.componentDetector = new ComponentDetector();
        this.importAnalyzer = new ImportAnalyzer();
    }

    analyzeFile(filepath, content, metrics) {
        try {
            const ast = parser.parse(content, {
                sourceType: 'module',
                plugins: ['jsx', 'typescript', 'decorators-legacy'],
                errorRecovery: true
            });

            let functionCount = 0;
            let totalFunctionLines = 0;
            let maxNesting = 0;

            traverseAST(ast, {
                // Function Analysis
                FunctionDeclaration: (path) => {
                    functionCount++;
                    const lines = this.getFunctionLines(path.node);
                    totalFunctionLines += lines;

                    this.componentDetector.checkReactComponent(path.node, content, filepath, metrics);
                },

                ArrowFunctionExpression: (path) => {
                    functionCount++;
                    const lines = this.getFunctionLines(path.node);
                    totalFunctionLines += lines;

                    this.componentDetector.checkReactComponent(path.node, content, filepath, metrics);
                },

                // API and Pattern Detection
                CallExpression: (path) => {
                    this.detectExpressRoutes(path.node, filepath, metrics);
                    this.detectPatterns(path.node, metrics);
                },

                // Import Analysis
                ImportDeclaration: (path) => {
                    this.importAnalyzer.analyzeImport(path.node.source.value, metrics);
                },

                // Complexity Analysis
                IfStatement: () => metrics.complexity.cyclomaticComplexity++,
                WhileStatement: () => metrics.complexity.cyclomaticComplexity++,
                ForStatement: () => metrics.complexity.cyclomaticComplexity++,
                ConditionalExpression: () => metrics.complexity.cyclomaticComplexity++,

                // Nesting Analysis
                enter: (path) => {
                    const depth = this.getPathDepth(path);
                    if (depth > maxNesting) {
                        maxNesting = depth;
                    }
                }
            });

            // Update metrics
            metrics.complexity.totalFunctions += functionCount;
            metrics.complexity.avgFunctionLength = totalFunctionLines / Math.max(functionCount, 1);
            metrics.complexity.nestingDepth = Math.max(metrics.complexity.nestingDepth, maxNesting);

        } catch (error) {
            console.warn(`Failed to parse ${filepath}:`, error.message);
        }
    }

    detectExpressRoutes(node, filepath, metrics) {
        if (!node.callee || node.callee.type !== 'MemberExpression') {
            return false;
        }

        const methodName = node.callee.property?.name;
        const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'use', 'all'];
        
        if (!httpMethods.includes(methodName)) {
            return false;
        }

        const objectName = node.callee.object?.name;
        const hasStringArg = node.arguments.length > 0 && 
                           (node.arguments[0].type === 'StringLiteral' || 
                            node.arguments[0].type === 'Literal');

        if ((objectName === 'app' || objectName === 'router' || objectName === 'express') && hasStringArg) {
            const route = this.extractRoutePattern(node);
            
            metrics.architecture.apiEndpoints.push({
                method: methodName.toUpperCase(),
                route: route,
                file: filepath
            });
            
            metrics.technologies.frameworks.add('Express.js');
            console.log(`✅ Detected API endpoint: ${methodName.toUpperCase()} ${route} in ${filepath}`);
            return true;
        }
        
        return false;
    }

    detectPatterns(node, metrics) {
        // API Calls
        if (node.callee.name === 'fetch' ||
            (node.callee.object && node.callee.object.name === 'axios')) {
            metrics.technologies.patterns.add('API Calls');
        }

        // React Hooks
        if (node.callee.name && node.callee.name.startsWith('use')) {
            metrics.technologies.patterns.add('React Hooks');
        }
    }

    extractRoutePattern(node) {
        if (node.arguments.length > 0) {
            const firstArg = node.arguments[0];
            if (firstArg.type === 'StringLiteral' || firstArg.type === 'Literal') {
                return firstArg.value || firstArg.raw || '/';
            }
        }
        return '/';
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
}

export default JavaScriptAnalyzer;