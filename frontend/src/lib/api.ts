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
  // Check if profile exists first
  const exists = await getProfile(profile.user_id);
  
  // Use PUT if exists, POST if new
  const method = exists ? 'PUT' : 'POST';
  const url = exists ? `${API_BASE_URL}/profile/${profile.user_id}` : `${API_BASE_URL}/profile`;
  
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
    const response = await fetch(`${API_BASE_URL}/profile/${userId}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to get profile');
    return response.json();
  } catch {
    return null;
  }
}

export type StatusListener = (update: { stage: string; progress: number; message: string; timestamp: string } | { type: 'complete'; data: WritingResponse }) => void;

export async function generateWriting(request: WritingRequest, onStatus?: StatusListener): Promise<WritingResponse> {
  const response = await fetch(`${API_BASE_URL}/writing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to start writing stream');
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
              if (onStatus) {
                onStatus(data);
              }
            } else if (onStatus) {
              onStatus(data);
            }
          } catch {
            // Skip invalid JSON lines
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

