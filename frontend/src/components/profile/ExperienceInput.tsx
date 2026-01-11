import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import type { Experience } from '@/lib/api';

interface ExperienceInputProps {
  value: Experience[];
  onChange: (experience: Experience[]) => void;
  disabled?: boolean;
}

export function ExperienceInput({ value, onChange, disabled }: ExperienceInputProps) {
  const addExperience = () => {
    onChange([
      ...value,
      {
        company: '',
        position: '',
        employment_type: '',
        location: '',
        location_type: '',
        start_date: '',
        end_date: '',
        description: '',
        achievements: '',
        skills: [],
      },
    ]);
  };

  const removeExperience = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof Experience, fieldValue: any) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: fieldValue };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {value.map((exp, index) => (
        <div key={index} className="p-4 border-2 border-black dark:border-white rounded-lg space-y-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Experience #{index + 1}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeExperience(index)}
              disabled={disabled}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">
                Company <span className="text-destructive">*</span>
              </Label>
              <Input
                value={exp.company}
                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                placeholder="Company name"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">
                Position <span className="text-destructive">*</span>
              </Label>
              <Input
                value={exp.position}
                onChange={(e) => updateExperience(index, 'position', e.target.value)}
                placeholder="Job title"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Employment Type</Label>
              <Select
                value={exp.employment_type || ''}
                onValueChange={(val) => updateExperience(index, 'employment_type', val)}
                disabled={disabled}
              >
                <SelectTrigger className="border-2 border-black dark:border-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full-time</SelectItem>
                  <SelectItem value="part_time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="self_employed">Self-employed</SelectItem>
                  <SelectItem value="apprenticeship">Apprenticeship</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Location</Label>
                <Input
                  value={exp.location || ''}
                  onChange={(e) => updateExperience(index, 'location', e.target.value)}
                  placeholder="City, Country"
                  disabled={disabled}
                  className="border-2 border-black dark:border-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Location Type</Label>
                <Select
                  value={exp.location_type || ''}
                  onValueChange={(val) => updateExperience(index, 'location_type', val)}
                  disabled={disabled}
                >
                  <SelectTrigger className="border-2 border-black dark:border-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on_site">On-site</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Start Date</Label>
              <Input
                type="month"
                value={exp.start_date || ''}
                onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">End Date</Label>
              <Input
                type="month"
                value={exp.end_date || ''}
                onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                placeholder="Leave empty if current"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Description</Label>
            <Textarea
              value={exp.description || ''}
              onChange={(e) => updateExperience(index, 'description', e.target.value)}
              placeholder="Job description, responsibilities overview..."
              rows={2}
              disabled={disabled}
              className="resize-none border-2 border-black dark:border-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Achievements</Label>
            <Textarea
              value={exp.achievements || ''}
              onChange={(e) => updateExperience(index, 'achievements', e.target.value)}
              placeholder="Key accomplishments and results...&#10;&#10;• Led team of 5 engineers&#10;• Built ML pipeline processing 10M events/day&#10;• Increased system efficiency by 40%"
              rows={3}
              disabled={disabled}
              className="resize-none border-2 border-black dark:border-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Skills</Label>
            <Input
              value={exp.skills?.join(', ') || ''}
              onChange={(e) =>
                updateExperience(
                  index,
                  'skills',
                  e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                )
              }
              placeholder="Python, React, AWS (comma-separated)"
              disabled={disabled}
              className="border-2 border-black dark:border-white"
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        onClick={addExperience}
        disabled={disabled}
        className="w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Experience
      </Button>
    </div>
  );
}

