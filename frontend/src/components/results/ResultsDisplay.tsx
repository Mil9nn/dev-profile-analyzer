import type { AnalyzeResponse } from "../../types"
import { ScoreSection } from "./sections/ScoreSection"
import { TechnologiesSection } from "./sections/TechnologiesSection"
import { StrengthsSection } from "./sections/StrengthsSection"
import { WeaknessesSection } from "./sections/WeaknessesSection"
import { ImprovementsSection } from "./sections/ImprovementsSection"
import { HiringPotential } from "./sections/HiringPotential"
import { ConclusionSection } from "./sections/ConclusionSection"

interface ResultsDisplayProps {
    result: AnalyzeResponse;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
    const { aiFeedback } = result;

    return (
        <div className="h-[calc(100vh-173px)] overflow-y-auto p-6 border rounded-md text-black bg-zinc-800 space-y-6">
            <ScoreSection score={aiFeedback.score} rationale={aiFeedback.rationale} />
            <TechnologiesSection technologies={aiFeedback.technologies} />
            <StrengthsSection strengths={aiFeedback.strengths} />
            <WeaknessesSection weaknesses={aiFeedback.weaknesses} />
            <ImprovementsSection improvements={aiFeedback.improvements} />
            <HiringPotential hiringPotential={aiFeedback.hiringPotential} />
            <ConclusionSection conclusion={aiFeedback.conclusion} />
        </div>
    );
}