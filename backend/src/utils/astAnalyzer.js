// backend/src/utils/astAnalyzer.js
import JavaScriptAnalyzer from './analyzers/JavaScriptAnalyzer.js';
import ConfigAnalyzer from './analyzers/ConfigAnalyzer.js';
import MetricsCalculator from './analyzers/MetricsCalculator.js';
import SummaryGenerator from './analyzers/SummaryGenerator.js';

class ASTAnalyzer {
    constructor() {
        this.jsAnalyzer = new JavaScriptAnalyzer();
        this.configAnalyzer = new ConfigAnalyzer();
        this.metricsCalculator = new MetricsCalculator();
        this.summaryGenerator = new SummaryGenerator();
        
        this.metrics = {
            architecture: {
                components: [],
                apiEndpoints: [],
                utilities: [],
                services: [],
                totalFiles: 0
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

        // Analyze each file using appropriate analyzer
        for (const [filepath, content] of Object.entries(files)) {
            if (!content) continue;

            if (this.isJavaScriptFile(filepath)) {
                this.jsAnalyzer.analyzeFile(filepath, content, this.metrics);
            } else if (this.isConfigFile(filepath)) {
                this.configAnalyzer.analyzeFile(filepath, content, this.metrics);
            }
        }

        // Generate structured summary using all collected metrics
        return this.summaryGenerator.generateSummary(this.metrics, this.metricsCalculator);
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