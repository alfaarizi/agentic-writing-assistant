import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { getProfile, saveProfile, type UserProfile } from '@/lib/api';

interface ProfileFormProps {
  userId: string;
  onUserIdChange?: (userId: string) => void;
  onProfileSaved?: (profile: UserProfile) => void;
}

export function ProfileForm({ userId, onUserIdChange, onProfileSaved }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState('');
  const [background, setBackground] = useState('');
  const [skills, setSkills] = useState('');
  const [tone, setTone] = useState('professional');
  const [style, setStyle] = useState('concise');

  useEffect(() => {
    if (!userId.trim()) return;

    const timer = setTimeout(() => {
      getProfile(userId).then((profile) => {
        if (profile) {
          setName(profile.personal_info.name);
          setBackground(profile.personal_info.background || '');
          setSkills(profile.personal_info.skills.join(', '));
          setTone(profile.writing_preferences.tone);
          setStyle(profile.writing_preferences.style);
        } else {
          setName('');
          setBackground('');
          setSkills('');
          setTone('professional');
          setStyle('concise');
        }
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [userId]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Name is required');
      return;
    }

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
      setSuccess(true);
      onProfileSaved?.(saved);
      setTimeout(() => setSuccess(false), 2500);
    } catch (error) {
      alert(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-semibold uppercase">Current Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 py-3">
        <div className="space-y-6">
          {/* User ID Section */}
          <div className="space-y-1.5">
            <Label htmlFor="userId" className="text-xs font-medium text-foreground/90">User ID</Label>
            <Input 
              id="userId" 
              value={userId} 
              onChange={(e) => onUserIdChange?.(e.target.value)} 
              placeholder="Enter user ID" 
              className="text-xs h-8 bg-background border-input"
            />
          </div>

          {/* Basic Information Separator */}
          <div className="border-t border-border pt-2.5">
            <Label className="text-xs font-medium text-foreground/90 block mb-2.5 text-right">Basic Information</Label>
            
            <div className="space-y-2">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium text-foreground/80">Name *</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your full name" 
                  className="text-xs h-8 bg-background border-input"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="background" className="text-xs font-medium text-foreground/80">Background</Label>
                <Input 
                  id="background" 
                  value={background} 
                  onChange={(e) => setBackground(e.target.value)} 
                  placeholder="Your profession or background" 
                  className="text-xs h-8 bg-background border-input"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="skills" className="text-xs font-medium text-foreground/80">Skills</Label>
                <Input 
                  id="skills" 
                  value={skills} 
                  onChange={(e) => setSkills(e.target.value)} 
                  placeholder="Comma-separated skills" 
                  className="text-xs h-8 bg-background border-input"
                />
              </div>
            </div>
          </div>

          {/* Writing Preferences Section */}
          <div className="border-t border-border pt-2.5">
            <Label className="text-xs font-medium text-foreground/90 block mb-2.5 text-right">Writing Preferences</Label>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 w-full">
              <div className="space-y-1.5">
                <Label htmlFor="tone" className="text-xs font-medium text-foreground/80">Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger id="tone" className="text-xs h-8 bg-background border-input w-full">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="style" className="text-xs font-medium text-foreground/80">Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger id="style" className="text-xs h-8 bg-background border-input w-full">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Status Alert */}
          {success && (
            <Alert variant="success" className="text-xs py-2.5 px-3 bg-green-50 border-green-200">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="ml-2">
                <AlertTitle className="text-xs font-semibold text-green-800">Profile saved</AlertTitle>
                <AlertDescription className="text-xs text-green-700 mt-0.5">Your profile has been successfully updated</AlertDescription>
              </div>
            </Alert>
          )}

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            disabled={loading || !name.trim()} 
            size="sm" 
            className="w-full text-xs h-10 mt-1 font-medium py-3"
          >
            <div className="flex items-center justify-center gap-1.5">
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving</span>
                </>
              ) : (
                  <span>Save Profile</span>
              )}
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
