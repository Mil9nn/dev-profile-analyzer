import axios from 'axios';

// Helper function to fetch file content
export const fetchFileContent = async (username, repo, filePath, githubConfig) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${username}/${repo}/contents/${filePath}`,
      githubConfig
    );

    if (response.data.content) {
      return Buffer.from(response.data.content, 'base64').toString('utf-8');
    }
    return null;
  } catch (error) {
    console.warn(`Could not fetch ${filePath}: ${error.message}`);
    return null;
  }
};

// Analyze code complexity
export const analyzeCodeComplexity = (content, filePath) => {
  const lines = content.split('\n').length;
  const functions = (content.match(/function\s+\w+|const\s+\w+\s*=\s*\(|def\s+\w+|class\s+\w+/g) || []).length;
  const imports = (content.match(/import\s+|from\s+|require\(|#include|using\s+/g) || []).length;
  const comments = (content.match(/\/\/|\/\*|\*\/|#|<!--/g) || []).length;
  const complexPatterns = (content.match(/if\s*\(|for\s*\(|while\s*\(|switch\s*\(|try\s*{|catch\s*\(/g) || []).length;

  return {
    linesOfCode: lines,
    functionCount: functions,
    importCount: imports,
    commentDensity: comments / lines,
    cyclomaticComplexity: complexPatterns,
    codeQualityScore: Math.min(10, (comments / lines * 10) + (functions > 0 ? 2 : 0) + (imports > 0 ? 1 : 0))
  };
};

// Extract tech stack from config files
export const extractTechStack = (content, filePath) => {
  const techStack = [];

  if (filePath.includes('package.json')) {
    try {
      const packageData = JSON.parse(content);
      const deps = { ...packageData.dependencies, ...packageData.devDependencies };
      Object.keys(deps).forEach(dep => {
        if (dep.includes('react')) techStack.push('React');
        if (dep.includes('vue')) techStack.push('Vue.js');
        if (dep.includes('angular')) techStack.push('Angular');
        if (dep.includes('express')) techStack.push('Express.js');
        if (dep.includes('typescript')) techStack.push('TypeScript');
        if (dep.includes('webpack')) techStack.push('Webpack');
        if (dep.includes('tailwind')) techStack.push('Tailwind CSS');
      });
    } catch (e) {
      console.warn('Could not parse package.json');
    }
  }

  if (filePath.includes('requirements.txt') || filePath.includes('.py')) {
    if (content.includes('django')) techStack.push('Django');
    if (content.includes('flask')) techStack.push('Flask');
    if (content.includes('fastapi')) techStack.push('FastAPI');
    if (content.includes('pandas')) techStack.push('Pandas');
    if (content.includes('numpy')) techStack.push('NumPy');
  }

  return techStack;
};

// Fetch repository file tree
export const fetchRepositoryTree = async (username, repo, githubConfig) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${username}/${repo}/git/trees/HEAD?recursive=1`,
      githubConfig
    );
    
    return response.data.tree.filter(item => item.type === 'blob').map(item => ({
      path: item.path,
      size: item.size,
      sha: item.sha
    }));
  } catch (error) {
    console.error(`Failed to fetch repository tree for ${repo}:`, error.message);
    return [];
  }
};
