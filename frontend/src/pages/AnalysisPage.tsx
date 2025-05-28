import Navbar from '@/components/Navbar';
import { ProfileAnalysisForm } from '@/components/ProfileAnalysisForm';
import { EmptyState } from '@/components/states/EmptyState';
import { useAnalysisStore } from '@/hooks/useAnalysisStore';
import { LoadingState } from '@/components/states/LoadingState';
import { ResultsDisplay } from '@/components/results/ResultsDisplay';
import { ErrorMessage } from '@/components/states/ErrorMessage';

const AnalysisPage = () => {
    const { loading, result } = useAnalysisStore();
    return (
        <div className="min-h-screen bg-zinc-900 text-white">
            <Navbar />
            {/* Main Component */}
            <div className="flex flex-col lg:flex-row gap-8 px-6 py-12">
                {/* Form */}
                <div className="lg:w-1/2 w-full">
                    <ProfileAnalysisForm />
                </div>

                {/* EmptyState */}
                <div className="w-full h-full rounded-md flex justify-center items-center">
                    {loading ? <LoadingState /> : result?.aiFeedback ? <ResultsDisplay result={result} /> : <EmptyState />}
                </div>
            </div>
        </div>
    );
};

export default AnalysisPage;
