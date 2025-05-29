export function parseProjectSummary(summaryText) {
  const result = {
    score: null,
    rationale: [],
    technologies: [],
    strengths: [],
    weaknesses: [],
    improvements: [],
    hiringPotential: {
      level: "",
      details: "",
      watchAreas: []
    },
    conclusion: ""
  };

  // More flexible score extraction - look for various patterns
  const scorePatterns = [
    /(?:score|rating):\s*\*\*?(\d+(?:\.\d+)?)\s*\/\s*10\*\*?/i,
    /\*\*?(\d+(?:\.\d+)?)\s*\/\s*10\*\*?/,
    /(?:overall|total)?\s*score:\s*(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*out\s*of\s*10/i
  ];

  for (const pattern of scorePatterns) {
    const match = summaryText.match(pattern);
    if (match) {
      result.score = parseFloat(match[1]);
      break;
    }
  }

  // Extract detailed breakdown for rationale - look for the scoring breakdown
  const breakdownSection = summaryText.match(/(?:detailed\s*breakdown|breakdown):?\s*([\s\S]*?)(?=(?:technologies|detected|strengths|weaknesses|hiring|conclusion)|$)/i);
  if (breakdownSection) {
    result.rationale = extractRationale(breakdownSection[1]);
  } else {
    // Fallback: extract rationale from lines containing scores
    const rationaleLines = summaryText.split('\n')
      .filter(line => line.includes('/10') && (line.includes('Architecture') || line.includes('Complexity') || line.includes('Technology') || line.includes('Code Quality') || line.includes('Innovation')))
      .map(line => line.trim());
    result.rationale = rationaleLines;
  }

  // FIXED: Extract technologies with improved logic
  result.technologies = extractTechnologies(summaryText);

  // Extract strengths
  const strengthsSection = summaryText.match(/strengths?:?\s*([\s\S]*?)(?=(?:weaknesses?|improvements?|hiring|conclusion|\n\s*##|\n\s*\*\*[^*]*\*\*)|$)/i);
  if (strengthsSection) {
    result.strengths = extractBulletPoints(strengthsSection[1]);
  }

  // Extract weaknesses
  const weaknessesSection = summaryText.match(/(?:weaknesses?|areas?\s*for\s*improvement):?\s*([\s\S]*?)(?=(?:improvements?|strengths?|hiring|conclusion|\n\s*##|\n\s*\*\*[^*]*\*\*)|$)/i);
  if (weaknessesSection) {
    result.weaknesses = extractBulletPoints(weaknessesSection[1]);
  }

  // Extract improvements
  const improvementsSection = summaryText.match(/(?:improvements?|suggestions?|recommendations?):?\s*([\s\S]*?)(?=(?:strengths?|weaknesses?|hiring|conclusion|\n\s*##|\n\s*\*\*[^*]*\*\*)|$)/i);
  if (improvementsSection) {
    result.improvements = extractBulletPoints(improvementsSection[1]);
  }

  // Extract hiring potential
  const hiringSection = summaryText.match(/hiring\s*potential[\s\S]*?(?=(?:\n\s*##|conclusion)|$)/i);
  if (hiringSection) {
    const hiringText = hiringSection[0];
    
    // Extract level/rating
    const levelPatterns = [
      /\*\*([^*]+)\*\*/,
      /(high|medium|low|excellent|good|fair|poor)\s*potential/i,
      /potential:\s*([^\n.]+)/i
    ];
    
    for (const pattern of levelPatterns) {
      const match = hiringText.match(pattern);
      if (match) {
        result.hiringPotential.level = match[1].trim();
        break;
      }
    }

    // Extract details (first paragraph after level)
    const paragraphs = hiringText.split('\n\n').filter(p => p.trim());
    if (paragraphs.length > 1) {
      result.hiringPotential.details = paragraphs[1].replace(/^\*\*[^*]+\*\*\s*/, '').trim();
    }

    // Extract watch areas
    const watchAreas = extractBulletPoints(hiringText, /(?:watch|concern|monitor|attention)/i);
    if (watchAreas.length > 0) {
      result.hiringPotential.watchAreas = watchAreas;
    }
  }

  // Extract conclusion
  const conclusionSection = summaryText.match(/conclusion:?\s*([\s\S]*?)$/i);
  if (conclusionSection) {
    result.conclusion = conclusionSection[1].trim();
  }

  return result;
}

// Helper function to extract rationale (scoring breakdown)
function extractRationale(text) {
  if (!text) return [];
  
  const rationale = [];
  
  // Look for lines with scoring patterns like "Architecture: 5/10 (reason)"
  const scoreLines = text.split('\n').filter(line => {
    return line.includes('/10') && (
      line.includes('Architecture') || 
      line.includes('Complexity') || 
      line.includes('Technology') || 
      line.includes('Code Quality') || 
      line.includes('Innovation') ||
      line.includes('Technical')
    );
  });
  
  for (const line of scoreLines) {
    const cleaned = line.trim().replace(/^[-•*]\s*/, '');
    if (cleaned.length > 10) {
      rationale.push(cleaned);
    }
  }
  
  // If no score lines found, fall back to bullet points
  if (rationale.length === 0) {
    return extractBulletPoints(text);
  }
  
  return rationale;
}

// Helper function to extract bullet points from text
function extractBulletPoints(text, contextFilter = null) {
  if (!text) return [];
  
  const bullets = [];
  
  // Look for various bullet point patterns
  const patterns = [
    /[-•*]\s+([^\n]+)/g,
    /^\s*\d+\.\s+([^\n]+)/gm,
    /^\s*[a-zA-Z]\.\s+([^\n]+)/gm
  ];

  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      const bullet = match[1].trim();
      if (bullet && bullet.length > 10) { // Filter out very short items
        // If context filter is provided, only include bullets that match
        if (!contextFilter || contextFilter.test(text.substring(0, match.index + 100))) {
          bullets.push(bullet);
        } else if (!contextFilter) {
          bullets.push(bullet);
        }
      }
    }
  }

  // If no bullets found, try to split by newlines and filter meaningful sentences
  if (bullets.length === 0) {
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 20 && !line.match(/^(score|technologies|strengths|weaknesses|improvements|hiring|conclusion)/i));
    
    return lines.slice(0, 5); // Limit to 5 items
  }

  return [...new Set(bullets)]; // Remove duplicates
}

// COMPLETELY REWRITTEN: Simplified and more reliable technology extraction
function extractTechnologies(summaryText) {
  const technologies = [];
  
  // First, try to find the dedicated technologies section
  const techSectionPatterns = [
    /##\s*technologies?\s*detected[:\s]*([\s\S]*?)(?=##|\n\s*\*\*|\n\s*###|$)/i,
    /technologies?\s*detected[:\s]*([\s\S]*?)(?=##|\*\*[A-Z][^*]*:|###|strengths|weaknesses|$)/i,
    /##\s*technologies?\s*used[:\s]*([\s\S]*?)(?=##|\n\s*\*\*|\n\s*###|$)/i,
    /tech\s*stack[:\s]*([\s\S]*?)(?=##|\*\*[A-Z][^*]*:|###|strengths|weaknesses|$)/i
  ];

  let techSection = null;
  for (const pattern of techSectionPatterns) {
    const match = summaryText.match(pattern);
    if (match && match[1]) {
      techSection = match[1].trim();
      break;
    }
  }

  if (techSection) {
    // Extract bullet points from the technologies section
    const bullets = extractTechnologiesFromSection(techSection);
    if (bullets.length > 0) {
      technologies.push(...bullets);
    }
  }

  // If no dedicated section found, look for inline mentions
  if (technologies.length === 0) {
    console.log('No tech section found, looking for inline mentions...');
    technologies.push(...findInlineTechnologies(summaryText));
  }

  // Clean up and deduplicate
  const cleanedTechnologies = technologies
    .map(tech => tech.replace(/[*_`]/g, '').trim()) // Remove markdown formatting
    .filter(tech => tech.length > 1 && tech.length < 50) // Reasonable length
    .filter(tech => !tech.includes('/10')) // Remove scoring lines
    .filter(tech => !tech.toLowerCase().includes('quality'))
    .filter(tech => !tech.toLowerCase().includes('implementation'))
    .filter(tech => !tech.toLowerCase().includes('structure'));

  return [...new Set(cleanedTechnologies)].slice(0, 10);
}

function extractTechnologiesFromSection(sectionText) {
  const technologies = [];
  
  // Look for bullet points first
  const bulletPatterns = [
    /^[-•*]\s*([^\n]+)/gm,
    /^\s*\d+\.\s*([^\n]+)/gm
  ];

  for (const pattern of bulletPatterns) {
    const matches = [...sectionText.matchAll(pattern)];
    for (const match of matches) {
      const tech = match[1].trim();
      if (tech && tech.length > 1 && tech.length < 50) {
        technologies.push(tech);
      }
    }
  }

  // If no bullets, try line by line
  if (technologies.length === 0) {
    const lines = sectionText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.length < 50)
      .filter(line => !line.includes(':') || line.split(':').length === 2);
    
    technologies.push(...lines);
  }

  return technologies;
}

function findInlineTechnologies(summaryText) {
  const commonTechnologies = [
    // Frontend
    'React', 'Vue.js', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js',
    'JavaScript', 'TypeScript', 'HTML', 'CSS', 'SCSS', 'Sass',
    'TailwindCSS', 'Tailwind CSS', 'Bootstrap', 'Material-UI', 'Chakra UI',
    
    // Backend
    'Node.js', 'Express.js', 'Express', 'Fastify', 'Koa.js',
    'Python', 'Django', 'Flask', 'FastAPI',
    'Java', 'Spring Boot', 'Spring',
    'PHP', 'Laravel', 'Symfony',
    'Ruby', 'Ruby on Rails', 'Rails',
    'Go', 'Gin', 'Echo',
    'Rust', 'Actix', 'Rocket',
    'C#', '.NET', 'ASP.NET',
    
    // Databases
    'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis',
    'Firebase', 'Supabase', 'Prisma', 'Mongoose',
    
    // Tools & Others
    'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
    'GraphQL', 'REST API', 'API', 'JSON',
    'Git', 'GitHub', 'GitLab',
    'Webpack', 'Vite', 'Parcel', 'Rollup',
    'Jest', 'Cypress', 'Testing Library',
    'ESLint', 'Prettier'
  ];

  const foundTechnologies = [];
  const textLower = summaryText.toLowerCase();

  for (const tech of commonTechnologies) {
    const techLower = tech.toLowerCase();
    if (textLower.includes(techLower)) {
      // Make sure it's a whole word match or followed by common suffixes
      const regex = new RegExp(`\\b${techLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\b|\\.|js|css)`, 'i');
      if (regex.test(summaryText)) {
        foundTechnologies.push(tech);
      }
    }
  }

  return foundTechnologies;
}