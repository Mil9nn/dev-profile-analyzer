// backend/src/utils/fetchGitHubCodeData.js
import axios from "axios";
import { categorizeFiles } from "./categorizeFiles.js";
import { fetchFileContent, analyzeCodeComplexity, extractTechStack, fetchRepositoryTree } from "./codeAnalysis.js";

export const fetchGitHubCodeData = async (username, repos, progressCallback = null) => {
  try {
    const githubConfig = {
      headers: process.env.GITHUB_TOKEN ? {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`
      } : {}
    };

    const repositoriesData = [];
    let currentRepoIndex = 0;

    // Emit initial progress
    if (progressCallback) {
      progressCallback({
        stage: 'fetching_repos',
        message: `Fetching ${repos.length} repositories...`,
        progress: 5,
        details: {
          totalRepos: repos.length,
          currentRepo: 0
        }
      });
    }

    for (const repo of repos) {
      currentRepoIndex++;
      const repoProgress = Math.floor((currentRepoIndex / repos.length) * 60); // 60% for repo fetching

      console.log(`[${currentRepoIndex}/${repos.length}] Analyzing repository: ${repo}`);

      if (progressCallback) {
        progressCallback({
          stage: 'fetching_repo_data',
          message: `Analyzing repository: ${repo}`,
          progress: 5 + repoProgress,
          details: {
            totalRepos: repos.length,
            currentRepo: currentRepoIndex,
            repoName: repo
          }
        });
      }

      try {
        // Get repository metadata
        const repoResponse = await axios.get(`https://api.github.com/repos/${username}/${repo}`, githubConfig);
        const repoData = repoResponse.data;

        if (progressCallback) {
          progressCallback({
            stage: 'fetching_file_tree',
            message: `Fetching file structure for ${repo}...`,
            progress: 5 + repoProgress + 5,
            details: {
              repoName: repo,
              stars: repoData.stargazers_count,
              language: repoData.language
            }
          });
        }

        // Get file tree
        const files = await fetchRepositoryTree(username, repo, githubConfig);
        
        if (files.length === 0) {
          console.warn(`No files found in repository: ${repo}`);
          continue;
        }

        if (progressCallback) {
          progressCallback({
            stage: 'categorizing_files',
            message: `Categorizing ${files.length} files in ${repo}...`,
            progress: 5 + repoProgress + 10,
            details: {
              repoName: repo,
              totalFiles: files.length
            }
          });
        }

        const categorized = categorizeFiles(files);

        console.log(`🖼️ Frontend Files (${categorized.frontend.length}):`);

        console.log(`🛠️ Backend Files (${categorized.backend.length}):`);

        console.log(`⚙️ Config Files (${categorized.config.length}):`);

        // Fetch actual code content for priority files
        const codeAnalysis = {
          frontend: [],
          backend: [],
          config: [],
          techStack: new Set()
        };

        const totalFilesToAnalyze = categorized.frontend.length + categorized.backend.length + categorized.config.length;
        let analyzedFilesCount = 0;

        if (progressCallback) {
          progressCallback({
            stage: 'analyzing_code',
            message: `Analyzing ${totalFilesToAnalyze} code files in ${repo}...`,
            progress: 5 + repoProgress + 15,
            details: {
              repoName: repo,
              totalFiles: totalFilesToAnalyze,
              analyzedFiles: 0
            }
          });
        }

        // Process files with individual progress updates
        const fetchPromiseWithProgress = async (file, category) => {
          const content = await fetchFileContent(username, repo, file.path, githubConfig);
          analyzedFilesCount++;

          if (progressCallback && analyzedFilesCount % 3 === 0) { // Update every 3 files to avoid spam
            const fileProgress = Math.floor((analyzedFilesCount / totalFilesToAnalyze) * 15);
            progressCallback({
              stage: 'analyzing_code',
              message: `Analyzing code files... (${analyzedFilesCount}/${totalFilesToAnalyze})`,
              progress: 5 + repoProgress + 15 + fileProgress,
              details: {
                repoName: repo,
                totalFiles: totalFilesToAnalyze,
                analyzedFiles: analyzedFilesCount,
                currentFile: file.path
              }
            });
          }

          if (content) {
            const analysisResult = {
              path: file.path,
              content: content.slice(0, 8000), // Increased for better analysis
              size: file.size,
              complexity: analyzeCodeComplexity(content, file.path)
            };

            if (category === 'frontend') {
              codeAnalysis.frontend.push(analysisResult);
            } else if (category === 'backend') {
              codeAnalysis.backend.push(analysisResult);
            } else if (category === 'config') {
              const configAnalysis = {
                path: file.path,
                content: content,
                techStack: extractTechStack(content, file.path)
              };
              codeAnalysis.config.push(configAnalysis);
              
              // Add to overall tech stack
              extractTechStack(content, file.path).forEach(tech =>
                codeAnalysis.techStack.add(tech)
              );
            }
          }
        };

        // Process all files
        const allPromises = [
          ...categorized.frontend.map(file => fetchPromiseWithProgress(file, 'frontend')),
          ...categorized.backend.map(file => fetchPromiseWithProgress(file, 'backend')),
          ...categorized.config.map(file => fetchPromiseWithProgress(file, 'config'))
        ];

        // Wait for all file fetches to complete
        await Promise.all(allPromises);

        if (progressCallback) {
          progressCallback({
            stage: 'completing_repo',
            message: `Completed analysis of ${repo}`,
            progress: 5 + repoProgress + 30,
            details: {
              repoName: repo,
              frontendFiles: codeAnalysis.frontend.length,
              backendFiles: codeAnalysis.backend.length,
              configFiles: codeAnalysis.config.length,
              techStack: Array.from(codeAnalysis.techStack)
            }
          });
        }

        repositoriesData.push({
          name: repoData.name,
          language: repoData.language,
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          lastUpdated: repoData.updated_at,
          description: repoData.description,
          size: repoData.size,
          codeAnalysis: {
            ...codeAnalysis,
            techStack: Array.from(codeAnalysis.techStack)
          }
        });

      } catch (repoError) {
        console.error(`Error processing repository ${repo}:`, repoError.message);
        
        if (progressCallback) {
          progressCallback({
            stage: 'repo_error',
            message: `Failed to analyze ${repo}: ${repoError.message}`,
            progress: 5 + repoProgress,
            details: {
              repoName: repo,
              error: repoError.message
            }
          });
        }
        
        // Continue with other repositories instead of failing completely
        continue;
      }
    }

    if (repositoriesData.length === 0) {
      throw new Error('No repositories could be analyzed successfully');
    }

    // Final repository analysis complete
    if (progressCallback) {
      const totalFiles = repositoriesData.reduce((sum, repo) => 
        sum + repo.codeAnalysis.frontend.length + repo.codeAnalysis.backend.length, 0);
      const totalTechStack = [...new Set(repositoriesData.flatMap(repo => repo.codeAnalysis.techStack))];

      progressCallback({
        stage: 'repos_complete',
        message: `Repository analysis complete. Analyzed ${totalFiles} files across ${repositoriesData.length} repositories.`,
        progress: 75,
        details: {
          repositoriesAnalyzed: repositoriesData.length,
          totalFiles: totalFiles,
          techStackDiversity: totalTechStack.length,
          repositories: repositoriesData.map(repo => ({
            name: repo.name,
            language: repo.language,
            stars: repo.stars,
            filesAnalyzed: repo.codeAnalysis.frontend.length + repo.codeAnalysis.backend.length
          }))
        }
      });
    }

    return { repositories: repositoriesData };

  } catch (error) {
    console.error('GitHub data fetch error:', error.message);
    
    if (progressCallback) {
      progressCallback({
        stage: 'error',
        message: `Failed to fetch GitHub data: ${error.message}`,
        progress: 0,
        error: true
      });
    }

    if (error.response?.status === 404) {
      throw new Error('GitHub user or repository not found');
    }
    if (error.response?.status === 403) {
      throw new Error('GitHub API rate limit exceeded or repository is private');
    }
    if (error.response?.status === 401) {
      throw new Error('GitHub API authentication failed');
    }
    
    throw new Error(`Failed to fetch GitHub data: ${error.message}`);
  }
};