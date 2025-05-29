// backend/src/utils/analyzers/ConfigAnalyzer.js
import ImportAnalyzer from './ImportAnalyzer.js';

class ConfigAnalyzer {
    constructor() {
        this.importAnalyzer = new ImportAnalyzer();
    }

    analyzeFile(filepath, content, metrics) {
        // Test files
        if (/test|spec|jest/.test(filepath)) {
            metrics.quality.hasTests = true;
            metrics.quality.testFiles++;
        }
        
        // Linting
        if (/eslint|prettier/.test(filepath)) {
            metrics.quality.hasLinting = true;
        }
        
        // TypeScript
        if (/\.(ts|tsx)$|tsconfig/.test(filepath)) {
            metrics.quality.hasTypeScript = true;
        }
        
        // Package.json
        if (filepath.endsWith('package.json')) {
            try {
                const pkg = JSON.parse(content);
                this.importAnalyzer.analyzeDependencies(pkg.dependencies || {}, metrics);
                this.importAnalyzer.analyzeDependencies(pkg.devDependencies || {}, metrics);
            } catch (e) {
                console.warn('Failed to parse package.json');
            }
        }
    }
}

export default ConfigAnalyzer;