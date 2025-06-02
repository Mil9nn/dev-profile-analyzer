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