import { useAppStore } from '@/store/useAnalysisStore';
import InputForm from '../components/InputForm';
import { EmptyState } from '@/components/EmptyState';

const HomePage = () => {
  const {
    resumeData, setResumeData,
    loading, setLoading,
    error, setError,
    progress, setProgress,
    isPrintMode, setIsPrintMode
  } = useAppStore();

  const handleAnalyze = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      // You can include your actual analysis logic here
      const fakeResumeData = {
        name: "John Doe",
        skills: ["React", "Node.js"],
        github: formData.username,
        linkedin: formData.linkedinUrl
      };

      setResumeData(fakeResumeData);
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
      {!resumeData && !loading && (
        <InputForm onSubmit={handleAnalyze} loading={loading} />
      )}

      <EmptyState />
    </div>
  );
};

export default HomePage;
