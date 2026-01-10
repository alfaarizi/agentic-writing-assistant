const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface UserProfile {
  user_id: string;
  personal_info: {
    name: string;
    background?: string;
    education: any[];
    experience: any[];
    achievements: string[];
    skills: string[];
  };
  writing_preferences: {
    tone: string;
    style: string;
    common_phrases: string[];
  };
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
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!response.ok) {
    if (response.status === 409) {
      // Update existing
      const updateResponse = await fetch(`${API_BASE_URL}/profile/${profile.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (!updateResponse.ok) throw new Error('Failed to update profile');
      return updateResponse.json();
    }
    throw new Error('Failed to save profile');
  }
  return response.json();
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/${userId}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to get profile');
    return response.json();
  } catch {
    return null;
  }
}

export async function generateWriting(request: WritingRequest): Promise<WritingResponse> {
  const response = await fetch(`${API_BASE_URL}/writing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to generate writing' }));
    const detail = errorData.detail;
    
    const message = Array.isArray(detail)
      ? detail.map((err: any) => (typeof err === 'string' ? err : `${err.loc?.join('.')}: ${err.msg}`)).join(', ')
      : detail || 'Failed to generate writing';
    
    throw new Error(message);
  }
  
  return response.json();
}

