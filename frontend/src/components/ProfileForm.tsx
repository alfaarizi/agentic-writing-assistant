import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  Loader2, 
  Search, 
  Upload, 
  User, 
  Mail, 
  Phone, 
  Briefcase,
  FileText,
  Sparkles,
  GraduationCap,
  Code,
  Award,
  Book,
  Heart,
  Languages,
  Link as LinkIcon,
  MessageSquare
} from 'lucide-react';
import { getProfile, saveProfile, uploadResume, type UserProfile } from '@/lib/api';
import { EducationInput } from './profile/EducationInput';
import { ExperienceInput } from './profile/ExperienceInput';
import { SkillInput } from './profile/SkillInput';
import { ProjectInput } from './profile/ProjectInput';
import { CertificationInput } from './profile/CertificationInput';
import { AwardInput } from './profile/AwardInput';
import { PublicationInput } from './profile/PublicationInput';
import { VolunteeringInput } from './profile/VolunteeringInput';
import { LanguageInput } from './profile/LanguageInput';
import { SocialInput } from './profile/SocialInput';
import { RecommendationInput } from './profile/RecommendationInput';

interface ProfileFormProps {
  userId: string;
  onUserIdChange?: (userId: string) => void;
  onProfileSaved?: (profile: UserProfile) => void;
}

export function ProfileForm({ userId, onUserIdChange, onProfileSaved }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  
  // Personal Info fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [citizenship, setCitizenship] = useState('');
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [background, setBackground] = useState('');
  const [interests, setInterests] = useState('');
  
  // Profile sections
  const [education, setEducation] = useState<UserProfile['education']>([]);
  const [experience, setExperience] = useState<UserProfile['experience']>([]);
  const [skills, setSkills] = useState<UserProfile['skills']>([]);
  const [projects, setProjects] = useState<UserProfile['projects']>([]);
  const [certifications, setCertifications] = useState<UserProfile['certifications']>([]);
  const [awards, setAwards] = useState<UserProfile['awards']>([]);
  const [publications, setPublications] = useState<UserProfile['publications']>([]);
  const [volunteering, setVolunteering] = useState<UserProfile['volunteering']>([]);
  const [languages, setLanguages] = useState<UserProfile['languages']>([]);
  const [socials, setSocials] = useState<UserProfile['socials']>([]);
  const [recommendations, setRecommendations] = useState<UserProfile['recommendations']>([]);
  
  // Writing Preferences
  const [tone, setTone] = useState('professional');
  const [style, setStyle] = useState('concise');

  // Helper to treat "Unknown" fallback values as empty
  const normalizeValue = (value: string | undefined | null): string => {
    if (!value || value === 'Unknown') return '';
    return value;
  };

  const populateFromProfile = (profile: UserProfile) => {
    const pi = profile.personal_info;
    setFirstName(normalizeValue(pi.first_name));
    setLastName(normalizeValue(pi.last_name));
    setPreferredName(pi.preferred_name || '');
    setPronouns(pi.pronouns || '');
    setDateOfBirth(pi.date_of_birth || '');
    setEmail(pi.email || '');
    setPhone(pi.phone || '');
    setCity(pi.city || '');
    setCountry(pi.country || '');
    setCitizenship(pi.citizenship || '');
    setHeadline(pi.headline || '');
    setSummary(pi.summary || '');
    setBackground(pi.background || '');
    setInterests(pi.interests?.join(', ') || '');
    
    // Populate all sections
    setEducation(profile.education || []);
    setExperience(profile.experience || []);
    setSkills(profile.skills || []);
    setProjects(profile.projects || []);
    setCertifications(profile.certifications || []);
    setAwards(profile.awards || []);
    setPublications(profile.publications || []);
    setVolunteering(profile.volunteering || []);
    setLanguages(profile.languages || []);
    setSocials(profile.socials || []);
    setRecommendations(profile.recommendations || []);
    
    if (profile.writing_preferences) {
      setTone(profile.writing_preferences.tone || 'professional');
      setStyle(profile.writing_preferences.style || 'concise');
    }
  };

  const handleFetchProfile = async () => {
    if (!userId.trim()) {
      setError('Please enter a User ID');
      return;
    }

    setFetching(true);
    setError(null);
    try {
      const profile = await getProfile(userId);
      if (profile) {
        populateFromProfile(profile);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Profile not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setFetching(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!userId.trim()) {
      setError('Please enter a User ID first');
      return;
    }

    if (!file.name.match(/\.(pdf|docx)$/i)) {
      setError('Please upload a PDF or DOCX file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const profile = await uploadResume(userId, file);
      populateFromProfile(profile);
      setResumeUploaded(true);
      setSuccess(true);
      onProfileSaved?.(profile);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload resume');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required');
      return;
    }

    if (!userId.trim()) {
      setError('User ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const saved = await saveProfile({
        user_id: userId,
        personal_info: {
          first_name: firstName,
          last_name: lastName,
          preferred_name: preferredName || undefined,
          pronouns: pronouns || undefined,
          date_of_birth: dateOfBirth || undefined,
          email: email || undefined,
          phone: phone || undefined,
          city: city || undefined,
          country: country || undefined,
          citizenship: citizenship || undefined,
          headline: headline || undefined,
          summary: summary || undefined,
          background: background || undefined,
          interests: interests.split(',').map(i => i.trim()).filter(Boolean),
        },
        writing_preferences: {
          tone,
          style,
        },
        education: (education || []).length > 0 ? education : undefined,
        experience: (experience || []).length > 0 ? experience : undefined,
        skills: (skills || []).length > 0 ? skills : undefined,
        projects: (projects || []).length > 0 ? projects : undefined,
        certifications: (certifications || []).length > 0 ? certifications : undefined,
        awards: (awards || []).length > 0 ? awards : undefined,
        publications: (publications || []).length > 0 ? publications : undefined,
        volunteering: (volunteering || []).length > 0 ? volunteering : undefined,
        languages: (languages || []).length > 0 ? languages : undefined,
        socials: (socials || []).length > 0 ? socials : undefined,
        recommendations: (recommendations || []).length > 0 ? recommendations : undefined,
      });
      setSuccess(true);
      onProfileSaved?.(saved);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || fetching || uploading;

  return (
    <Card className="w-full border-2 border-black dark:border-white bg-background">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <User className="h-4 w-4" />
          Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User ID & Actions Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId" className="text-sm font-medium">User ID</Label>
            <div className="flex gap-2">
              <Input 
                id="userId" 
                value={userId} 
                onChange={(e) => onUserIdChange?.(e.target.value)} 
                placeholder="Enter your user ID" 
                className="flex-1 border-2 border-black dark:border-white"
                disabled={isDisabled}
              />
              <Button
                onClick={handleFetchProfile}
                disabled={isDisabled || !userId.trim()}
                variant="outline"
                size="icon"
              >
                {fetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Resume Upload Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Upload Resume (Optional)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".pdf,.docx"
                onChange={handleResumeUpload}
                disabled={isDisabled || !userId.trim()}
                className="flex-1 border-2 border-black dark:border-white"
                id="resume-upload"
              />
              <Button
                onClick={() => document.getElementById('resume-upload')?.click()}
                disabled={isDisabled || !userId.trim()}
                variant="outline"
                size="icon"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a PDF or DOCX resume to auto-fill your profile. All fields remain editable.
            </p>
            {resumeUploaded && (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Resume data loaded. You can edit any field below.</span>
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">
              {resumeUploaded ? 'Resume uploaded and profile updated!' : 'Profile saved successfully!'}
            </AlertDescription>
          </Alert>
        )}

        {/* Accordion for all sections */}
        <Accordion type="multiple" className="w-full" defaultValue={['personal', 'writing']}>
          {/* Personal Information */}
          <AccordionItem value="personal">
            <AccordionTrigger className="text-sm font-semibold">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal Information
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="firstName" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    placeholder="John" 
                    disabled={isDisabled}
                    className="border-2 border-black dark:border-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="lastName" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    placeholder="Doe" 
                    disabled={isDisabled}
                    className="border-2 border-black dark:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preferredName" className="text-sm">Preferred Name</Label>
                  <Input 
                    id="preferredName" 
                    value={preferredName} 
                    onChange={(e) => setPreferredName(e.target.value)} 
                    placeholder="How you prefer to be called" 
                    disabled={isDisabled}
                    className="border-2 border-black dark:border-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pronouns" className="text-sm">Pronouns</Label>
                  <Input 
                    id="pronouns" 
                    value={pronouns} 
                    onChange={(e) => setPronouns(e.target.value)} 
                    placeholder="he/him, she/her, they/them" 
                    disabled={isDisabled}
                    className="border-2 border-black dark:border-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm">Date of Birth</Label>
                <Input 
                  id="dateOfBirth" 
                  type="date"
                  value={dateOfBirth} 
                  onChange={(e) => setDateOfBirth(e.target.value)} 
                  disabled={isDisabled}
                  className="border-2 border-black dark:border-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="your.email@example.com" 
                    disabled={isDisabled}
                    className="border-2 border-black dark:border-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    Phone
                  </Label>
                  <Input 
                    id="phone" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="+1 (555) 123-4567" 
                    disabled={isDisabled}
                    className="border-2 border-black dark:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm">City</Label>
                  <Input 
                    id="city" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)} 
                    placeholder="New York" 
                    disabled={isDisabled}
                    className="border-2 border-black dark:border-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm">Country</Label>
                  <Input 
                    id="country" 
                    value={country} 
                    onChange={(e) => setCountry(e.target.value)} 
                    placeholder="United States" 
                    disabled={isDisabled}
                    className="border-2 border-black dark:border-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="citizenship" className="text-sm">Citizenship</Label>
                <Input 
                  id="citizenship" 
                  value={citizenship} 
                  onChange={(e) => setCitizenship(e.target.value)} 
                  placeholder="Country of citizenship" 
                  disabled={isDisabled}
                  className="border-2 border-black dark:border-white"
                />
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <Label htmlFor="headline" className="text-sm">Professional Headline</Label>
                <Input 
                  id="headline" 
                  value={headline} 
                  onChange={(e) => setHeadline(e.target.value)} 
                  placeholder="e.g., Software Engineer | AI Enthusiast" 
                  disabled={isDisabled}
                  className="border-2 border-black dark:border-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary" className="text-sm">Professional Summary</Label>
                <Textarea 
                  id="summary" 
                  value={summary} 
                  onChange={(e) => setSummary(e.target.value)} 
                  placeholder="A brief summary of your professional background and expertise..."
                  rows={3}
                  disabled={isDisabled}
                  className="resize-none border-2 border-black dark:border-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="background" className="text-sm">Background</Label>
                <Textarea 
                  id="background" 
                  value={background} 
                  onChange={(e) => setBackground(e.target.value)} 
                  placeholder="Your professional background, career journey, or relevant context..."
                  rows={3}
                  disabled={isDisabled}
                  className="resize-none border-2 border-black dark:border-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interests" className="text-sm">Interests</Label>
                <Input 
                  id="interests" 
                  value={interests} 
                  onChange={(e) => setInterests(e.target.value)} 
                  placeholder="AI, Reading, Travel, Music (comma-separated)" 
                  disabled={isDisabled}
                  className="border-2 border-black dark:border-white"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Education */}
          <AccordionItem value="education">
            <AccordionTrigger className="text-sm font-semibold">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Education
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <EducationInput value={education || []} onChange={setEducation} disabled={isDisabled} />
            </AccordionContent>
          </AccordionItem>

          {/* Experience */}
          <AccordionItem value="experience">
            <AccordionTrigger className="text-sm font-semibold">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Experience
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <ExperienceInput value={experience || []} onChange={setExperience} disabled={isDisabled} />
            </AccordionContent>
          </AccordionItem>

          {/* Skills */}
          <AccordionItem value="skills">
            <AccordionTrigger className="text-sm font-semibold">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Skills
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <SkillInput value={skills || []} onChange={setSkills} disabled={isDisabled} />
            </AccordionContent>
          </AccordionItem>

          {/* Projects */}
          <AccordionItem value="projects">
            <AccordionTrigger className="text-sm font-semibold">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Projects
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <ProjectInput value={projects || []} onChange={setProjects} disabled={isDisabled} />
            </AccordionContent>
          </AccordionItem>

          {/* Certifications */}
          <AccordionItem value="certifications">
            <AccordionTrigger className="text-sm font-semibold">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Certifications
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <CertificationInput value={certifications || []} onChange={setCertifications} disabled={isDisabled} />
            </AccordionContent>
          </AccordionItem>

          {/* Awards */}
          <AccordionItem value="awards">
            <AccordionTrigger className="text-sm font-semibold">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Awards
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <AwardInput value={awards || []} onChange={setAwards} disabled={isDisabled} />
            </AccordionContent>
          </AccordionItem>

          {/* Publications */}
          <AccordionItem value="publications">
            <AccordionTrigger className="text-sm font-semibold">
              <div className="flex items-center gap-2">
                <Book className="h-4 w-4" />
                Publications
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <PublicationInput value={publications || []} onChange={setPublications} disabled={isDisabled} />
            </AccordionContent>
          </AccordionItem>

          {/* Volunteering */}
          <AccordionItem value="volunteering">
            <AccordionTrigger className="text-sm font-semibold">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Volunteering
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <VolunteeringInput value={volunteering || []} onChange={setVolunteering} disabled={isDisabled} />
            </AccordionContent>
          </AccordionItem>

          {/* Languages */}
          <AccordionItem value="languages">
            <AccordionTrigger className="text-sm font-semibold">
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                Languages
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <LanguageInput value={languages || []} onChange={setLanguages} disabled={isDisabled} />
            </AccordionContent>
          </AccordionItem>

          {/* Social Links */}
          <AccordionItem value="socials">
            <AccordionTrigger className="text-sm font-semibold">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Social Links
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <SocialInput value={socials || []} onChange={setSocials} disabled={isDisabled} />
            </AccordionContent>
          </AccordionItem>

          {/* Recommendations */}
          <AccordionItem value="recommendations">
            <AccordionTrigger className="text-sm font-semibold">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Recommendations
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <RecommendationInput value={recommendations || []} onChange={setRecommendations} disabled={isDisabled} />
            </AccordionContent>
          </AccordionItem>

          {/* Writing Preferences */}
          <AccordionItem value="writing">
            <AccordionTrigger className="text-sm font-semibold">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Writing Preferences
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tone" className="text-sm">Tone</Label>
                  <Select value={tone} onValueChange={setTone} disabled={isDisabled}>
                    <SelectTrigger id="tone" className="w-full border-2 border-black dark:border-white">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="style" className="text-sm">Style</Label>
                  <Select value={style} onValueChange={setStyle} disabled={isDisabled}>
                    <SelectTrigger id="style" className="w-full border-2 border-black dark:border-white">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concise">Concise</SelectItem>
                      <SelectItem value="descriptive">Descriptive</SelectItem>
                      <SelectItem value="narrative">Narrative</SelectItem>
                      <SelectItem value="persuasive">Persuasive</SelectItem>
                      <SelectItem value="reflective">Reflective</SelectItem>
                      <SelectItem value="analytical">Analytical</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={isDisabled || !firstName.trim() || !lastName.trim()} 
          className="w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Save Profile
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
