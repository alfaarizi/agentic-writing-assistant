import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  MessageSquare,
  Trash2,
  Download
} from 'lucide-react';
import { getProfile, saveProfile, uploadResume, getWritingSamples, type UserProfile, type WritingPreferences, type WritingSample } from '@/lib/api';
import { EducationInput } from './profile/EducationInput';
import { ExperienceInput } from './profile/ExperienceInput';
import { SkillInput } from './profile/SkillInput';
import { ProjectInput } from './profile/ProjectInput';
import { CertificationInput } from './profile/CertificationInput';
import { AwardInput } from './profile/AwardInput';
import { PublicationInput } from './profile/PublicationInput';
import { VolunteeringInput } from './profile/VolunteeringInput';
import { WritingPreferencesInput } from './profile/WritingPreferencesInput';
import { WritingSampleUpload } from './profile/WritingSampleUpload';
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
  const [isInitialized, setIsInitialized] = useState(false);
  
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
  
  const [writingPreferences, setWritingPreferences] = useState<WritingPreferences>({
    tone: 'professional',
    style: 'concise',
    common_phrases: [],
  });
  
  const [writingSamples, setWritingSamples] = useState<WritingSample[]>([]);
  const [openAccordions, setOpenAccordions] = useState<string[]>(['writing']);

  useEffect(() => {
    const saved = localStorage.getItem('awa_form_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.firstName !== undefined) setFirstName(data.firstName);
        if (data.lastName !== undefined) setLastName(data.lastName);
        if (data.preferredName !== undefined) setPreferredName(data.preferredName);
        if (data.pronouns !== undefined) setPronouns(data.pronouns);
        if (data.dateOfBirth !== undefined) setDateOfBirth(data.dateOfBirth);
        if (data.email !== undefined) setEmail(data.email);
        if (data.phone !== undefined) setPhone(data.phone);
        if (data.city !== undefined) setCity(data.city);
        if (data.country !== undefined) setCountry(data.country);
        if (data.citizenship !== undefined) setCitizenship(data.citizenship);
        if (data.headline !== undefined) setHeadline(data.headline);
        if (data.summary !== undefined) setSummary(data.summary);
        if (data.background !== undefined) setBackground(data.background);
        if (data.interests !== undefined) setInterests(data.interests);
        if (Array.isArray(data.education)) setEducation(data.education);
        if (Array.isArray(data.experience)) setExperience(data.experience);
        if (Array.isArray(data.skills)) setSkills(data.skills);
        if (Array.isArray(data.projects)) setProjects(data.projects);
        if (Array.isArray(data.certifications)) setCertifications(data.certifications);
        if (Array.isArray(data.awards)) setAwards(data.awards);
        if (Array.isArray(data.publications)) setPublications(data.publications);
        if (Array.isArray(data.volunteering)) setVolunteering(data.volunteering);
        if (Array.isArray(data.languages)) setLanguages(data.languages);
        if (Array.isArray(data.socials)) setSocials(data.socials);
        if (Array.isArray(data.recommendations)) setRecommendations(data.recommendations);
        if (data.writingPreferences !== undefined) setWritingPreferences(data.writingPreferences);
        if (Array.isArray(data.writingSamples)) setWritingSamples(data.writingSamples);
      } catch (err) {
        console.error('Failed to load form data from localStorage:', err);
      }
    }
    
    const savedAccordions = localStorage.getItem('awa_accordion_state');
    if (savedAccordions) {
      try {
        const accordionState = JSON.parse(savedAccordions);
        if (Array.isArray(accordionState)) {
          setOpenAccordions(accordionState);
        }
      } catch (err) {
        console.error('Failed to load accordion state from localStorage:', err);
      }
    }
    
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    
    const timeoutId = setTimeout(() => {
      const formData = {
        firstName,
        lastName,
        preferredName,
        pronouns,
        dateOfBirth,
        email,
        phone,
        city,
        country,
        citizenship,
        headline,
        summary,
        background,
        interests,
        education: education || [],
        experience: experience || [],
        skills: skills || [],
        projects: projects || [],
        certifications: certifications || [],
        awards: awards || [],
        publications: publications || [],
        volunteering: volunteering || [],
        languages: languages || [],
        socials: socials || [],
        recommendations: recommendations || [],
        writingPreferences,
        writingSamples: writingSamples || [],
      };
      localStorage.setItem('awa_form_data', JSON.stringify(formData));
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [
    isInitialized, firstName, lastName, preferredName, pronouns, dateOfBirth, email, phone,
    city, country, citizenship, headline, summary, background, interests,
    education, experience, skills, projects, certifications, awards,
    publications, volunteering, languages, socials, recommendations, writingPreferences, writingSamples
  ]);

  useEffect(() => {
    if (!isInitialized) return;
    
    const timeoutId = setTimeout(() => {
      localStorage.setItem('awa_accordion_state', JSON.stringify(openAccordions));
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [isInitialized, openAccordions]);

  const normalizeValue = (value: string | undefined | null): string => {
    if (!value || value === 'Unknown') return '';
    return value;
  };

  const normalizeDate = (value: string | undefined | null): string => {
    if (!value) return '';
    
    if (/^\d{4}-\d{2}$/.test(value)) return value;
    if (/^\d{4}$/.test(value)) return `${value}-01`;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.substring(0, 7);
    
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
      }
    } catch {
      return '';
    }
    
    return '';
  };

  const populateFromProfile = (profile: UserProfile, openAccordionsAfter = false) => {
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
    
    setEducation(Array.isArray(profile.education) ? profile.education.map(edu => ({
      ...edu,
      start_date: normalizeDate(edu.start_date),
      end_date: normalizeDate(edu.end_date),
    })) : []);
    setExperience(Array.isArray(profile.experience) ? profile.experience.map(exp => ({
      ...exp,
      start_date: normalizeDate(exp.start_date),
      end_date: normalizeDate(exp.end_date),
    })) : []);
    setSkills(Array.isArray(profile.skills) ? profile.skills : []);
    setProjects(Array.isArray(profile.projects) ? profile.projects.map(proj => ({
      ...proj,
      start_date: normalizeDate(proj.start_date),
      end_date: normalizeDate(proj.end_date),
    })) : []);
    setCertifications(Array.isArray(profile.certifications) ? profile.certifications.map(cert => ({
      ...cert,
      issue_date: normalizeDate(cert.issue_date),
      expiration_date: normalizeDate(cert.expiration_date),
    })) : []);
    setAwards(Array.isArray(profile.awards) ? profile.awards.map(award => ({
      ...award,
      issue_date: normalizeDate(award.issue_date),
    })) : []);
    setPublications(Array.isArray(profile.publications) ? profile.publications.map(pub => ({
      ...pub,
      publication_date: normalizeDate(pub.publication_date),
    })) : []);
    setVolunteering(Array.isArray(profile.volunteering) ? profile.volunteering.map(vol => ({
      ...vol,
      start_date: normalizeDate(vol.start_date),
      end_date: normalizeDate(vol.end_date),
    })) : []);
    setLanguages(Array.isArray(profile.languages) ? profile.languages : []);
    setSocials(Array.isArray(profile.socials) ? profile.socials : []);
    setRecommendations(Array.isArray(profile.recommendations) ? profile.recommendations.map(rec => ({
      ...rec,
      date: normalizeDate(rec.date),
    })) : []);
    
    if (profile.writing_preferences) {
      setWritingPreferences(profile.writing_preferences || { tone: 'professional', style: 'concise', common_phrases: [] });
    }

    if (openAccordionsAfter) {
      const accordionsToOpen: string[] = ['personal'];
      
      if (profile.education && profile.education.length > 0) accordionsToOpen.push('education');
      if (profile.experience && profile.experience.length > 0) accordionsToOpen.push('experience');
      if (profile.skills && profile.skills.length > 0) accordionsToOpen.push('skills');
      if (profile.projects && profile.projects.length > 0) accordionsToOpen.push('projects');
      if (profile.certifications && profile.certifications.length > 0) accordionsToOpen.push('certifications');
      if (profile.awards && profile.awards.length > 0) accordionsToOpen.push('awards');
      if (profile.publications && profile.publications.length > 0) accordionsToOpen.push('publications');
      if (profile.volunteering && profile.volunteering.length > 0) accordionsToOpen.push('volunteering');
      if (profile.languages && profile.languages.length > 0) accordionsToOpen.push('languages');
      if (profile.socials && profile.socials.length > 0) accordionsToOpen.push('socials');
      if (profile.recommendations && profile.recommendations.length > 0) accordionsToOpen.push('recommendations');
      if (profile.writing_preferences) accordionsToOpen.push('writing');
      
      setOpenAccordions(accordionsToOpen);
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
        populateFromProfile(profile, true);
        
        try {
          const samples = await getWritingSamples(userId);
          const fetchedSamples = Array.isArray(samples) ? samples : [];
          setWritingSamples(fetchedSamples);
          
          if (fetchedSamples.length > 0) {
            setOpenAccordions(prev => {
              if (!prev.includes('samples')) {
                return [...prev, 'samples'];
              }
              return prev;
            });
          }
        } catch (err) {
          console.warn('Failed to fetch writing samples:', err);
          setWritingSamples([]);
        }
        
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
      populateFromProfile(profile, true);
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
          ...writingPreferences,
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

  const handleClearAll = () => {
    if (!confirm('Are you sure you want to clear all profile data? This action cannot be undone.')) {
      return;
    }
    
    setFirstName('');
    setLastName('');
    setPreferredName('');
    setPronouns('');
    setDateOfBirth('');
    setEmail('');
    setPhone('');
    setCity('');
    setCountry('');
    setCitizenship('');
    setHeadline('');
    setSummary('');
    setBackground('');
    setInterests('');
    setEducation([]);
    setExperience([]);
    setSkills([]);
    setProjects([]);
    setCertifications([]);
    setAwards([]);
    setPublications([]);
    setVolunteering([]);
    setLanguages([]);
    setSocials([]);
    setRecommendations([]);
    setWritingPreferences({ tone: 'professional', style: 'concise', common_phrases: [] });
    setWritingSamples([]);
    setOpenAccordions([]);
    localStorage.removeItem('awa_form_data');
    localStorage.removeItem('awa_accordion_state');
    setError(null);
    setSuccess(false);
    setResumeUploaded(false);
  };

  const handleExport = () => {
    const exportData: any = {
      "Personal Information": {
        "First Name": firstName || "",
        "Last Name": lastName || "",
        "Preferred Name": preferredName || "",
        "Pronouns": pronouns || "",
        "Date of Birth": dateOfBirth || "",
        "Email": email || "",
        "Phone": phone || "",
        "City": city || "",
        "Country": country || "",
        "Citizenship": citizenship || "",
        "Headline": headline || "",
        "Summary": summary || "",
        "Background": background || "",
        "Interests": interests ? interests.split(',').map(i => i.trim()).filter(Boolean) : []
      },
      "Education": (education || []).map(edu => ({
        "School": edu.school || "",
        "Degree": edu.degree || "",
        "Field of Study": edu.field_of_study || "",
        "Start Date": edu.start_date || "",
        "End Date": edu.end_date || "",
        "GPA": edu.grade || "",
        "Activities": edu.activities || "",
        "Description": edu.description || "",
        "Skills": edu.skills || []
      })),
      "Experience": (experience || []).map(exp => ({
        "Company": exp.company || "",
        "Position": exp.position || "",
        "Employment Type": exp.employment_type || "",
        "Location": exp.location || "",
        "Location Type": exp.location_type || "",
        "Start Date": exp.start_date || "",
        "End Date": exp.end_date || "",
        "Description": exp.description || "",
        "Achievements": exp.achievements || "",
        "Skills": exp.skills || []
      })),
      "Skills": (skills || []).map(skill => ({
        "Name": skill.name || "",
        "Proficiency": skill.proficiency || "",
        "Years Experience": skill.years_experience || ""
      })),
      "Projects": (projects || []).map(proj => ({
        "Name": proj.name || "",
        "Description": proj.description || "",
        "Start Date": proj.start_date || "",
        "End Date": proj.end_date || "",
        "URL": proj.url || "",
        "Skills": proj.skills || [],
        "Contributors": proj.contributors || [],
        "Associated With": proj.associated_with || ""
      })),
      "Certifications": (certifications || []).map(cert => ({
        "Name": cert.name || "",
        "Issuer": cert.issuer || "",
        "Issue Date": cert.issue_date || "",
        "Expiration Date": cert.expiration_date || "",
        "Credential ID": cert.credential_id || "",
        "Credential URL": cert.credential_url || "",
        "Skills": cert.skills || []
      })),
      "Awards": (awards || []).map(award => ({
        "Title": award.title || "",
        "Issuer": award.issuer || "",
        "Issue Date": award.issue_date || "",
        "Description": award.description || "",
        "Associated With": award.associated_with || ""
      })),
      "Publications": (publications || []).map(pub => ({
        "Title": pub.title || "",
        "Publisher": pub.publisher || "",
        "Publication Date": pub.publication_date || "",
        "URL": pub.url || "",
        "Description": pub.description || "",
        "Authors": pub.authors || []
      })),
      "Volunteering": (volunteering || []).map(vol => ({
        "Organization": vol.organization || "",
        "Role": vol.role || "",
        "Cause": vol.cause || "",
        "Start Date": vol.start_date || "",
        "End Date": vol.end_date || "",
        "Description": vol.description || ""
      })),
      "Languages": (languages || []).map(lang => ({
        "Name": lang.name || "",
        "Proficiency": lang.proficiency || ""
      })),
      "Social Links": (socials || []).map(social => ({
        "Platform": social.platform || "",
        "URL": social.url || "",
        "Username": social.username || ""
      })),
      "Recommendations": (recommendations || []).map(rec => ({
        "Name": rec.name || "",
        "Position": rec.position || "",
        "Relationship": rec.relationship || "",
        "Message": rec.message || "",
        "Date": rec.date || ""
      })),
      "Writing Preferences": {
        "Tone": writingPreferences.tone || "",
        "Style": writingPreferences.style || "",
        "Common Phrases": writingPreferences.common_phrases || []
      },
      "Writing Samples": (writingSamples || []).map(sample => ({
        "Sample ID": sample.sample_id || "",
        "User ID": sample.user_id || "",
        "Content": sample.content || "",
        "Type": sample.type || "",
        "Context": sample.context || {},
        "Quality Score": sample.quality_score || "",
        "Created At": sample.created_at || "",
        "Updated At": sample.updated_at || ""
      }))
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profile-export-${userId || 'profile'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isDisabled = loading || fetching || uploading;

  return (
    <Card className="w-full border-2 border-black dark:border-white bg-background">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile Information
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              disabled={isDisabled}
              className="h-8 px-2 gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
              title="Export profile as JSON"
            >
              <Download className="h-4 w-4" />
              <span className="text-xs">Export</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={isDisabled}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              title="Clear all profile data"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
            {!userId.trim() ? (
              <p className="text-xs text-amber-600 font-medium">
                ⚠️ Please enter a User ID first to enable resume upload
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Upload a PDF or DOCX resume to auto-fill your profile. All fields remain editable.
              </p>
            )}
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
        <Accordion 
          type="multiple" 
          className="w-full" 
          value={openAccordions}
          onValueChange={setOpenAccordions}
        >
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
              <WritingPreferencesInput
                value={writingPreferences}
                onChange={setWritingPreferences}
                disabled={isDisabled}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Writing Samples */}
          <AccordionItem value="samples">
            <AccordionTrigger className="text-sm font-semibold">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Writing Samples
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Upload examples of your past writing to help personalize generated content to match your unique voice and style.
              </p>
              <WritingSampleUpload
                userId={userId}
                initialSamples={writingSamples}
                onUploadSuccess={async () => {
                  try {
                    const samples = await getWritingSamples(userId);
                    setWritingSamples(samples);
                  } catch (err) {
                    console.warn('Failed to refresh writing samples:', err);
                  }
                  setSuccess(true);
                  setTimeout(() => setSuccess(false), 3000);
                }}
                onSamplesChange={(samples) => {
                  const currentKey = JSON.stringify(writingSamples);
                  const newKey = JSON.stringify(samples);
                  if (currentKey !== newKey) {
                    setWritingSamples(samples);
                  }
                }}
                disabled={isDisabled}
              />
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
