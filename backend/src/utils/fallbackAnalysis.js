export function createFallbackAnalysis(stats, score) {
    const technologies = stats.technologies ? Array.from(stats.technologies) : [];

    return {
        score,
        rationale: [
            `Analyzed ${stats.totalFiles} files with ${stats.totalLines} lines`,
            `Found ${stats.components} components and ${stats.apiEndpoints} API endpoints`
        ],
        technologies: technologies,
        strengths: [
            stats.hasTypeScript ? "Uses TypeScript" : "Good JavaScript structure",
            stats.components > 3 ? "Well-organized components" : "Basic project structure"
        ],
        weaknesses: [
            !stats.hasTests ? "No tests detected" : "Limited test coverage",
            stats.totalFiles < 10 ? "Small project scope" : "Could improve documentation"
        ],
        improvements: [
            "Add comprehensive tests",
            "Improve documentation",
            "Consider TypeScript if not used"
        ],
        hiringPotential: {
            level: score >= 7 ? "Senior" : score >= 5 ? "Mid" : score >= 3 ? "Junior" : "Entry",
            details: `Shows ${score >= 6 ? 'strong' : score >= 4 ? 'decent' : 'basic'} development skills with ${Array.from(stats.technologies).slice(0, 3).join(', ')}.`,
            watchAreas: [
                !stats.hasTests ? "Testing practices" : "Test coverage",
                "Code documentation",
                "Project complexity"
            ]
        },
        conclusion: `${score}/10 - ${score >= 7 ? 'Excellent' : score >= 5 ? 'Good' : score >= 3 ? 'Decent' : 'Basic'} profile with growth potential.`
    };
}
