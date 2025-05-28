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

  // Extract technologies - simplified and more flexible approach
  const techSection = summaryText.match(/(?:technologies|tech\s*stack|frameworks|libraries)\s*(?:detected|used)?:?\s*([\s\S]*?)(?=(?:\n\s*#+|\n\s*\*\*[A-Z][^*]*:|\n\s*##|strengths|weaknesses|improvements|hiring|conclusion)|$)/i);
  if (techSection) {
    result.technologies = extractTechnologies(techSection[1]);
  }
  
  // Fallback: look for technologies in bullet points anywhere in the response
  if (result.technologies.length === 0) {
    const allBullets = extractBulletPoints(summaryText);
    const techBullets = allBullets.filter(bullet => {
      const commonTechKeywords = ['react', 'node', 'express', 'javascript', 'typescript', 'html', 'css', 'tailwind', 'mongodb', 'api', 'json', 'framework', 'library'];
      return commonTechKeywords.some(keyword => bullet.toLowerCase().includes(keyword)) && !bullet.includes('/10');
    });
    result.technologies = techBullets.slice(0, 10); // Limit to reasonable number
  }

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

// Helper function to extract technologies - SIMPLIFIED VERSION
function extractTechnologies(text) {
  if (!text) return [];
  
  const technologies = [];
  
  // Clean the text - remove obvious non-tech content
  const cleanText = text.replace(/\/10.*$/gm, '').replace(/\(.*?\)/g, '');
  
  // Look for bullet points first
  const bullets = extractBulletPoints(cleanText);
  if (bullets.length > 0) {
    // Take bullets that look like technologies (short, single words/phrases)
    const techBullets = bullets.filter(bullet => {
      return bullet.length < 50 && 
             !bullet.toLowerCase().includes('quality') &&
             !bullet.toLowerCase().includes('readable') &&
             !bullet.toLowerCase().includes('lacks') &&
             !bullet.toLowerCase().includes('implementation');
    });
    
    if (techBullets.length > 0) {
      return techBullets.map(bullet => bullet.replace(/\*\*([^*]+)\*\*/g, '$1').trim());
    }
  }

  // Look for inline technologies (comma or newline separated)
  const lines = cleanText.split('\n').filter(line => line.trim().length > 0);
  for (const line of lines) {
    if (line.includes(',')) {
      const items = line.split(',').map(item => item.trim().replace(/^[-•*]\s*/, ''));
      technologies.push(...items.filter(item => item.length > 0 && item.length < 30));
    } else {
      const cleaned = line.trim().replace(/^[-•*]\s*/, '');
      if (cleaned.length > 0 && cleaned.length < 30) {
        technologies.push(cleaned);
      }
    }
  }

  // Fallback: Look for common tech keywords
  if (technologies.length === 0) {
    const commonTech = [
      'React', 'Vue', 'Angular', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'MySQL',
      'TypeScript', 'JavaScript', 'Python', 'Java', 'PHP', 'Ruby', 'Go', 'Rust',
      'HTML', 'CSS', 'TailwindCSS', 'Tailwind CSS', 'Bootstrap', 'SASS', 'SCSS',
      'REST API', 'GraphQL', 'JSON', 'Git'
    ];

    const textLower = text.toLowerCase();
    for (const tech of commonTech) {
      if (textLower.includes(tech.toLowerCase())) {
        technologies.push(tech);
      }
    }
  }

  return [...new Set(technologies)].slice(0, 10); // Remove duplicates and limit
}