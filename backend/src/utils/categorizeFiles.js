export const categorizeFiles = (files) => {
    const frontend = [];
    const backend = [];
    const config = [];

    // File extensions
    const FRONTEND_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.html', '.css', '.scss', '.sass', '.less', '.styl'];
    const BACKEND_EXTENSIONS = ['.py', '.java', '.go', '.rs', '.php', '.rb', '.cs', '.cpp', '.c', '.kt', '.scala', '.clj', '.ex', '.exs', '.lua', '.dart'];
    const CONFIG_FILES = ['package.json', 'requirements.txt', 'cargo.toml', 'pom.xml', 'composer.json', 'gemfile', 'pipfile', 'poetry.lock', 'yarn.lock', 'dockerfile', 'docker-compose', 'makefile', 'cmake', 'build.gradle', 'settings.gradle'];

    // Directories/paths to IGNORE (case-insensitive)
    const IGNORE_PATHS = [
        'node_modules', 'vendor', '.git', '.svn', '.hg', 'dist', 'build', 'out', 'target', 'bin', 'obj', '.next', '.nuxt',
        '.vscode', '.idea', '.vs', 'coverage', '.nyc_output', 'test-results', 'logs', 'tmp', 'temp', 'cache', '.cache',
        'public/assets', 'assets/dist', 'static/dist', 'bower_components', 'jspm_packages', '.bundle', 'venv', 'env', '.env', '__pycache__',
        '.pytest_cache', '.tox', '.gradle', '.maven', 'target/classes', 'target/test-classes'
    ];

    // Files to IGNORE (exact matches or patterns)
    const IGNORE_FILES = [
        '.min.js', '.min.css', '.bundle.js', '.bundle.css',
        'yarn.lock', 'composer.lock', 'gemfile.lock',
        '.log', '.logs',
        '.ds_store', 'thumbs.db', 'desktop.ini',
        '.swp', '.swo', '.tmp', '~',
        'lcov.info', 'coverage.xml',
        'readme.md', 'license', 'changelog', 'contributing.md',
        'package-lock.json'
    ];

    // Additional quality filters
    const MIN_FILE_SIZE = 50;
    const MAX_FILE_SIZE = 1000000;

    const isIgnoredPath = (filePath) => {
        const pathLower = filePath.toLowerCase();
        return IGNORE_PATHS.some(ignorePath =>
            pathLower.includes(`/${ignorePath.toLowerCase()}/`) ||
            pathLower.startsWith(`${ignorePath.toLowerCase()}/`) ||
            pathLower.includes(`\\${ignorePath.toLowerCase()}\\`) ||
            pathLower.startsWith(`${ignorePath.toLowerCase()}\\`)
        );
    };

    const isIgnoredFile = (fileName) => {
        const nameLower = fileName.toLowerCase();
        return IGNORE_FILES.some(ignoreFile =>
            nameLower.endsWith(ignoreFile.toLowerCase()) ||
            nameLower === ignoreFile.toLowerCase()
        );
    };

    const isQualitySourceFile = (file) => {
        const filePath = file.path;
        const fileName = filePath.split('/').pop() || filePath.split('\\').pop();
        const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

        // Must have proper extension
        const hasValidExtension = [...FRONTEND_EXTENSIONS, ...BACKEND_EXTENSIONS].includes(extension) ||
            CONFIG_FILES.some(config => fileName.toLowerCase().includes(config));

        // Size checks
        const hasValidSize = file.size >= MIN_FILE_SIZE && file.size <= MAX_FILE_SIZE;

        // Path checks
        const hasValidPath = !isIgnoredPath(filePath) && !isIgnoredFile(fileName);

        return hasValidExtension && hasValidSize && hasValidPath;
    };

    // Filter and categorize files
    const qualityFiles = files.filter(isQualitySourceFile);

    console.log(`📁 Filtered ${files.length} total files down to ${qualityFiles.length} quality source files`);

    qualityFiles.forEach(file => {
        const fileName = file.path.toLowerCase();
        const extension = fileName.substring(fileName.lastIndexOf('.'));

        // Check for config files first (most specific)
        if (CONFIG_FILES.some(configFile => fileName.includes(configFile.toLowerCase()))) {
            config.push(file);
        }
        // Check frontend extensions
        else if (FRONTEND_EXTENSIONS.includes(extension)) {
            frontend.push(file);
        }
        // Check backend extensions
        else if (BACKEND_EXTENSIONS.includes(extension)) {
            backend.push(file);
        }
    });

    // Advanced prioritization based on multiple factors
    const prioritizeFiles = (fileArray) => {
        return fileArray.sort((a, b) => {
            let scoreA = 0;
            let scoreB = 0;

            // Size factor (larger files likely have more logic)
            scoreA += Math.min(a.size / 1000, 50);
            scoreB += Math.min(b.size / 1000, 50);

            // Source directory bonus
            const aPath = a.path.toLowerCase();
            const bPath = b.path.toLowerCase();

            if (aPath.includes('/src/') || aPath.includes('/lib/')) scoreA += 20;
            if (bPath.includes('/src/') || bPath.includes('/lib/')) scoreB += 20;

            if (aPath.includes('/components/') || aPath.includes('/pages/')) scoreA += 15;
            if (bPath.includes('/components/') || bPath.includes('/pages/')) scoreB += 15;

            if (aPath.includes('/controllers/') || aPath.includes('/models/')) scoreA += 15;
            if (bPath.includes('/controllers/') || bPath.includes('/models/')) scoreB += 15;

            // Avoid test files (lower priority)
            if (aPath.includes('test') || aPath.includes('spec')) scoreA -= 10;
            if (bPath.includes('test') || bPath.includes('spec')) scoreB -= 10;

            // Main/index files get priority
            if (aPath.includes('index.') || aPath.includes('main.') || aPath.includes('app.')) scoreA += 10;
            if (bPath.includes('index.') || bPath.includes('main.') || bPath.includes('app.')) scoreB += 10;

            return scoreB - scoreA;
        });
    };

    // Prioritize and limit files
    const prioritizedFrontend = prioritizeFiles(frontend);
    const prioritizedBackend = prioritizeFiles(backend);
    const prioritizedConfig = config.sort((a, b) => {
        const aName = a.path.toLowerCase();
        const bName = b.path.toLowerCase();

        if (aName.includes('package.json')) return -1;
        if (bName.includes('package.json')) return 1;
        if (aName.includes('requirements.txt')) return -1;
        if (bName.includes('requirements.txt')) return 1;

        return 0;
    });

    const result = {
        frontend: prioritizedFrontend.slice(0, 15),
        backend: prioritizedBackend.slice(0, 15),
        config: prioritizedConfig.slice(0, 5),
        stats: {
            totalFiles: files.length,
            qualityFiles: qualityFiles.length,
            filteredOut: files.length - qualityFiles.length,
            frontendCandidates: frontend.length,
            backendCandidates: backend.length,
            configCandidates: config.length
        }
    };

    console.log(`📊 Categorization stats:`, result.stats);
    console.log(`🎯 Selected files:`, {
        frontend: result.frontend.length,
        backend: result.backend.length,
        config: result.config.length
    });

    return result;
};

// Helper function to validate file selection
export const validateFileSelection = (categorizeFiles) => {
    const { frontend, backend, config } = categorizeFiles;

    const issues = [];

    // Check if we have a good mix
    if (frontend.length === 0 && backend.length === 0) {
        issues.push('No source code files found');
    }

    if (config.length === 0) {
        issues.push('No configuration files found - might be missing tech stack info');
    }

    // Check for overly small files
    const smallFiles = [...frontend, ...backend].filter(f => f.size < 100);
    if (smallFiles.length > 5) {
        issues.push(`${smallFiles.length} very small files selected - might be empty or minimal`);
    }

    // Check for good source directory coverage
    const allFiles = [...frontend, ...backend];
    const srcFiles = allFiles.filter(f =>
        f.path.toLowerCase().includes('/src/') ||
        f.path.toLowerCase().includes('/lib/')
    );

    if (allFiles.length > 5 && srcFiles.length === 0) {
        issues.push('No files from /src/ or /lib/ directories - might be selecting peripheral files');
    }

    return {
        isValid: issues.length === 0,
        issues,
        quality: issues.length === 0 ? 'high' : issues.length < 3 ? 'medium' : 'low'
    };
};