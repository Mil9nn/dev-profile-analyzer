// backend/src/utils/analyzers/SummaryGenerator.js

class SummaryGenerator {
    generateSummary(metrics, metricsCalculator) {
        const totalFiles = metrics.architecture.totalFiles;
        const architectureScore = metricsCalculator.calculateArchitectureScore(metrics);
        const complexityScore = metricsCalculator.calculateComplexityScore(metrics);
        const technologyScore = metricsCalculator.calculateTechnologyScore(metrics);
        const qualityScore = metricsCalculator.calculateQualityScore(metrics);
        
        return {
            overview: {
                totalFiles,
                components: metrics.architecture.components.length,
                apiEndpoints: metrics.architecture.apiEndpoints.length,
                totalFunctions: metrics.complexity.totalFunctions,
                linesOfCode: Math.round(metrics.complexity.avgFunctionLength * metrics.complexity.totalFunctions)
            },
            scores: {
                architecture: architectureScore,
                complexity: complexityScore,
                technology: technologyScore,
                quality: qualityScore
            },
            technologies: {
                frameworks: Array.from(metrics.technologies.frameworks),
                libraries: Array.from(metrics.technologies.libraries).slice(0, 8),
                databases: Array.from(metrics.technologies.database),
                patterns: Array.from(metrics.technologies.patterns)
            },
            complexity: {
                cyclomaticComplexity: metrics.complexity.cyclomaticComplexity,
                avgFunctionLength: Math.round(metrics.complexity.avgFunctionLength),
                nestingDepth: metrics.complexity.nestingDepth,
                complexityRating: metricsCalculator.getComplexityRating(metrics)
            },
            quality: {
                hasTests: metrics.quality.hasTests,
                hasTypeScript: metrics.quality.hasTypeScript,
                hasLinting: metrics.quality.hasLinting,
                testFiles: metrics.quality.testFiles
            },
            architecture: {
                componentBased: metrics.architecture.components.length > 0,
                hasAPI: metrics.architecture.apiEndpoints.length > 0,
                separation: metricsCalculator.calculateSeparationLevel(metrics),
                patterns: metricsCalculator.detectArchitecturalPatterns(metrics)
            }
        };
    }
}

export default SummaryGenerator;