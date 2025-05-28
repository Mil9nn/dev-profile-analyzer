export type AnalyzeResponse = {
    success: boolean;
    aiFeedback: {
        score: number | null;
        rationale: string[];
        technologies: string[];
        strengths: string[];
        weaknesses: string[];
        improvements: string[];
        hiringPotential: {
            level: string;
            details: string;
            watchAreas: string[];
        };
        conclusion: string;
    };
}

export type FormData = {
    githubProfile: string;
    linkedinProfile: string;
    repositories: string[];
}