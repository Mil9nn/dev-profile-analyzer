// backend/src/utils/analyzers/ConfigAnalyzer.js
import ImportAnalyzer from './ImportAnalyzer.js';

class ConfigAnalyzer {
    constructor() {
        this.importAnalyzer = new ImportAnalyzer();
    }

    analyzeFile(filepath, content, metrics) {
        this.checkTestFiles(filepath, metrics);
        this.checkLintingConfig(filepath, metrics);
        this.checkTypeScript(filepath, metrics);
        this.analyzePackageJson(filepath, content, metrics);
    }

    checkTestFiles(filepath, metrics) {
        if (filepath.includes('test') || filepath.includes('spec') || filepath.includes('jest')) {
            metrics.quality.hasTests = true;
            metrics.quality.testFiles++;
        }
    }

    checkLintingConfig(filepath, metrics) {
        if (filepath.includes('eslint') || filepath.includes('prettier')) {
            metrics.quality.hasLinting = true;
        }
    }

    checkTypeScript(filepath, metrics) {
        if (filepath.endsWith('.ts') || filepath.endsWith('.tsx') || filepath.includes('tsconfig')) {
            metrics.quality.hasTypeScript = true;
        }
    }

    analyzePackageJson(filepath, content, metrics) {
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