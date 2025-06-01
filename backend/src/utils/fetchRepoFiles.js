export async function fetchRepoFiles(repoUrl) {
    const [owner, repo] = repoUrl.split("github.com/")[1].split("/");
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;

    const headers = {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
    };

    const treeRes = await fetch(apiUrl, { headers });
    if (!treeRes.ok) throw new Error(`Failed to fetch repo: ${treeRes.status}`);
    const data = await treeRes.json();

    const allFiles = data.tree.filter(file =>
        file.type === "blob" &&
        /\.(js|jsx|ts|tsx|json)$/.test(file.path) &&
        !/(node_modules|dist|build|\.git|public|assets)/.test(file.path)
    );

    const priorityPatterns = [
        // Frontend
        'package.json', 'vite.config.*', 'webpack.config.*', 'tailwind.config.*',
        'src/main', 'src/index', 'src/App', 'src/components/', 'src/pages/',
        'src/routes/', 'src/hooks/', 'src/store/', 'src/context/', 'index.html',

        // Backend
        'server.*', 'index.*', 'app.*', 'src/server.*', 'src/app.*', 'src/index.*',
        'routes/', 'controllers/', 'models/', 'middleware/', 'config/', 'prisma/', 'migrations/',
    ];

    const sortedFiles = allFiles.sort((a, b) => {
        const aIndex = priorityPatterns.findIndex(p => a.path.includes(p));
        const bIndex = priorityPatterns.findIndex(p => b.path.includes(p));
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    }).slice();

    const files = {};
    for (const file of sortedFiles) {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${file.path}`;
        try {
            const rawRes = await fetch(rawUrl, { headers });
            if (rawRes.ok) {
                const content = await rawRes.text();
                if (content.length < 8000) {
                    files[file.path] = content;
                }
            }
        } catch (err) {
            console.warn(`Failed to fetch: ${file.path}`);
        }
    }

    return files;
}
