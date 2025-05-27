function prepareProjectSummary(files) {
  const importantFiles = [
    "package.json", "index.js", "server.js",
    "App.jsx", "App.js", "main.jsx",
    "pages/index.jsx", "pages/Home.jsx",
    "components/Header.jsx", "components/Navbar.jsx",
  ];

  const summary = [];

  for (const [filename, content] of Object.entries(files)) {
    if (!content) continue;

    if (
      importantFiles.includes(filename) ||
      filename.includes("pages/") ||
      filename.includes("components/")
    ) {
      summary.push(`### ${filename}\n${content.slice(0, 1500)}\n`);
    }
  }

  return summary.join("\n\n---\n\n");
}

export default prepareProjectSummary;