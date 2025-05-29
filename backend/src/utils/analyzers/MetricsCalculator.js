// backend/src/utils/analyzers/MetricsCalculator.js

class MetricsCalculator {
    calculateArchitectureScore(metrics) {
        let score = 1;

        // Component structure
        if (metrics.architecture.components.length > 5) score += 2;
        else if (metrics.architecture.components.length > 2) score += 1;

        // API structure
        const apiCount = metrics.architecture.apiEndpoints.length;
        if (apiCount > 5) {
            score += 3; // Strong API layer
        } else if (apiCount > 2) {
            score += 2; // Good API layer
        } else if (apiCount > 0) {
            score += 1; // Basic API layer
        }

        // File organization
        if (metrics.architecture.totalFiles > 10) score += 1;
        else if (metrics.architecture.totalFiles > 5) score += 0.5;

        // Patterns
        if (metrics.technologies.patterns.size > 3) score += 1;
        else if (metrics.technologies.patterns.size > 1) score += 0.5;

        return Math.min(Math.round(score), 9);
    }

    calculateComplexityScore(metrics) {
        const avgComplexity = metrics.complexity.cyclomaticComplexity / Math.max(metrics.architecture.totalFiles, 1);

        if (avgComplexity > 15) return 8; // High complexity
        if (avgComplexity > 10) return 6; // Medium-high complexity
        if (avgComplexity > 5) return 4;  // Medium complexity
        if (avgComplexity > 2) return 3;  // Low-medium complexity
        return 2; // Simple
    }

    calculateTechnologyScore(metrics) {
        let score = 1;

        const totalTech = metrics.technologies.frameworks.size +
            metrics.technologies.libraries.size +
            metrics.technologies.database.size;

        if (totalTech > 8) score += 3;
        else if (totalTech > 5) score += 2;
        else if (totalTech > 2) score += 1;

        // Modern frameworks bonus
        if (metrics.technologies.frameworks.has('React') ||
            metrics.technologies.frameworks.has('Next.js')) score += 1;

        // Database integration
        if (metrics.technologies.database.size > 0) score += 1;

        return Math.min(score, 9);
    }

    calculateQualityScore(metrics) {
        let score = 1;

        if (metrics.quality.hasTests) score += 2;
        if (metrics.quality.hasTypeScript) score += 2;
        if (metrics.quality.hasLinting) score += 1;
        if (metrics.quality.testFiles > 2) score += 1;

        return Math.min(score, 9);
    }

    getComplexityRating(metrics) {
        const avgComplexity = metrics.complexity.cyclomaticComplexity / Math.max(metrics.architecture.totalFiles, 1);

        if (avgComplexity > 15) return 'Very High';
        if (avgComplexity > 10) return 'High';
        if (avgComplexity > 5) return 'Medium';
        if (avgComplexity > 2) return 'Low';
        return 'Very Low';
    }

    calculateSeparationLevel(metrics) {
        const componentCount = metrics.architecture.components.length;
        const apiCount = metrics.architecture.apiEndpoints.length;
        const hasFramework = metrics.technologies.frameworks.size > 0;
        
        if (componentCount > 5 && apiCount > 3 && hasFramework) {
            return 'Excellent';
        } else if (componentCount > 3 && apiCount > 1) {
            return 'Good';
        } else if (componentCount > 1 || apiCount > 0) {
            return 'Basic';
        }
        return 'Poor';
    }

    detectArchitecturalPatterns(metrics) {
        const patterns = [];

        if (metrics.technologies.patterns.has('React Hooks')) {
            patterns.push('Hook Pattern');
        }

        if (metrics.architecture.components.length > 3) {
            patterns.push('Component Architecture');
        }

        if (metrics.architecture.apiEndpoints.length > 2) {
            patterns.push('RESTful API');
        }

        if (metrics.technologies.patterns.has('API Calls')) {
            patterns.push('Service Layer');
        }

        // Add MVC pattern detection for Express apps
        if (metrics.technologies.frameworks.has('Express.js') && 
            metrics.architecture.apiEndpoints.length > 1) {
            patterns.push('MVC Architecture');
        }

        return patterns;
    }
}

export default MetricsCalculator;