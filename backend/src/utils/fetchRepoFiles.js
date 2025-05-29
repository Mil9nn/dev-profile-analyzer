// backend/src/utils/fetchRepoFiles.js

async function fetchRepoFiles(repoUrl) {
    const [owner, repo] = repoUrl.split("github.com/")[1].split("/");
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;
    
    const headers = {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
    };

    const treeRes = await fetch(apiUrl, { headers });
    if (!treeRes.ok) {
        throw new Error(`Failed to fetch repo tree: ${treeRes.status}`);
    }

    const data = await treeRes.json();
    
    const excluded = [
        "node_modules", "dist", "build", "out", ".next", ".turbo", ".vercel", 
        ".git", ".cache", ".expo", ".vscode", "coverage", "android", "ios",
        "public", "assets", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
        ".DS_Store", "README.md", "LICENSE", ".gitignore"
    ];

    const shouldExclude = (path) => {
        return excluded.some(item => 
            path.includes(`/${item}/`) || 
            path.startsWith(`${item}/`) || 
            path.endsWith(item)
        );
    };

    const matchingFiles = data.tree.filter(file => {
        return file.type === "blob" && 
               /\.(js|jsx|ts|tsx|json)$/.test(file.path) && 
               !shouldExclude(file.path);
    });

    console.log(`✅ Matching files to fetch: ${matchingFiles.length}`);

    const files = {};
    for (const file of matchingFiles) {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${file.path}`;
        try {
            const rawRes = await fetch(rawUrl, { headers });
            if (rawRes.ok) {
                files[file.path] = await rawRes.text();
            } else {
                console.warn(`⚠️ Skipped: ${file.path} (status: ${rawRes.status})`);
            }
        } catch (err) {
            console.warn(`⚠️ Failed to fetch file: ${file.path}`, err.message);
        }
    }

    return files;
}

export default fetchRepoFiles;