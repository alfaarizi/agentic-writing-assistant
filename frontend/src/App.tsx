import { useState, useEffect } from 'react';
import { checkHealth, generateWriting, type UserProfile, type WritingRequest, type WritingResponse } from './lib/api';
import { ProfileForm } from './components/ProfileForm';
import { WritingForm } from './components/WritingForm';
import { WritingResult } from './components/WritingResult';
import { StatusMonitor, type StatusUpdate } from './components/StatusMonitor';
import { Header } from './components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function App() {
  const [apiHealthy, setApiHealthy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [result, setResult] = useState<WritingResponse | null>(null);
  const [userId, setUserId] = useState('user-1');
  const [status, setStatus] = useState<StatusUpdate | null>(null);
  const [generationHistory, setGenerationHistory] = useState<WritingResponse[]>([]);
  const [activeTab, setActiveTab] = useState('generate');

  // Load persisted data from localStorage on mount
  useEffect(() => {
    const savedResult = localStorage.getItem('awa_result');
    const savedHistory = localStorage.getItem('awa_history');
    const savedTab = localStorage.getItem('awa_tab');
    
    if (savedResult) {
      try {
        setResult(JSON.parse(savedResult));
      } catch (error) {
        console.error('Failed to load saved result:', error);
      }
    }
    
    if (savedHistory) {
      try {
        setGenerationHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load saved history:', error);
      }
    }
    
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  // Health check
  useEffect(() => {
    checkHealth().then(setApiHealthy);
    const interval = setInterval(() => checkHealth().then(setApiHealthy), 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = (stage: StatusUpdate['stage'], progress: number, message: string, details?: string) => {
    setStatus({
      stage,
      progress,
      message,
      details,
      timestamp: new Date().toISOString(),
    });
  };

  const handleGenerate = async (request: WritingRequest) => {
    if (!profile) {
      alert('Please save your profile first');
      return;
    }

    setLoading(true);
    setStatus(null);
    setResult(null);

    try {
      // Simulate real-time status updates
      const stages: Array<{ stage: StatusUpdate['stage']; message: string; duration: number }> = [
        { stage: 'orchestrating', message: 'Initializing generation workflow...', duration: 800 },
        { stage: 'researching', message: 'Gathering relevant information and context...', duration: 1500 },
        { stage: 'writing', message: 'Composing your content...', duration: 2000 },
        { stage: 'assessing', message: 'Evaluating quality metrics...', duration: 1000 },
        { stage: 'refining', message: 'Optimizing and refining content...', duration: 1200 },
        { stage: 'personalizing', message: 'Adding personal touches...', duration: 800 },
      ];

      let totalTime = 0;
      for (let i = 0; i < stages.length; i++) {
        const stageData = stages[i];
        const nextStageTotalTime = totalTime + stageData.duration;
        const baseProgress = (i / stages.length) * 100;
        const nextProgress = ((i + 1) / stages.length) * 100;

        updateStatus(stageData.stage, baseProgress, stageData.message);

        await new Promise(resolve => setTimeout(resolve, stageData.duration / 2));
        updateStatus(stageData.stage, (baseProgress + nextProgress) / 2, stageData.message, `Processing...`);

        await new Promise(resolve => setTimeout(resolve, stageData.duration / 2));
        totalTime = nextStageTotalTime;
      }

      // Generate the actual content
      const response = await generateWriting(request);
      setResult(response);
      const newHistory = [response, ...generationHistory.slice(0, 4)];
      setGenerationHistory(newHistory);

      // Persist to localStorage
      localStorage.setItem('awa_result', JSON.stringify(response));
      localStorage.setItem('awa_history', JSON.stringify(newHistory));

      updateStatus('complete', 100, 'Writing generation complete!');
      setTimeout(() => setStatus(null), 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateStatus('error', 0, 'Generation failed', errorMessage);
      alert(`Failed to generate writing: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto px-12 md:px-20 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={(tab) => {
            setActiveTab(tab);
            localStorage.setItem('awa_tab', tab);
          }} className="space-y-3">
            <TabsList className="grid w-auto grid-cols-3 h-8 gap-1 bg-transparent p-0">
              <TabsTrigger 
                value="profile" 
                className="text-xs h-8 px-3 border border-border rounded data-[state=active]:border-primary data-[state=active]:bg-primary/5 bg-background"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="generate" 
                className="text-xs h-8 px-3 border border-border rounded data-[state=active]:border-primary data-[state=active]:bg-primary/5 bg-background"
              >
                Generate
              </TabsTrigger>
              {result && (
                <TabsTrigger 
                  value="result" 
                  className="text-xs h-8 px-3 border border-border rounded data-[state=active]:border-primary data-[state=active]:bg-primary/5 bg-background"
                >
                  Result
                </TabsTrigger>
              )}
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-3 focus-visible:outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2">
                  <ProfileForm 
                    userId={userId} 
                    onUserIdChange={setUserId}
                    onProfileSaved={setProfile} 
                  />
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-3">
                  <Card>
                    <CardHeader className="pb-1">
                      <CardTitle className="text-xs font-semibold uppercase">Profile Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="py-3">
                      {profile ? (
                        <div className="space-y-2 text-xs">
                          <div>
                            <p className="text-muted-foreground text-xs">User ID</p>
                            <p className="font-mono text-xs font-semibold mt-0.5">{userId}</p>
                          </div>
                          <div className="border-t border-border pt-2">
                            <p className="text-muted-foreground text-xs">Name</p>
                            <p className="font-semibold text-xs mt-0.5">{profile.personal_info.name}</p>
                          </div>
                          <div className="border-t border-border pt-2">
                            <p className="text-muted-foreground text-xs mb-1.5">Preferences</p>
                            <div className="flex gap-1.5 flex-wrap">
                              <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded text-center">{profile.writing_preferences.tone}</span>
                              <span className="px-2 py-1 bg-secondary/10 text-secondary-foreground text-xs font-semibold rounded text-center">{profile.writing_preferences.style}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-4">Save your profile to get started</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-1">
                      <CardTitle className="text-xs font-semibold uppercase">Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="py-3">
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Total Generated</span>
                          <span className="font-bold text-primary">{generationHistory.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Successful</span>
                          <span className="font-bold text-green-600">{generationHistory.filter(r => r.status === 'completed').length}</span>
                        </div>
                        <div className="border-t border-border pt-1.5 flex justify-between items-center">
                          <span className="text-muted-foreground">API Status</span>
                          <span className={`font-bold ${apiHealthy ? 'text-green-600' : 'text-red-600'}`}>
                            {apiHealthy ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Generate Tab */}
            <TabsContent value="generate" className="space-y-3 focus-visible:outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Form - takes 2/3 on desktop, full on mobile */}
                <div className="lg:col-span-2 space-y-3">
                  <WritingForm
                    userId={userId}
                    onGenerate={handleGenerate}
                    loading={loading}
                    disabled={!apiHealthy || !profile}
                  />

                  {/* Status Monitor - positioned below form */}
                  {(loading || status) && (
                    <StatusMonitor status={status} isActive={loading} />
                  )}
                </div>

                {/* Sidebar - Current Generation Status */}
                <div className="space-y-3">
                  <Card className="h-fit">
                    <CardHeader className="pb-1">
                      <CardTitle className="text-xs font-semibold uppercase">Generation Status</CardTitle>
                    </CardHeader>
                    <CardContent className="py-3">
                      {loading ? (
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                            <span className="text-muted-foreground">In Progress</span>
                          </div>
                          <p className="text-xs text-foreground/80 font-semibold">{status?.message}</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                            <span className="text-muted-foreground">Ready</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Click Generate to start</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {result && (
                    <Card>
                      <CardHeader className="pb-1">
                        <CardTitle className="text-xs font-semibold uppercase">Latest Result</CardTitle>
                      </CardHeader>
                      <CardContent className="py-3">
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                              result.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {result.status}
                            </span>
                          </div>
                          {result.assessment?.quality_metrics && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Quality</span>
                              <span className="font-bold text-primary">{result.assessment.quality_metrics.overall_score.toFixed(1)}</span>
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {new Date(result.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Result Tab */}
            {result && (
              <TabsContent value="result" className="space-y-3 focus-visible:outline-none">
                <WritingResult result={result} />

                {/* Generation History */}
                {generationHistory.length > 1 && (
                  <Card>
                    <CardHeader className="pb-1">
                      <CardTitle className="text-xs font-semibold uppercase">Recent Generations ({generationHistory.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="py-3">
                      <div className="space-y-1.5">
                        {generationHistory.slice(1, 6).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 border border-border hover:bg-muted/50 transition-colors rounded text-xs">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground">#{generationHistory.length - idx}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(item.created_at).toLocaleString()}
                              </p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded ml-2 flex-shrink-0 ${
                              item.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {item.status === 'completed' ? 'OK' : 'ERR'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default App;
