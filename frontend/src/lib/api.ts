const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface PersonalInfo {
  first_name: string;
  last_name: string;
  preferred_name?: string;
  pronouns?: string;
  date_of_birth?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  citizenship?: string;
  headline?: string;
  summary?: string;
  background?: string;
  interests?: string[];
}

export interface Education {
  school: string;
  degree: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  grade?: string;
  activities?: string;
  description?: string;
  skills?: string[];
}

export interface Experience {
  company: string;
  position: string;
  employment_type?: string;
  location?: string;
  location_type?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  achievements?: string;
  skills?: string[];
}

export interface Skill {
  name: string;
  proficiency?: string;
  years_experience?: number;
}

export interface Project {
  name: string;
  description: string;
  start_date?: string;
  end_date?: string;
  url?: string;
  skills?: string[];
  contributors?: string[];
  associated_with?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  issue_date?: string;
  expiration_date?: string;
  credential_id?: string;
  credential_url?: string;
  skills?: string[];
}

export interface Award {
  title: string;
  issuer: string;
  issue_date?: string;
  description?: string;
  associated_with?: string;
}

export interface Publication {
  title: string;
  publisher?: string;
  publication_date?: string;
  url?: string;
  description?: string;
  authors?: string[];
}

export interface Volunteering {
  organization: string;
  role: string;
  cause?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

export interface Language {
  name: string;
  proficiency?: string;
}

export interface Social {
  platform: string;
  url: string;
  username?: string;
}

export interface Recommendation {
  name: string;
  position?: string;
  relationship?: string;
  message: string;
  date?: string;
}

export interface WritingPreferences {
  tone?: string;
  style?: string;
  common_phrases?: string[];
  writing_samples?: string[];
}

export interface UserProfile {
  user_id: string;
  personal_info: PersonalInfo;
  writing_preferences?: WritingPreferences;
  education?: Education[];
  experience?: Experience[];
  projects?: Project[];
  certifications?: Certification[];
  awards?: Award[];
  publications?: Publication[];
  volunteering?: Volunteering[];
  skills?: Skill[];
  languages?: Language[];
  socials?: Social[];
  recommendations?: Recommendation[];
  created_at: string;
  updated_at: string;
}

export interface WritingRequest {
  user_id: string;
  type: 'cover_letter' | 'motivational_letter' | 'social_response' | 'email';
  context: Record<string, any>;
  requirements: {
    max_words: number;
    quality_threshold: number;
    mode?: string;
  };
  additional_info?: string;
}

export interface WritingResponse {
  request_id: string;
  status: 'completed' | 'processing' | 'failed';
  content?: string;
  assessment?: {
    quality_metrics: {
      overall_score: number;
      coherence: number;
      naturalness: number;
      grammar_accuracy: number;
      completeness: number;
      lexical_quality: number;
      personalization: number;
    };
    text_stats: {
      word_count: number;
      character_count: number;
      character_count_no_spaces: number;
      paragraph_count: number;
      line_count: number;
      estimated_pages: number;
    };
    requirements_checks: Record<string, boolean>;
  };
  suggestions: string[];
  iterations: number;
  created_at: string;
  updated_at: string;
  error?: string;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export async function saveProfile(profile: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<UserProfile> {
  const exists = await getProfile(profile.user_id);
  const method = exists ? 'PUT' : 'POST';
  const url = exists ? `${API_BASE_URL}/users/${profile.user_id}` : `${API_BASE_URL}/users`;
  
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    throw new Error(`Failed to ${exists ? 'update' : 'create'} profile`);
  }

  return response.json();
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to get profile');
    return response.json();
  } catch {
    return null;
  }
}

export async function uploadResume(userId: string, file: File): Promise<UserProfile> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/users/${userId}/resume`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to upload resume' }));
    throw new Error(error.detail || 'Failed to upload resume');
  }

  return response.json();
}

export type StatusListener = (update: { stage: string; progress: number; message: string; timestamp: string } | { type: 'complete'; data: WritingResponse }) => void;

export async function generateWriting(request: WritingRequest, onStatus?: StatusListener): Promise<WritingResponse> {
  const response = await fetch(`${API_BASE_URL}/users/${request.user_id}/writings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to start writing generation');
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let result: WritingResponse | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'complete') {
              result = data.data;
              onStatus?.(data);
            } else {
              onStatus?.(data);
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (!result) {
    throw new Error('No result received from stream');
  }

  return result;
}

