// Complete MetricsCalculator.js with improved technology scoring

class MetricsCalculator {
    constructor() {
        // Define technology categories and their weights
        this.techCategories = {
            frontend: {
                weight: 1.2,
                modern: ['React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js'],
                legacy: ['jQuery', 'Backbone.js'],
                technologies: new Set()
            },
            backend: {
                weight: 1.2,
                modern: ['Express.js', 'Fastify', 'Next.js', 'NestJS', 'Koa'],
                legacy: [],
                technologies: new Set()
            },
            database: {
                weight: 1.1,
                modern: ['Prisma', 'MongoDB', 'PostgreSQL', 'Firebase'],
                legacy: ['MySQL'], // Not necessarily bad, but less modern
                technologies: new Set()
            },
            testing: {
                weight: 0.8,
                modern: ['Jest', 'Vitest', 'Cypress', 'Playwright', 'Testing Library'],
                legacy: ['Mocha', 'Jasmine'],
                technologies: new Set()
            },
            tooling: {
                weight: 0.6,
                modern: ['Vite', 'ESLint', 'Prettier', 'TypeScript', 'Webpack'],
                legacy: ['Grunt', 'Gulp'],
                technologies: new Set()
            },
            utilities: {
                weight: 0.4,
                modern: ['Lodash', 'Axios', 'Socket.IO', 'Joi', 'Yup'],
                legacy: [],
                technologies: new Set()
            }
        };
    }

    // ORIGINAL METHODS - UNCHANGED
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

    // IMPROVED TECHNOLOGY SCORING
    calculateTechnologyScore(metrics) {
        // Reset technology categories
        Object.values(this.techCategories).forEach(category => {
            category.technologies.clear();
        });

        // Categorize technologies
        this.categorizeTechnologies(metrics);

        // Calculate base score from technology stack coherence
        const coherenceScore = this.calculateStackCoherence(metrics);
        
        // Calculate modernization score
        const modernizationScore = this.calculateModernizationScore();
        
        // Calculate coverage score (how many important areas are covered)
        const coverageScore = this.calculateCoverageScore();
        
        // Calculate complexity penalty (too many technologies can be bad)
        const complexityPenalty = this.calculateComplexityPenalty(metrics);
        
        // Combine scores with weights
        let finalScore = Math.round(
            (coherenceScore * 0.4) +
            (modernizationScore * 0.3) +
            (coverageScore * 0.3) -
            complexityPenalty
        );

        return Math.max(1, Math.min(finalScore, 9));
    }

    categorizeTechnologies(metrics) {
        const allTechs = [
            ...Array.from(metrics.technologies.frameworks),
            ...Array.from(metrics.technologies.libraries),
            ...Array.from(metrics.technologies.database)
        ];

        allTechs.forEach(tech => {
            this.categorizeIndividualTech(tech);
        });
    }

    categorizeIndividualTech(tech) {
        // Frontend frameworks
        if (['React', 'Vue.js', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js'].includes(tech)) {
            this.techCategories.frontend.technologies.add(tech);
        }
        // Backend frameworks
        else if (['Express.js', 'Fastify', 'Koa', 'NestJS'].includes(tech)) {
            this.techCategories.backend.technologies.add(tech);
        }
        // Databases
        else if (['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'Prisma'].includes(tech)) {
            this.techCategories.database.technologies.add(tech);
        }
        // Testing frameworks
        else if (['Jest', 'Vitest', 'Cypress', 'Playwright', 'Testing Library', 'Mocha', 'Jasmine'].includes(tech)) {
            this.techCategories.testing.technologies.add(tech);
        }
        // Development tools
        else if (['TypeScript', 'ESLint', 'Prettier', 'Webpack', 'Vite', 'Rollup'].includes(tech)) {
            this.techCategories.tooling.technologies.add(tech);
        }
        // Utility libraries
        else {
            this.techCategories.utilities.technologies.add(tech);
        }
    }

    calculateStackCoherence(metrics) {
        let coherenceScore = 1;

        // Check for common tech stack combinations
        const frameworks = metrics.technologies.frameworks;
        const libraries = metrics.technologies.libraries;

        // MERN Stack bonus
        if (frameworks.has('React') && frameworks.has('Express.js') && 
            metrics.technologies.database.has('MongoDB')) {
            coherenceScore += 2;
        }
        
        // MEAN Stack bonus
        if (frameworks.has('Angular') && frameworks.has('Express.js') && 
            metrics.technologies.database.has('MongoDB')) {
            coherenceScore += 2;
        }

        // Next.js full-stack bonus
        if (frameworks.has('Next.js') && metrics.technologies.database.size > 0) {
            coherenceScore += 1.5;
        }

        // TypeScript consistency bonus
        if (libraries.has('TypeScript') || frameworks.has('TypeScript')) {
            coherenceScore += 1;
        }

        // Modern tooling bonus
        if (libraries.has('ESLint') && libraries.has('Prettier')) {
            coherenceScore += 0.5;
        }

        return Math.min(coherenceScore, 5);
    }

    calculateModernizationScore() {
        let modernScore = 1;
        let legacyPenalty = 0;

        Object.entries(this.techCategories).forEach(([category, config]) => {
            const categoryTechs = Array.from(config.technologies);
            
            // Count modern vs legacy technologies
            const modernCount = categoryTechs.filter(tech => 
                config.modern.includes(tech)).length;
            const legacyCount = categoryTechs.filter(tech => 
                config.legacy.includes(tech)).length;

            // Add points for modern technologies, weighted by category importance
            modernScore += (modernCount * config.weight * 0.5);
            
            // Subtract points for legacy technologies
            legacyPenalty += (legacyCount * config.weight * 0.3);
        });

        return Math.max(1, modernScore - legacyPenalty);
    }

    calculateCoverageScore() {
        let coverageScore = 1;
        
        // Essential categories that should be present
        const essentialCategories = ['frontend', 'backend'];
        const importantCategories = ['database', 'testing'];
        
        essentialCategories.forEach(category => {
            if (this.techCategories[category].technologies.size > 0) {
                coverageScore += 1.5;
            }
        });

        importantCategories.forEach(category => {
            if (this.techCategories[category].technologies.size > 0) {
                coverageScore += 1;
            }
        });

        // Bonus for having tooling setup
        if (this.techCategories.tooling.technologies.size > 0) {
            coverageScore += 0.5;
        }

        return Math.min(coverageScore, 6);
    }

    calculateComplexityPenalty(metrics) {
        const totalTechnologies = 
            metrics.technologies.frameworks.size +
            metrics.technologies.libraries.size +
            metrics.technologies.database.size;

        // Penalty for having too many technologies (over-engineering)
        if (totalTechnologies > 15) {
            return 2; // Heavy penalty
        } else if (totalTechnologies > 12) {
            return 1; // Medium penalty
        } else if (totalTechnologies > 8) {
            return 0.5; // Light penalty
        }
        
        return 0; // No penalty
    }

    // ADDITIONAL HELPER METHODS FOR TECHNOLOGY INSIGHTS
    getTechnologyInsights(metrics) {
        this.categorizeTechnologies(metrics);
        
        const insights = {
            stackType: this.identifyStackType(metrics),
            modernizationLevel: this.getModernizationLevel(),
            recommendations: this.getTechRecommendations(metrics),
            strengths: this.getTechStrengths(),
            concerns: this.getTechConcerns()
        };

        return insights;
    }

    identifyStackType(metrics) {
        const frameworks = metrics.technologies.frameworks;
        const databases = metrics.technologies.database;

        if (frameworks.has('React') && frameworks.has('Express.js') && databases.has('MongoDB')) {
            return 'MERN Stack';
        }
        if (frameworks.has('Next.js')) {
            return 'Next.js Full-Stack';
        }
        if (frameworks.has('Vue.js')) {
            return 'Vue.js Application';
        }
        if (frameworks.has('Angular')) {
            return 'Angular Application';
        }
        if (frameworks.has('Express.js')) {
            return 'Node.js Backend';
        }
        
        return 'Custom Stack';
    }

    getModernizationLevel() {
        const modernCount = Object.values(this.techCategories)
            .reduce((count, category) => {
                return count + Array.from(category.technologies)
                    .filter(tech => category.modern.includes(tech)).length;
            }, 0);

        const legacyCount = Object.values(this.techCategories)
            .reduce((count, category) => {
                return count + Array.from(category.technologies)
                    .filter(tech => category.legacy.includes(tech)).length;
            }, 0);

        if (modernCount > legacyCount * 2) return 'Highly Modern';
        if (modernCount > legacyCount) return 'Modern';
        if (modernCount === legacyCount) return 'Mixed';
        return 'Needs Modernization';
    }

    getTechRecommendations(metrics) {
        const recommendations = [];

        // Missing testing framework
        if (this.techCategories.testing.technologies.size === 0) {
            recommendations.push('Add testing framework (Jest/Vitest recommended)');
        }

        // Missing TypeScript
        if (!metrics.technologies.libraries.has('TypeScript')) {
            recommendations.push('Consider migrating to TypeScript for better type safety');
        }

        // Missing linting
        if (!metrics.technologies.libraries.has('ESLint')) {
            recommendations.push('Add ESLint for code quality consistency');
        }

        // No database for backend project
        if (this.techCategories.backend.technologies.size > 0 && 
            this.techCategories.database.technologies.size === 0) {
            recommendations.push('Backend project should include database integration');
        }

        return recommendations;
    }

    getTechStrengths() {
        const strengths = [];

        if (this.techCategories.frontend.technologies.size > 0 && 
            this.techCategories.backend.technologies.size > 0) {
            strengths.push('Full-stack development capability');
        }

        if (this.techCategories.testing.technologies.size > 0) {
            strengths.push('Testing infrastructure in place');
        }

        if (this.techCategories.tooling.technologies.size > 1) {
            strengths.push('Good development tooling setup');
        }

        return strengths;
    }

    getTechConcerns() {
        const concerns = [];

        const totalTechs = Object.values(this.techCategories)
            .reduce((sum, category) => sum + category.technologies.size, 0);

        if (totalTechs > 12) {
            concerns.push('High number of technologies may indicate over-engineering');
        }

        if (this.techCategories.testing.technologies.size === 0) {
            concerns.push('No testing framework detected');
        }

        const legacyTechs = Object.values(this.techCategories)
            .reduce((count, category) => {
                return count + Array.from(category.technologies)
                    .filter(tech => category.legacy.includes(tech)).length;
            }, 0);

        if (legacyTechs > 2) {
            concerns.push('Multiple legacy technologies detected');
        }

        return concerns;
    }
}

export default MetricsCalculator;