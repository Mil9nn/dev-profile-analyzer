import axios from "axios";
import { categorizeFiles } from "./categorizeFiles.js";
import { fetchFileContent, analyzeCodeComplexity, extractTechStack, fetchRepositoryTree } from "./codeAnalysis.js";

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

      try {
        // Get repository metadata
        const repoResponse = await axios.get(`https://api.github.com/repos/${username}/${repo}`, githubConfig);
        const repoData = repoResponse.data;

        // FIXED: Get file tree using proper function
        const files = await fetchRepositoryTree(username, repo, githubConfig);
        
        if (files.length === 0) {
          console.warn(`No files found in repository: ${repo}`);
          continue;
        }

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

        // Process files in parallel for better performance
        const fetchPromises = [];

        // Fetch frontend files
        categorized.frontend.forEach(file => {
          fetchPromises.push(
            fetchFileContent(username, repo, file.path, githubConfig).then(content => {
              if (content) {
                codeAnalysis.frontend.push({
                  path: file.path,
                  content: content.slice(0, 5000),
                  size: file.size,
                  complexity: analyzeCodeComplexity(content, file.path)
                });
              }
            })
          );
        });

        // Fetch backend files
        categorized.backend.forEach(file => {
          fetchPromises.push(
            fetchFileContent(username, repo, file.path, githubConfig).then(content => {
              if (content) {
                codeAnalysis.backend.push({
                  path: file.path,
                  content: content.slice(0, 5000),
                  size: file.size,
                  complexity: analyzeCodeComplexity(content, file.path)
                });
              }
            })
          );
        });

        // Fetch config files
        categorized.config.forEach(file => {
          fetchPromises.push(
            fetchFileContent(username, repo, file.path, githubConfig).then(content => {
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
            })
          );
        });

        // Wait for all file fetches to complete
        await Promise.all(fetchPromises);

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

      } catch (repoError) {
        console.error(`Error processing repository ${repo}:`, repoError.message);
        // Continue with other repositories instead of failing completely
        continue;
      }
    }

    if (repositoriesData.length === 0) {
      throw new Error('No repositories could be analyzed successfully');
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