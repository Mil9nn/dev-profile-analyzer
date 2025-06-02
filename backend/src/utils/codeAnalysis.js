import axios from 'axios';
import { techStackMap } from '../techStackMap.js';

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

  const result = {
    linesOfCode: lines,
    functionCount: functions,
    importCount: imports,
    commentDensity: comments / lines,
    cyclomaticComplexity: complexPatterns,
    codeQualityScore: Math.min(10, (comments / lines * 10) + (functions > 0 ? 2 : 0) + (imports > 0 ? 1 : 0))
  };

 return result; 
};

export const extractTechStack = (content, filePath) => {
  const techStack = new Set();

  // Check for package.json (Node.js / JS projects)
  if (filePath.includes('package.json')) {
    try {
      const packageData = JSON.parse(content);
      const deps = {
        ...packageData.dependencies,
        ...packageData.devDependencies
      };

      for (const dep of Object.keys(deps || {})) {
        for (const [tech, rules] of Object.entries(techStackMap)) {
          if (rules.dependencies?.some(keyword => dep.toLowerCase().includes(keyword.toLowerCase()))) {
            techStack.add(tech);
          }
        }
      }
    } catch (e) {
      console.warn(`Could not parse package.json at ${filePath}`);
    }
  }

  // Check for Python projects and general file keywords
  if (filePath.includes('requirements.txt') || filePath.endsWith('.py')) {
    for (const [tech, rules] of Object.entries(techStackMap)) {
      if (rules.keywords?.some(keyword => content.toLowerCase().includes(keyword.toLowerCase()))) {
        techStack.add(tech);
      }
    }
  }

  return Array.from(techStack);
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
