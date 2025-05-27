function prepareProjectSummary(files) {
  const summary = [];
  const fileEntries = Object.entries(files).filter(([_, content]) => content);
  
  // Categorize files by importance and type
  const categories = {
    core: [], // Main application files
    config: [], // Configuration files
    components: [], // UI components
    utils: [], // Utility functions
    routes: [], // API routes/pages
    styles: [], // Styling files
    tests: [] // Test files
  };

  // Categorize files
  for (const [filename, content] of fileEntries) {
    const lowerFilename = filename.toLowerCase();
    
    if (isMainFile(filename)) {
      categories.core.push([filename, content]);
    } else if (isConfigFile(filename)) {
      categories.config.push([filename, content]);
    } else if (isComponentFile(filename)) {
      categories.components.push([filename, content]);
    } else if (isUtilFile(filename)) {
      categories.utils.push([filename, content]);
    } else if (isRouteFile(filename)) {
      categories.routes.push([filename, content]);
    } else if (isStyleFile(filename)) {
      categories.styles.push([filename, content]);
    } else if (isTestFile(filename)) {
      categories.tests.push([filename, content]);
    }
  }

  // Add project overview
  summary.push("# PROJECT ANALYSIS OVERVIEW");
  summary.push(`Total Files: ${fileEntries.length}`);
  summary.push(`Core Files: ${categories.core.length}`);
  summary.push(`Components: ${categories.components.length}`);
  summary.push(`Routes/Pages: ${categories.routes.length}`);
  summary.push(`Utilities: ${categories.utils.length}`);
  summary.push(`Config Files: ${categories.config.length}`);
  summary.push(`Tests: ${categories.tests.length}`);
  summary.push("");

  // Include files in order of importance with size limits
  const priorities = [
    { name: "CORE APPLICATION FILES", files: categories.core, limit: 2000 },
    { name: "ROUTING & API ENDPOINTS", files: categories.routes, limit: 1500 },
    { name: "KEY COMPONENTS", files: categories.components, limit: 1200 },
    { name: "UTILITY FUNCTIONS", files: categories.utils, limit: 800 },
    { name: "CONFIGURATION", files: categories.config, limit: 500 },
    { name: "TESTS", files: categories.tests, limit: 400 }
  ];

  for (const priority of priorities) {
    if (priority.files.length > 0) {
      summary.push(`## ${priority.name}`);
      
      // Sort by importance and include most relevant files
      const sortedFiles = priority.files
        .sort(([a], [b]) => getFileImportance(a) - getFileImportance(b))
        .slice(0, 5); // Limit to top 5 files per category

      for (const [filename, content] of sortedFiles) {
        const truncatedContent = content.length > priority.limit 
          ? content.slice(0, priority.limit) + '\n... [truncated]'
          : content;
          
        summary.push(`### ${filename}`);
        summary.push("```");
        summary.push(truncatedContent);
        summary.push("```");
        summary.push("");
      }
    }
  }

  // Add complexity indicators
  summary.push("## COMPLEXITY INDICATORS");
  const complexityMetrics = analyzeComplexity(fileEntries);
  for (const [metric, value] of Object.entries(complexityMetrics)) {
    summary.push(`- ${metric}: ${value}`);
  }

  return summary.join("\n");
}

// Helper functions
function isMainFile(filename) {
  const mainFiles = [
    'index.js', 'index.jsx', 'index.ts', 'index.tsx',
    'main.js', 'main.jsx', 'main.ts', 'main.tsx',
    'app.js', 'app.jsx', 'app.ts', 'app.tsx',
    'server.js', 'server.ts',
    'package.json'
  ];
  return mainFiles.includes(filename.toLowerCase()) || 
         filename.toLowerCase().endsWith('/index.js') ||
         filename.toLowerCase().endsWith('/index.tsx');
}

function isConfigFile(filename) {
  const configPatterns = [
    /\.config\.(js|ts|json)$/,
    /package\.json$/,
    /tsconfig\.json$/,
    /\.eslintrc/,
    /\.prettierrc/,
    /vite\.config/,
    /webpack\.config/,
    /tailwind\.config/
  ];
  return configPatterns.some(pattern => pattern.test(filename.toLowerCase()));
}

function isComponentFile(filename) {
  return filename.toLowerCase().includes('component') ||
         filename.toLowerCase().includes('/components/') ||
         (filename.toLowerCase().endsWith('.jsx') || filename.toLowerCase().endsWith('.tsx')) &&
         !filename.toLowerCase().includes('page');
}

function isUtilFile(filename) {
  return filename.toLowerCase().includes('util') ||
         filename.toLowerCase().includes('helper') ||
         filename.toLowerCase().includes('lib/') ||
         filename.toLowerCase().includes('hooks/');
}

function isRouteFile(filename) {
  return filename.toLowerCase().includes('route') ||
         filename.toLowerCase().includes('page') ||
         filename.toLowerCase().includes('api/') ||
         filename.toLowerCase().includes('pages/');
}

function isStyleFile(filename) {
  const styleExtensions = ['.css', '.scss', '.sass', '.less', '.styl'];
  return styleExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

function isTestFile(filename) {
  return filename.toLowerCase().includes('test') ||
         filename.toLowerCase().includes('spec') ||
         filename.toLowerCase().includes('__tests__');
}

function getFileImportance(filename) {
  // Lower number = higher importance
  if (isMainFile(filename)) return 1;
  if (filename.toLowerCase().includes('app.')) return 2;
  if (isRouteFile(filename)) return 3;
  if (isComponentFile(filename)) return 4;
  if (isUtilFile(filename)) return 5;
  if (isConfigFile(filename)) return 6;
  if (isTestFile(filename)) return 7;
  return 8;
}

function analyzeComplexity(fileEntries) {
  const metrics = {
    'Total Lines of Code': 0,
    'Average File Size': 0,
    'Files with Classes': 0,
    'Files with Async/Await': 0,
    'Files with Hooks Usage': 0,
    'Files with Complex Logic': 0,
    'API Endpoints': 0,
    'Database Interactions': 0,
    'External API Calls': 0
  };

  let totalLines = 0;
  
  for (const [filename, content] of fileEntries) {
    const lines = content.split('\n').length;
    totalLines += lines;
    
    if (content.includes('class ') || content.includes('class{')) {
      metrics['Files with Classes']++;
    }
    
    if (content.includes('async ') || content.includes('await ')) {
      metrics['Files with Async/Await']++;
    }
    
    if (content.includes('useState') || content.includes('useEffect') || content.includes('useContext')) {
      metrics['Files with Hooks Usage']++;
    }
    
    // Complex logic indicators
    const complexityIndicators = [
      /switch\s*\(/g, /for\s*\(/g, /while\s*\(/g, /if\s*\([^)]{20,}\)/g,
      /map\s*\(/g, /filter\s*\(/g, /reduce\s*\(/g
    ];
    
    if (complexityIndicators.some(pattern => pattern.test(content))) {
      metrics['Files with Complex Logic']++;
    }
    
    // API endpoints
    if (content.includes('app.get') || content.includes('app.post') || content.includes('router.')) {
      metrics['API Endpoints']++;
    }
    
    // Database interactions
    if (content.includes('findOne') || content.includes('find(') || content.includes('save(') || 
        content.includes('SELECT') || content.includes('INSERT') || content.includes('UPDATE')) {
      metrics['Database Interactions']++;
    }
    
    // External API calls
    if (content.includes('fetch(') || content.includes('axios.') || content.includes('http.')) {
      metrics['External API Calls']++;
    }
  }
  
  metrics['Total Lines of Code'] = totalLines;
  metrics['Average File Size'] = Math.round(totalLines / fileEntries.length);
  
  return metrics;
}

export default prepareProjectSummary;