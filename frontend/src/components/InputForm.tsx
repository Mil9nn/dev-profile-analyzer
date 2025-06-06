import { useState } from "react";
import { Loader2 } from 'lucide-react'; // Make sure this import exists

const InputForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    username: '',
    linkedinUrl: '',
    repositories: [
      '',
      '',
      '',
    ]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedRepos = formData.repositories.filter(repo => repo.trim() !== '');
    if (cleanedRepos.length === 0) {
      alert('Please add at least one repository');
      return;
    }
    onSubmit({
      ...formData,
      repositories: cleanedRepos
    });
  };

  const updateRepository = (index, value) => {
    setFormData(prev => ({
      ...prev,
      repositories: prev.repositories.map((repo, i) => i === index ? value : repo)
    }));
  };

  return (
    <div className="bg-zinc-900 text-white shadow-xl rounded-sm max-w-2xl w-full mx-auto p-8 border border-zinc-700">
      <h2 className="text-3xl font-bold text-zinc-100 mb-6 text-center">Generate Your Resume</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            LinkedIn URL (Optional)
          </label>
          <input
            name="url"
            type="url"
            value={formData.linkedinUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            GitHub Repository URLs (your best 3)
          </label>
          {formData.repositories.map((repo, index) => (
            <input
              name="url"
              key={index}
              type="url"
              value={repo}
              onChange={(e) => updateRepository(index, e.target.value)}
              className="w-full mb-2 px-4 py-2 bg-zinc-800 border border-zinc-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://github.com/username/repo"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 py-2 px-4 rounded-md cursor-pointer font-semibold hover:bg-purple-700 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (<Loader2 className="w-4 h-4 animate-spin" />) : ('Analyze')}
        </button>
      </form>
    </div>

  );
};

export default InputForm;
