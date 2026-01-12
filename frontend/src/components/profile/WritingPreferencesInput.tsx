import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import type { WritingPreferences } from '@/lib/api';
import { useState } from 'react';

interface WritingPreferencesInputProps {
  value: WritingPreferences;
  onChange: (prefs: WritingPreferences) => void;
  disabled?: boolean;
}

export function WritingPreferencesInput({ value, onChange, disabled }: WritingPreferencesInputProps) {
  const [newPhrase, setNewPhrase] = useState('');

  const addPhrase = () => {
    if (newPhrase.trim() && !(value.common_phrases || []).includes(newPhrase.trim())) {
      onChange({
        ...value,
        common_phrases: [...(value.common_phrases || []), newPhrase.trim()],
      });
      setNewPhrase('');
    }
  };

  const removePhrase = (index: number) => {
    onChange({
      ...value,
      common_phrases: (value.common_phrases || []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tone" className="text-sm">Tone</Label>
          <Select
            value={value.tone || 'professional'}
            onValueChange={(val) => onChange({ ...value, tone: val })}
            disabled={disabled}
          >
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
          <Select
            value={value.style || 'concise'}
            onValueChange={(val) => onChange({ ...value, style: val })}
            disabled={disabled}
          >
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

      <div className="space-y-2">
        <Label className="text-sm">Common Phrases</Label>
        <p className="text-xs text-muted-foreground">
          Add short expressions you frequently use (e.g., "I'm excited to", "Looking forward to")
        </p>

        <div className="flex gap-2">
          <Input
            value={newPhrase}
            onChange={(e) => setNewPhrase(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPhrase())}
            placeholder="Add a phrase..."
            disabled={disabled}
            className="border-2 border-black dark:border-white"
          />
          <Button
            type="button"
            onClick={addPhrase}
            disabled={!newPhrase.trim() || disabled}
            className="h-10 px-4"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {(value.common_phrases || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {(value.common_phrases || []).map((phrase, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20"
              >
                "{phrase}"
                <button
                  type="button"
                  onClick={() => removePhrase(index)}
                  disabled={disabled}
                  className="hover:bg-primary/20 rounded-full p-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
