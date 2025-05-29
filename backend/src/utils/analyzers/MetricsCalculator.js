// backend/src/utils/analyzers/MetricsCalculator.js

class MetricsCalculator {
    constructor() {
        this.modernTech = {
            frontend: ['React', 'Vue.js', 'Angular', 'Svelte', 'Next.js'],
            backend: ['Express.js', 'Fastify', 'Next.js', 'NestJS'],
            database: ['Prisma', 'MongoDB', 'PostgreSQL', 'Firebase'],
            testing: ['Jest', 'Vitest', 'Cypress', 'Playwright']
        };
    }

    calculateArchitectureScore(metrics) {
        let score = 1;
        
        // Components
        const compCount = metrics.architecture.components.length;
        score += compCount > 5 ? 2 : compCount > 2 ? 1 : 0;
        
        // APIs
        const apiCount = metrics.architecture.apiEndpoints.length;
        score += apiCount > 5 ? 3 : apiCount > 2 ? 2 : apiCount > 0 ? 1 : 0;
        
        // Files & Patterns
        score += metrics.architecture.totalFiles > 10 ? 1 : 0.5;
        score += metrics.technologies.patterns.size > 3 ? 1 : 0.5;
        
        return Math.min(Math.round(score), 9);
    }

    calculateComplexityScore(metrics) {
        const avgComplexity = metrics.complexity.cyclomaticComplexity / Math.max(metrics.architecture.totalFiles, 1);
        
        if (avgComplexity > 15) return 8;
        if (avgComplexity > 10) return 6;
        if (avgComplexity > 5) return 4;
        if (avgComplexity > 2) return 3;
        return 2;
    }

    calculateQualityScore(metrics) {
        let score = 1;
        if (metrics.quality.hasTests) score += 2;
        if (metrics.quality.hasTypeScript) score += 2;
        if (metrics.quality.hasLinting) score += 1;
        if (metrics.quality.testFiles > 2) score += 1;
        return Math.min(score, 9);
    }

    calculateTechnologyScore(metrics) {
        const allTechs = [
            ...metrics.technologies.frameworks,
            ...metrics.technologies.libraries,
            ...metrics.technologies.database
        ];
        
        let modernCount = 0;
        let totalCount = allTechs.length;
        
        // Count modern technologies
        Object.values(this.modernTech).forEach(techList => {
            modernCount += allTechs.filter(tech => techList.includes(tech)).length;
        });
        
        // Stack coherence bonus
        let bonus = 0;
        if (this.isCoherentStack(metrics)) bonus += 2;
        if (metrics.technologies.libraries.has('TypeScript')) bonus += 1;
        
        // Complexity penalty
        const penalty = totalCount > 15 ? 2 : totalCount > 12 ? 1 : 0;
        
        const baseScore = totalCount > 0 ? Math.round((modernCount / totalCount) * 6) + 1 : 1;
        return Math.max(1, Math.min(baseScore + bonus - penalty, 9));
    }

    isCoherentStack(metrics) {
        const fw = metrics.technologies.frameworks;
        const db = metrics.technologies.database;
        
        // MERN/MEAN stack
        if ((fw.has('React') || fw.has('Angular')) && fw.has('Express.js') && db.has('MongoDB')) {
            return true;
        }
        // Next.js full-stack
        if (fw.has('Next.js') && db.size > 0) {
            return true;
        }
        return false;
    }

    getComplexityRating(metrics) {
        const avg = metrics.complexity.cyclomaticComplexity / Math.max(metrics.architecture.totalFiles, 1);
        if (avg > 15) return 'Very High';
        if (avg > 10) return 'High';
        if (avg > 5) return 'Medium';
        if (avg > 2) return 'Low';
        return 'Very Low';
    }

    calculateSeparationLevel(metrics) {
        const components = metrics.architecture.components.length;
        const apis = metrics.architecture.apiEndpoints.length;
        const hasFramework = metrics.technologies.frameworks.size > 0;
        
        if (components > 5 && apis > 3 && hasFramework) return 'Excellent';
        if (components > 3 && apis > 1) return 'Good';
        if (components > 1 || apis > 0) return 'Basic';
        return 'Poor';
    }

    detectArchitecturalPatterns(metrics) {
        const patterns = [];
        
        if (metrics.technologies.patterns.has('React Hooks')) patterns.push('Hook Pattern');
        if (metrics.architecture.components.length > 3) patterns.push('Component Architecture');
        if (metrics.architecture.apiEndpoints.length > 2) patterns.push('RESTful API');
        if (metrics.technologies.patterns.has('API Calls')) patterns.push('Service Layer');
        if (metrics.technologies.frameworks.has('Express.js') && metrics.architecture.apiEndpoints.length > 1) {
            patterns.push('MVC Architecture');
        }
        
        return patterns;
    }
}

export default MetricsCalculator;