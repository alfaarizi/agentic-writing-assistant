import { useState, useEffect } from 'react';
import { checkHealth, saveProfile, getProfile, generateWriting, type UserProfile, type WritingRequest, type WritingResponse } from './lib/api';

function App() {
  const [apiHealthy, setApiHealthy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [result, setResult] = useState<WritingResponse | null>(null);
  
  // Form state
  const [userId, setUserId] = useState('user-1');
  const [name, setName] = useState('');
  const [background, setBackground] = useState('');
  const [skills, setSkills] = useState('');
  const [tone, setTone] = useState('professional');
  const [style, setStyle] = useState('concise');
  
  const [writingType, setWritingType] = useState<'cover_letter' | 'motivational_letter' | 'social_response' | 'email'>('cover_letter');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [programName, setProgramName] = useState('');
  const [maxWords, setMaxWords] = useState(500);
  const [qualityThreshold, setQualityThreshold] = useState(85);
  const [additionalInfo, setAdditionalInfo] = useState('');

  useEffect(() => {
    checkHealth().then(setApiHealthy);
    const interval = setInterval(() => checkHealth().then(setApiHealthy), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (userId) {
      getProfile(userId).then((p) => {
        if (p) {
          setProfile(p);
          setName(p.personal_info.name);
          setBackground(p.personal_info.background || '');
          setSkills(p.personal_info.skills.join(', '));
          setTone(p.writing_preferences.tone);
          setStyle(p.writing_preferences.style);
        }
      });
    }
  }, [userId]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const saved = await saveProfile({
        user_id: userId,
        personal_info: {
          name,
          background,
          education: [],
          experience: [],
          achievements: [],
          skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        },
        writing_preferences: {
          tone,
          style,
          common_phrases: [],
        },
      });
      setProfile(saved);
      alert('Profile saved successfully!');
    } catch (error) {
      alert(`Failed to save profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!profile) {
      alert('Please save your profile first');
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      let context: Record<string, any> = {};
      
      if (writingType === 'cover_letter') {
        context = { job_title: jobTitle, company };
      } else if (writingType === 'motivational_letter') {
        context = { program_name: programName };
      } else if (writingType === 'social_response') {
        context = { platform: 'twitter', original_post: additionalInfo };
      } else {
        context = { recipient: '', subject: '' };
      }

      const request: WritingRequest = {
        user_id: userId,
        type: writingType,
        context,
        requirements: {
          max_words: maxWords,
          quality_threshold: qualityThreshold,
          mode: 'balanced',
        },
        additional_info: additionalInfo || undefined,
      };

      const response = await generateWriting(request);
      setResult(response);
    } catch (error) {
      alert(`Failed to generate writing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">✍️ Writing Assistant</h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${apiHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {apiHealthy ? 'API Connected' : 'API Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Profile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">User Profile</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
                  <input
                    type="text"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    placeholder="e.g., Software Engineer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g., Python, FastAPI, AI"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                    <option value="friendly">Friendly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="concise">Concise</option>
                    <option value="detailed">Detailed</option>
                    <option value="balanced">Balanced</option>
                  </select>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Writing Request Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Writing</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Writing Type</label>
                  <select
                    value={writingType}
                    onChange={(e) => setWritingType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cover_letter">Cover Letter</option>
                    <option value="motivational_letter">Motivational Letter</option>
                    <option value="social_response">Social Response</option>
                    <option value="email">Email</option>
                  </select>
                </div>

                {writingType === 'cover_letter' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g., Senior Software Engineer"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g., Google"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                {writingType === 'motivational_letter' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program Name</label>
                    <input
                      type="text"
                      value={programName}
                      onChange={(e) => setProgramName(e.target.value)}
                      placeholder="e.g., MIT Masters Program"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Words</label>
                    <input
                      type="number"
                      value={maxWords}
                      onChange={(e) => setMaxWords(Number(e.target.value))}
                      min={100}
                      max={2000}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quality Threshold</label>
                    <input
                      type="number"
                      value={qualityThreshold}
                      onChange={(e) => setQualityThreshold(Number(e.target.value))}
                      min={0}
                      max={100}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information (optional)</label>
                  <textarea
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading || !apiHealthy}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Generating...' : 'Generate Writing'}
                </button>
              </div>
            </div>

            {/* Results */}
            {result && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Generated Content</h2>
                
                {result.content && (
                  <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{result.content}</pre>
                  </div>
                )}

                {result.assessment && (
                  <>
                    <div>
                      <h3 className="text-md font-semibold text-gray-900 mb-3">Quality Metrics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-md p-3">
                          <div className="text-sm text-gray-600">Overall Score</div>
                          <div className="text-2xl font-bold text-blue-600">{result.assessment.quality_metrics.overall_score.toFixed(1)}</div>
                        </div>
                        <div className="bg-gray-50 rounded-md p-3">
                          <div className="text-sm text-gray-600">Coherence</div>
                          <div className="text-xl font-semibold text-gray-900">{result.assessment.quality_metrics.coherence.toFixed(1)}</div>
                        </div>
                        <div className="bg-gray-50 rounded-md p-3">
                          <div className="text-sm text-gray-600">Grammar</div>
                          <div className="text-xl font-semibold text-gray-900">{result.assessment.quality_metrics.grammar_accuracy.toFixed(1)}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-md font-semibold text-gray-900 mb-3">Text Statistics</h3>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{result.assessment.text_stats.word_count}</div>
                          <div className="text-sm text-gray-600">Words</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{result.assessment.text_stats.character_count}</div>
                          <div className="text-sm text-gray-600">Characters</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{result.assessment.text_stats.paragraph_count}</div>
                          <div className="text-sm text-gray-600">Paragraphs</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{result.assessment.text_stats.estimated_pages.toFixed(2)}</div>
                          <div className="text-sm text-gray-600">Pages</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {result.suggestions && result.suggestions.length > 0 && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-3">Suggestions</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {result.suggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-sm text-red-800">{result.error}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
