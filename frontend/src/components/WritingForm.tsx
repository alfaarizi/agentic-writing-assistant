import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { WritingRequest } from '@/lib/api';

interface WritingFormProps {
  userId: string;
  onGenerate: (request: WritingRequest) => void;
  loading: boolean;
  disabled: boolean;
}

type WritingType = 'cover_letter' | 'motivational_letter' | 'social_response' | 'email';

export function WritingForm({ userId, onGenerate, loading, disabled }: WritingFormProps) {
  const [writingType, setWritingType] = useState<WritingType>('cover_letter');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [programName, setProgramName] = useState('');
  const [maxWords, setMaxWords] = useState(500);
  const [qualityThreshold, setQualityThreshold] = useState(85);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    let context: Record<string, any> = {};

    if (writingType === 'cover_letter') {
      if (!jobTitle || !company) {
        setError('Please fill in Job Title and Company');
        return;
      }
      context = { job_title: jobTitle, company };
    } else if (writingType === 'motivational_letter') {
      if (!programName) {
        setError('Please fill in Program Name');
        return;
      }
      context = { program_name: programName };
    } else if (writingType === 'social_response') {
      if (!additionalInfo) {
        setError('Please enter the post content');
        return;
      }
      context = { post_content: additionalInfo };
    } else if (writingType === 'email') {
      if (!emailRecipient) {
        setError('Please enter recipient email');
        return;
      }
      context = { reply_to: emailRecipient, subject: emailSubject || undefined };
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
      additional_info: writingType !== 'social_response' && writingType !== 'email' ? additionalInfo : undefined,
    };

    onGenerate(request);
  };

  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-semibold uppercase">Generate Writing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 py-3">
        {/* Status Alert */}
        {(error || disabled) && (
          <Alert variant={error ? "destructive" : "warning"} className={`text-xs py-2.5 px-3 ${error ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <AlertCircle className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${error ? 'text-red-600' : 'text-yellow-600'}`} />
            <div className="ml-2">
              <AlertTitle className={`text-xs font-semibold ${error ? 'text-red-800' : 'text-yellow-800'}`}>
                {error || 'Save profile first'}
              </AlertTitle>
              {!error && (
                <AlertDescription className="text-xs text-yellow-700 mt-0.5">
                  You need to save your profile before generating writing
                </AlertDescription>
              )}
            </div>
          </Alert>
        )}

        {/* Writing Type Tabs */}
        <div className="border-b border-border">
          <Tabs value={writingType} onValueChange={(v) => setWritingType(v as WritingType)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-8 p-1 bg-muted rounded-none border-b border-border">
              <TabsTrigger value="cover_letter" className="text-xs h-7 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Cover
              </TabsTrigger>
              <TabsTrigger value="motivational_letter" className="text-xs h-7 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Motivational
              </TabsTrigger>
              <TabsTrigger value="social_response" className="text-xs h-7 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Social
              </TabsTrigger>
              <TabsTrigger value="email" className="text-xs h-7 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Email
              </TabsTrigger>
            </TabsList>

            {/* Cover Letter Tab */}
            <TabsContent value="cover_letter" className="space-y-2 mt-3 focus-visible:outline-none">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/80">Job Title *</label>
                <Input 
                  placeholder="Senior Product Manager" 
                  value={jobTitle} 
                  onChange={(e) => setJobTitle(e.target.value)} 
                  className="text-xs h-8 bg-background border-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/80">Company *</label>
                <Input 
                  placeholder="Tech Company Inc." 
                  value={company} 
                  onChange={(e) => setCompany(e.target.value)} 
                  className="text-xs h-8 bg-background border-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/80">Additional Information</label>
                <Textarea 
                  placeholder="Add job description, requirements, or other relevant details..." 
                  value={additionalInfo} 
                  onChange={(e) => setAdditionalInfo(e.target.value)} 
                  rows={3}
                  className="text-xs resize-none bg-background border-input"
                />
              </div>
            </TabsContent>

            {/* Motivational Letter Tab */}
            <TabsContent value="motivational_letter" className="space-y-2 mt-3 focus-visible:outline-none">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/80">Program Name *</label>
                <Input 
                  placeholder="University/Program Name" 
                  value={programName} 
                  onChange={(e) => setProgramName(e.target.value)} 
                  className="text-xs h-8 bg-background border-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/80">Additional Information</label>
                <Textarea 
                  placeholder="Add program requirements, your motivation, or other relevant details..." 
                  value={additionalInfo} 
                  onChange={(e) => setAdditionalInfo(e.target.value)} 
                  rows={3}
                  className="text-xs resize-none bg-background border-input"
                />
              </div>
            </TabsContent>

            {/* Social Response Tab */}
            <TabsContent value="social_response" className="space-y-2 mt-3 focus-visible:outline-none">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/80">Post Content *</label>
                <Textarea 
                  placeholder="Paste the post or content you want to respond to..." 
                  value={additionalInfo} 
                  onChange={(e) => setAdditionalInfo(e.target.value)} 
                  rows={4}
                  className="text-xs resize-none bg-background border-input"
                />
              </div>
            </TabsContent>

            {/* Email Tab */}
            <TabsContent value="email" className="space-y-2 mt-3 focus-visible:outline-none">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/80">Recipient Email *</label>
                <Input 
                  type="email"
                  placeholder="recipient@example.com" 
                  value={emailRecipient} 
                  onChange={(e) => setEmailRecipient(e.target.value)} 
                  className="text-xs h-8 bg-background border-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/80">Subject</label>
                <Input 
                  placeholder="Email subject (optional)" 
                  value={emailSubject} 
                  onChange={(e) => setEmailSubject(e.target.value)} 
                  className="text-xs h-8 bg-background border-input"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Generation Settings */}
        <div className="border-t border-border pt-3 space-y-6">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground/80">Max Words</label>
              <Input 
                type="number" 
                value={maxWords} 
                onChange={(e) => setMaxWords(Number(e.target.value))} 
                min={100} 
                max={2000}
                className="text-xs h-8 bg-background border-input"
                placeholder="500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground/80">Quality %</label>
              <Input 
                type="number" 
                value={qualityThreshold} 
                onChange={(e) => setQualityThreshold(Number(e.target.value))} 
                min={0} 
                max={100}
                className="text-xs h-8 bg-background border-input"
                placeholder="85"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSubmit} 
            disabled={loading || disabled} 
            size="sm" 
            className="w-full text-xs h-10 font-medium py-3"
          >
            <div className="flex items-center justify-center gap-1.5">
              <span>{loading ? 'Generating' : 'Generate Writing'}</span>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
