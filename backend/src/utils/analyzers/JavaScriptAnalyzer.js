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
                'FunctionDeclaration|ArrowFunctionExpression': (path) => {
                    functionCount++;
                    const lines = this.getFunctionLines(path.node);
                    totalFunctionLines += lines;
                    this.componentDetector.checkReactComponent(path.node, content, filepath, metrics);
                },

                CallExpression: (path) => {
                    this.detectExpressRoutes(path.node, filepath, metrics);
                    this.detectPatterns(path.node, metrics);
                },

                ImportDeclaration: (path) => {
                    this.importAnalyzer.analyzeImport(path.node.source.value, metrics);
                },

                'IfStatement|WhileStatement|ForStatement|ConditionalExpression': () => {
                    metrics.complexity.cyclomaticComplexity++;
                },

                enter: (path) => {
                    const depth = this.getPathDepth(path);
                    if (depth > maxNesting) maxNesting = depth;
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
        if (node.callee?.type !== 'MemberExpression') return;

        const method = node.callee.property?.name;
        const obj = node.callee.object?.name;
        const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'use', 'all'];
        
        if (httpMethods.includes(method) && 
            ['app', 'router', 'express'].includes(obj) && 
            node.arguments.length > 0 && 
            (node.arguments[0].type === 'StringLiteral' || node.arguments[0].type === 'Literal')) {
            
            const route = node.arguments[0].value || node.arguments[0].raw || '/';
            
            metrics.architecture.apiEndpoints.push({
                method: method.toUpperCase(),
                route,
                file: filepath
            });
            
            metrics.technologies.frameworks.add('Express.js');
            console.log(`✅ Detected API endpoint: ${method.toUpperCase()} ${route} in ${filepath}`);
        }
    }

    detectPatterns(node, metrics) {
        if (node.callee.name === 'fetch' || node.callee.object?.name === 'axios') {
            metrics.technologies.patterns.add('API Calls');
        }
        if (node.callee.name?.startsWith('use')) {
            metrics.technologies.patterns.add('React Hooks');
        }
    }

    getFunctionLines(node) {
        return node.loc ? node.loc.end.line - node.loc.start.line + 1 : 10;
    }

    getPathDepth(path) {
        let depth = 0;
        let current = path;
        while (current?.parent) {
            if (current.node && ['BlockStatement', 'FunctionDeclaration', 'ArrowFunctionExpression'].includes(current.node.type)) {
                depth++;
            }
            current = current.parent;
        }
        return depth;
    }
}

export default JavaScriptAnalyzer;