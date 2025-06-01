export function createPrompt(stats, score) {
    return `Analyze this GitHub repository and return JSON:

{
  "score": ${score},
  "rationale": ["reason1", "reason2"],
  "technologies": ${JSON.stringify(Array.from(stats.technologies))},
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvements": ["improvement1", "improvement2"],
  "hiringPotential": {
    "level": "Junior/Mid/Senior/Entry",
    "details": "explanation",
    "watchAreas": ["area1", "area2"]
  },
  "conclusion": "summary"
}

Metrics: ${stats.totalFiles} files, ${stats.components} components, ${stats.apiEndpoints} APIs, ${Array.from(stats.technologies).join(', ')}`;
}