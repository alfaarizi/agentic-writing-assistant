import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import type { Skill } from '@/lib/api';

interface SkillInputProps {
  value: Skill[];
  onChange: (skills: Skill[]) => void;
  disabled?: boolean;
}

export function SkillInput({ value, onChange, disabled }: SkillInputProps) {
  const addSkill = () => {
    onChange([
      ...value,
      {
        name: '',
        proficiency: '',
        years_experience: undefined,
      },
    ]);
  };

  const removeSkill = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateSkill = (index: number, field: keyof Skill, fieldValue: any) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: fieldValue };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {value.map((skill, index) => (
        <div key={index} className="p-4 border-2 border-black dark:border-white rounded-lg space-y-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Skill #{index + 1}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeSkill(index)}
              disabled={disabled}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">
                Skill Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={skill.name}
                onChange={(e) => updateSkill(index, 'name', e.target.value)}
                placeholder="Python, React, AWS"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Proficiency</Label>
              <Select
                value={skill.proficiency || ''}
                onValueChange={(val) => updateSkill(index, 'proficiency', val)}
                disabled={disabled}
              >
                <SelectTrigger className="border-2 border-black dark:border-white">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Years of Experience</Label>
              <Input
                type="number"
                min="0"
                value={skill.years_experience || ''}
                onChange={(e) =>
                  updateSkill(
                    index,
                    'years_experience',
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                placeholder="5"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        onClick={addSkill}
        disabled={disabled}
        className="w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Skill
      </Button>
    </div>
  );
}

