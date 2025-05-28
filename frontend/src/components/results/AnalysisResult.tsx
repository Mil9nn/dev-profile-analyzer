import { ScoreSection } from "./sections/ScoreSection";
import { TechnologiesSection } from "./sections/TechnologiesSection";
import { StrengthsSection } from "./sections/StrengthsSection";
import { WeaknessesSection } from "./sections/WeaknessesSection";
import { ImprovementsSection } from "./sections/ImprovementsSection";
import { HiringPotential } from "./sections/HiringPotential";
import { ConclusionSection } from "./sections/ConclusionSection";

type AnalyzeResponse = {
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

interface AnalysisResultsProps {
  result: AnalyzeResponse;
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
    const { aiFeedback } = result;

    // Helper function to safely check if array exists and has content
    const hasContent = (arr: any): arr is string[] => {
        return Array.isArray(arr) && arr.length > 0;
    };

    return (
        <div className="space-y-6">
            {/* Score Section */}
            {aiFeedback.score !== null && aiFeedback.score !== undefined && (
                <ScoreSection score={aiFeedback.score} rationale={aiFeedback.rationale} />
            )}

            {/* Technologies Section */}
            {hasContent(aiFeedback.technologies) && (
                <TechnologiesSection technologies={aiFeedback.technologies} />
            )}

            {/* Strengths Section */}
            {hasContent(aiFeedback.strengths) && (
                <StrengthsSection strengths={aiFeedback.strengths} />
            )}

            {/* Weaknesses Section */}
            {hasContent(aiFeedback.weaknesses) && (
                <WeaknessesSection weaknesses={aiFeedback.weaknesses} />
            )}

            {/* Improvements Section */}
            {hasContent(aiFeedback.improvements) && (
                <ImprovementsSection improvements={aiFeedback.improvements} />
            )}

            {/* Hiring Potential Section */}
            {aiFeedback.hiringPotential?.level && (
                <HiringPotential hiringPotential={aiFeedback.hiringPotential} />
            )}

            {/* Conclusion Section */}
            {aiFeedback.conclusion && (
                <ConclusionSection conclusion={aiFeedback.conclusion} />
            )}
        </div>
    );
}