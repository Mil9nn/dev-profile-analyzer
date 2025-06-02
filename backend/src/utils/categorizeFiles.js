export const categorizeFiles = (files) => {
    const frontend = [];
    const backend = [];
    const config = [];

    const FRONTEND_EXTENSIONS = ['.jsx', '.tsx', '.vue', '.svelte', '.html', '.css', '.scss', '.sass', '.less', '.styl'];
    const BACKEND_EXTENSIONS = ['.py', '.java', '.go', '.rs', '.php', '.rb', '.cs', '.cpp', '.c', '.kt', '.scala', '.clj', '.ex', '.exs', '.lua', '.dart'];
    const CONFIG_FILES = ['package.json', 'requirements.txt', 'cargo.toml', 'pom.xml', 'composer.json', 'gemfile', 'pipfile', 'poetry.lock', 'yarn.lock', 'dockerfile', 'docker-compose', 'makefile', 'cmake', 'build.gradle', 'settings.gradle'];
    
    const IGNORE_PATHS = [
        'node_modules', 'vendor', '.git', '.svn', '.hg', 'dist', 'build', 'out', 'target', 'bin', 'obj', '.next', '.nuxt',
        '.vscode', '.idea', '.vs', 'coverage', 'test-results', 'logs', 'tmp', 'cache', '.cache', '__pycache__',
        'public/assets', 'assets/dist', 'static/dist', 'bower_components', 'jspm_packages', '.bundle', 'venv', 'env', '.env',
        '.pytest_cache', '.tox', '.gradle', '.maven', 'target/classes', 'target/test-classes'
    ];

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

    const MIN_FILE_SIZE = 50;
    const MAX_FILE_SIZE = 1000000;

    const isIgnoredPath = (filePath) => {
        const pathLower = filePath.toLowerCase();
        return IGNORE_PATHS.some(ignorePath =>
            pathLower.includes(`/${ignorePath}/`) ||
            pathLower.startsWith(`${ignorePath}/`) ||
            pathLower.includes(`\\${ignorePath}\\`) ||
            pathLower.startsWith(`${ignorePath}\\`)
        );
    };

    const isIgnoredFile = (fileName) => {
        const nameLower = fileName.toLowerCase();
        return IGNORE_FILES.some(ignoreFile =>
            nameLower.endsWith(ignoreFile) || nameLower === ignoreFile
        );
    };

    const getExtension = (fileName) => {
        const dotIndex = fileName.lastIndexOf('.');
        return dotIndex !== -1 ? fileName.slice(dotIndex).toLowerCase() : '';
    };

    const isQualitySourceFile = (file) => {
        const filePath = file.path;
        const fileName = filePath.split('/').pop() || filePath.split('\\').pop();
        const extension = getExtension(fileName);

        const hasValidExtension =
            FRONTEND_EXTENSIONS.includes(extension) ||
            BACKEND_EXTENSIONS.includes(extension) ||
            ['.js', '.ts'].includes(extension) || // handled later by context
            CONFIG_FILES.some(config => fileName.toLowerCase().includes(config));

        const hasValidSize = file.size >= MIN_FILE_SIZE && file.size <= MAX_FILE_SIZE;
        const hasValidPath = !isIgnoredPath(filePath) && !isIgnoredFile(fileName);

        return hasValidExtension && hasValidSize && hasValidPath;
    };

    const qualityFiles = files.filter(isQualitySourceFile);

    console.log(`📁 Filtered ${files.length} files → ${qualityFiles.length} quality files`);

    const isLikelyFrontend = (path) =>
        path.includes('/components/') ||
        path.includes('/pages/') ||
        path.includes('/public/') ||
        path.includes('/styles/') ||
        path.includes('/client/') ||
        path.includes('/ui/');

    const isLikelyBackend = (path) =>
        path.includes('/api/') ||
        path.includes('/server/') ||
        path.includes('/controllers/') ||
        path.includes('/models/') ||
        path.includes('/routes/') ||
        path.includes('/services/') ||
        path.includes('/db/');

    qualityFiles.forEach(file => {
        const path = file.path.toLowerCase();
        const fileName = path.split('/').pop();
        const ext = getExtension(fileName);

        if (CONFIG_FILES.some(config => fileName.includes(config))) {
            config.push(file);
        } else if (FRONTEND_EXTENSIONS.includes(ext)) {
            frontend.push(file);
        } else if (BACKEND_EXTENSIONS.includes(ext)) {
            backend.push(file);
        } else if (['.js', '.ts'].includes(ext)) {
            if (isLikelyFrontend(path)) {
                frontend.push(file);
            } else if (isLikelyBackend(path)) {
                backend.push(file);
            } else {
                // ambiguous .js/.ts: try fallback
                if (path.includes('/src/') && (path.includes('/components/') || path.includes('/app/'))) {
                    frontend.push(file);
                } else {
                    backend.push(file);
                }
            }
        }
    });

    const prioritizeFiles = (fileArray) => {
        return fileArray.sort((a, b) => {
            let scoreA = 0, scoreB = 0;
            const aPath = a.path.toLowerCase();
            const bPath = b.path.toLowerCase();

            scoreA += Math.min(a.size / 1000, 50);
            scoreB += Math.min(b.size / 1000, 50);

            if (aPath.includes('/src/') || aPath.includes('/lib/')) scoreA += 20;
            if (bPath.includes('/src/') || bPath.includes('/lib/')) scoreB += 20;

            if (aPath.includes('/components/') || aPath.includes('/pages/')) scoreA += 15;
            if (bPath.includes('/components/') || bPath.includes('/pages/')) scoreB += 15;

            if (aPath.includes('/controllers/') || aPath.includes('/models/')) scoreA += 15;
            if (bPath.includes('/controllers/') || bPath.includes('/models/')) scoreB += 15;

            if (aPath.includes('test') || aPath.includes('spec')) scoreA -= 10;
            if (bPath.includes('test') || bPath.includes('spec')) scoreB -= 10;

            if (aPath.includes('index.') || aPath.includes('main.') || aPath.includes('app.')) scoreA += 10;
            if (bPath.includes('index.') || bPath.includes('main.') || bPath.includes('app.')) scoreB += 10;

            return scoreB - scoreA;
        });
    };

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

    console.log(`🎯 Selected files:`, {
        frontend: result.frontend.length,
        backend: result.backend.length,
        config: result.config.length
    });

    return result;
};
