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

  // Extract rationale - look for bullets after score section
  const scoreSection = summaryText.match(/(?:score|rating)[\s\S]*?(?=(?:\d+\.|technologies|detected|strengths|weaknesses|hiring|conclusion)|$)/i);
  if (scoreSection) {
    const rationale = extractBulletPoints(scoreSection[0]);
    if (rationale.length > 0) {
      result.rationale = rationale;
    }
  }

  // Extract technologies - more flexible patterns
  const techSection = summaryText.match(/(?:technologies|tech\s*stack|frameworks|libraries)[\s\S]*?(?=(?:\d+\.|strengths|weaknesses|hiring|conclusion)|$)/i);
  if (techSection) {
    result.technologies = extractTechnologies(techSection[0]);
  }

  // Extract strengths
  const strengthsSection = summaryText.match(/strengths?:?\s*([\s\S]*?)(?=(?:weaknesses?|improvements?|hiring|conclusion|\d+\.)|$)/i);
  if (strengthsSection) {
    result.strengths = extractBulletPoints(strengthsSection[1]);
  }

  // Extract weaknesses
  const weaknessesSection = summaryText.match(/(?:weaknesses?|areas?\s*for\s*improvement):?\s*([\s\S]*?)(?=(?:improvements?|strengths?|hiring|conclusion|\d+\.)|$)/i);
  if (weaknessesSection) {
    result.weaknesses = extractBulletPoints(weaknessesSection[1]);
  }

  // Extract improvements
  const improvementsSection = summaryText.match(/(?:improvements?|suggestions?|recommendations?):?\s*([\s\S]*?)(?=(?:strengths?|weaknesses?|hiring|conclusion|\d+\.)|$)/i);
  if (improvementsSection) {
    result.improvements = extractBulletPoints(improvementsSection[1]);
  }

  // Extract hiring potential
  const hiringSection = summaryText.match(/hiring\s*potential[\s\S]*?(?=(?:\d+\.|conclusion)|$)/i);
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

// Helper function to extract technologies
function extractTechnologies(text) {
  const technologies = [];
  
  // Look for bullet points first
  const bullets = extractBulletPoints(text);
  if (bullets.length > 0) {
    return bullets.map(bullet => bullet.replace(/\*\*([^*]+)\*\*/g, '$1').trim());
  }

  // Look for comma-separated technologies
  const techList = text.match(/(?:technologies|frameworks|libraries)[:\s]+(.*?)(?:\n|$)/i);
  if (techList) {
    const items = techList[1].split(/[,;]/)
      .map(item => item.trim().replace(/\*\*([^*]+)\*\*/g, '$1'))
      .filter(item => item.length > 0);
    technologies.push(...items);
  }

  // Look for common tech keywords if nothing else worked
  if (technologies.length === 0) {
    const commonTech = [
      'React', 'Vue', 'Angular', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'MySQL',
      'TypeScript', 'JavaScript', 'Python', 'Java', 'PHP', 'Ruby', 'Go', 'Rust',
      'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Redis', 'GraphQL', 'REST API',
      'Next.js', 'Nuxt.js', 'Svelte', 'TailwindCSS', 'Bootstrap', 'SASS', 'SCSS'
    ];

    for (const tech of commonTech) {
      if (text.toLowerCase().includes(tech.toLowerCase())) {
        technologies.push(tech);
      }
    }
  }

  return [...new Set(technologies)]; // Remove duplicates
}
