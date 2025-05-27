import prepareProjectSummary from './prepareProjectSummary.js';

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

  // Split by the main section headings like ### 1., ### 2., etc.
  const sections = summaryText.split(/###\s*\d+\.\s*/).filter(Boolean);

  for (const section of sections) {
    if (section.startsWith("Overall Score")) {
      // Extract score number
      const scoreMatch = section.match(/Overall Score:\s*\*\*(\d+(\.\d+)?)\s*\/\s*10\*\*/);
      if (scoreMatch) {
        result.score = parseFloat(scoreMatch[1]);
      }

      // Extract rationale bullets (lines starting with -)
      const rationaleMatches = [...section.matchAll(/-\s([^-\n]+)/g)];
      result.rationale = rationaleMatches.map(m => m[1].trim());

    } else if (section.startsWith("Detected Technologies")) {
      // Extract tech list (lines starting with -)
      const techMatches = [...section.matchAll(/-\s\*\*?([^*\n]+)\*\*?/g)];
      result.technologies = techMatches.length
        ? techMatches.map(m => m[1].trim())
        : [...section.matchAll(/-\s([^-\n]+)/g)].map(m => m[1].trim());

    } else if (section.startsWith("Strengths, Weaknesses")) {
      // Extract Strengths, Weaknesses, Improvements blocks using regex
      const strengthsMatch = section.match(/Strengths:\s*((?:-.*\n?)+)/);
      if (strengthsMatch) {
        result.strengths = strengthsMatch[1].split('\n').map(line => line.replace(/^- /, '').trim()).filter(Boolean);
      }
      const weaknessesMatch = section.match(/Weaknesses:\s*((?:-.*\n?)+)/);
      if (weaknessesMatch) {
        result.weaknesses = weaknessesMatch[1].split('\n').map(line => line.replace(/^- /, '').trim()).filter(Boolean);
      }
      const improvementsMatch = section.match(/Improvements:\s*((?:-.*\n?)+)/);
      if (improvementsMatch) {
        result.improvements = improvementsMatch[1].split('\n').map(line => line.replace(/^- /, '').trim()).filter(Boolean);
      }

    } else if (section.startsWith("Hiring Potential")) {
      // Extract hiring potential details
      const levelMatch = section.match(/^\*\*(.+?)\*\*/);
      if (levelMatch) {
        result.hiringPotential.level = levelMatch[1].trim();
      }

      const detailsMatch = section.match(/Hiring Potential of the Developer[\s\S]*?\*\*High potential:\*\*\s*([^*]+)\*\*/);
      if (!detailsMatch) {
        // fallback if above fails, extract the paragraph after level line
        const paragraphs = section.split('\n\n');
        if (paragraphs.length > 1) {
          result.hiringPotential.details = paragraphs[1].trim();
        }
      } else {
        result.hiringPotential.details = detailsMatch[1].trim();
      }

      // Extract watch areas list
      const watchAreasMatch = section.match(/Areas to watch:\s*((?:-.*\n?)+)/);
      if (watchAreasMatch) {
        result.hiringPotential.watchAreas = watchAreasMatch[1].split('\n').map(line => line.replace(/^- /, '').trim()).filter(Boolean);
      }

    } else if (section.startsWith("Conclusion")) {
      // Extract conclusion text (last section)
      result.conclusion = section.replace(/Conclusion:\s*/, '').trim();
    }
  }

  return result;
}