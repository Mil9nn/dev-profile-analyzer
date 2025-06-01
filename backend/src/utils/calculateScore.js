export function calculateScore(stats) {
    const weights = {
        size: 0.1,
        quality: 0.3,
        architecture: 0.25,
        testing: 0.15,
        documentation: 0.1,
        performance: 0.1
    };

    // Size score (0-10)
    const sizeScore = Math.min(10, 
        Math.log(stats.totalFiles) * 3 + 
        Math.log(stats.totalLines / 100) * 2
    );

    // Quality score (0-10)
    const qualityScore = Math.min(10,
        (stats.components.quality * 2) +
        (5 - Math.min(5, stats.functions.complexity / 2)) +
        (stats.types.hasTypeScript ? 2 : 0) +
        (stats.types.strictness ? 1 : 0) +
        Math.min(2, stats.hooks.custom * 0.5)
    );

    // Architecture score (0-10)
    const architectureScore = Math.min(10,
        stats.architecture.modularity * 2 +
        stats.architecture.separation * 2 +
        stats.architecture.dependencyHealth +
        (5 - Math.min(5, stats.architecture.circularDependencies))
    );

    // Testing score (0-10)
    const testingScore = Math.min(10,
        Math.min(5, stats.tests.count / 5) +
        (stats.tests.coverage ? 3 : 0) +
        (stats.tests.typeDistribution.integration > 0 ? 1 : 0) +
        (stats.tests.typeDistribution.e2e > 0 ? 1 : 0)
    );

    // Documentation score (0-10)
    const documentationScore = Math.min(10,
        stats.documentation.score * 2 +
        stats.documentation.readmeQuality * 2
    );

    // Performance score (0-10)
    const performanceScore = Math.min(10,
        stats.performance.score * 2 +
        (5 - Math.min(5, stats.performance.issues.size))
    );

    // Calculate weighted total
    const totalScore = 
        sizeScore * weights.size +
        qualityScore * weights.quality +
        architectureScore * weights.architecture +
        testingScore * weights.testing +
        documentationScore * weights.documentation +
        performanceScore * weights.performance;

    // Normalize to 0-10 scale
    const normalizedScore = Math.min(10, Math.max(0, totalScore * 1.2));

    return {
        score: Math.round(normalizedScore * 10) / 10,
        breakdown: {
            size: Math.round(sizeScore * 10) / 10,
            quality: Math.round(qualityScore * 10) / 10,
            architecture: Math.round(architectureScore * 10) / 10,
            testing: Math.round(testingScore * 10) / 10,
            documentation: Math.round(documentationScore * 10) / 10,
            performance: Math.round(performanceScore * 10) / 10
        },
        weights: weights
    };
}