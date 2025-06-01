import axios from "axios";
import { categorizeFiles } from "./categorizeFiles.js";

export const fetchGitHubCodeData = async (username, repos) => {
  try {
    const githubConfig = {
      headers: process.env.GITHUB_TOKEN ? {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`
      } : {}
    };

    const repositoriesData = [];

    for (const repo of repos) {
      console.log(`Analyzing repository: ${repo}`);

      // Get repository metadata (minimal, focused data)
      const repoResponse = await axios.get(`https://api.github.com/repos/${username}/${repo}`, githubConfig);
      const repoData = repoResponse.data;

      // Get file tree
      const files = await fetchGitHubCodeData(username, repo, githubConfig);
      const categorized = categorizeFiles(files);

      console.log(`🖼️ Frontend Files (${categorized.frontend.length}):`);
      categorized.frontend.forEach(file => console.log(` - ${file.path}`));

      console.log(`🛠️ Backend Files (${categorized.backend.length}):`);
      categorized.backend.forEach(file => console.log(` - ${file.path}`));

      console.log(`⚙️ Config Files (${categorized.config.length}):`);
      categorized.config.forEach(file => console.log(` - ${file.path}`));

      // Fetch actual code content for priority files
      const codeAnalysis = {
        frontend: [],
        backend: [],
        config: [],
        techStack: new Set()
      };

      // Fetch frontend files
      for (const file of categorized.frontend) {
        const content = await fetchFileContent(username, repo, file.path, githubConfig);
        if (content) {
          codeAnalysis.frontend.push({
            path: file.path,
            content: content.slice(0, 5000), // Limit to first 5000 chars to avoid token limits
            size: file.size,
            complexity: analyzeCodeComplexity(content, file.path)
          });
        }
      }

      // Fetch backend files
      for (const file of categorized.backend) {
        const content = await fetchFileContent(username, repo, file.path, githubConfig);
        if (content) {
          codeAnalysis.backend.push({
            path: file.path,
            content: content.slice(0, 5000),
            size: file.size,
            complexity: analyzeCodeComplexity(content, file.path)
          });
        }
      }

      // Fetch config files for tech stack analysis
      for (const file of categorized.config) {
        const content = await fetchFileContent(username, repo, file.path, githubConfig);
        if (content) {
          codeAnalysis.config.push({
            path: file.path,
            content: content,
            techStack: extractTechStack(content, file.path)
          });

          // Add to overall tech stack
          extractTechStack(content, file.path).forEach(tech =>
            codeAnalysis.techStack.add(tech)
          );
        }
      }

      repositoriesData.push({
        name: repoData.name,
        language: repoData.language,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        lastUpdated: repoData.updated_at,
        codeAnalysis: {
          ...codeAnalysis,
          techStack: Array.from(codeAnalysis.techStack)
        }
      });
    }

    return { repositories: repositoriesData };

  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('GitHub user or repository not found');
    }
    if (error.response?.status === 403) {
      throw new Error('GitHub API rate limit exceeded');
    }
    throw new Error(`Failed to fetch GitHub data: ${error.message}`);
  }
};
