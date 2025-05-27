async function fetchRepoFiles(repoUrl) {
  const [owner, repo] = repoUrl.split("github.com/")[1].split("/");
  const branch = "main";

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;

  const headers = {
    Accept: "application/vnd.github.v3+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, // optional
  };

  const treeRes = await fetch(apiUrl, { headers });
  if (!treeRes.ok) {
    throw new Error(`Failed to fetch repo tree: ${treeRes.status}`);
  }

  const data = await treeRes.json();
  
  const excludedDirs = [
    "node_modules",
    "dist",
    "build",
    "out",
    ".next",
    ".turbo",
    ".vercel",
    ".git",
    ".cache",
    ".expo",
    ".vscode",
    "coverage",
    "android",
    "ios",
    "skeletons",
    "seeds",
    "public", // often static assets
    "assets", // can be images/audio
    "__tests__", // optional if you don't want test analysis
  ];

  const excludedFiles = [
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    ".DS_Store",
    "Thumbs.db",
    "README.md",
    "LICENSE",
    "CONTRIBUTING.md",
    "CHANGELOG.md",
    ".gitignore",
    ".eslintrc.js",
    ".prettierrc",
    "tsconfig.json",
    "jsconfig.json",
    "eslint.config.js",
    "tailwind.config.js",
    "vite.config.js",
    "babel.config.js",
  ];

  const shouldExclude = (path) => {
    return excludedDirs.some(dir => path.startsWith(`${dir}/`) || path.includes(`/${dir}/`)) ||
      excludedFiles.some(file => path.endsWith(file));
  };

  const matchingFiles = data.tree.filter(file => {
    const isCode = /\.(js|jsx|ts|tsx|json)$/.test(file.path);
    const isIncluded = !shouldExclude(file.path);
    return file.type === "blob" && isCode && isIncluded;
  });

  console.log(`✅ Matching files to fetch: ${matchingFiles.length}`);

  // Optional: log a few matching paths and their extensions
  matchingFiles.slice(0, 50).forEach((file, index) => {
    const ext = file.path.split('.').pop();
    console.log(`${index + 1}. ${file.path} [.${ext}]`);
  });

  const files = {};
  for (const file of matchingFiles) {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;
    try {
      const rawRes = await fetch(rawUrl, { headers });
      if (!rawRes.ok) {
        console.warn(`⚠️ Skipped: ${file.path} (status: ${rawRes.status})`);
        continue;
      }
      const content = await rawRes.text();
      files[file.path] = content;
    } catch (err) {
      console.warn(`⚠️ Failed to fetch file: ${file.path}`, err.message);
    }
  }

  return files;
}

export default fetchRepoFiles;