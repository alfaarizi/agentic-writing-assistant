import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import type { Education } from '@/lib/api';

interface EducationInputProps {
  value: Education[];
  onChange: (education: Education[]) => void;
  disabled?: boolean;
}

export function EducationInput({ value, onChange, disabled }: EducationInputProps) {
  const addEducation = () => {
    onChange([
      ...value,
      {
        school: '',
        degree: '',
        field_of_study: '',
        start_date: '',
        end_date: '',
        grade: '',
        activities: '',
        description: '',
        skills: [],
      },
    ]);
  };

  const removeEducation = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof Education, fieldValue: any) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: fieldValue };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {value.map((edu, index) => (
        <div key={index} className="p-4 border-2 border-black dark:border-white rounded-lg space-y-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Education #{index + 1}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeEducation(index)}
              disabled={disabled}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">
                School <span className="text-destructive">*</span>
              </Label>
              <Input
                value={edu.school}
                onChange={(e) => updateEducation(index, 'school', e.target.value)}
                placeholder="University name"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">
                Degree <span className="text-destructive">*</span>
              </Label>
              <Input
                value={edu.degree}
                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                placeholder="Bachelor of Science"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Field of Study</Label>
            <Input
              value={edu.field_of_study || ''}
              onChange={(e) => updateEducation(index, 'field_of_study', e.target.value)}
              placeholder="Computer Science"
              disabled={disabled}
              className="border-2 border-black dark:border-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Start Date</Label>
              <Input
                type="month"
                value={edu.start_date || ''}
                onChange={(e) => updateEducation(index, 'start_date', e.target.value)}
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">End Date</Label>
              <Input
                type="month"
                value={edu.end_date || ''}
                onChange={(e) => updateEducation(index, 'end_date', e.target.value)}
                placeholder="Leave empty if ongoing"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Grade/GPA</Label>
              <Input
                value={edu.grade || ''}
                onChange={(e) => updateEducation(index, 'grade', e.target.value)}
                placeholder="3.9/4.0"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Activities</Label>
            <Input
              value={edu.activities || ''}
              onChange={(e) => updateEducation(index, 'activities', e.target.value)}
              placeholder="Extracurricular activities, clubs, organizations"
              disabled={disabled}
              className="border-2 border-black dark:border-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Description</Label>
            <Textarea
              value={edu.description || ''}
              onChange={(e) => updateEducation(index, 'description', e.target.value)}
              placeholder="Thesis topic, notable coursework, achievements..."
              rows={2}
              disabled={disabled}
              className="resize-none border-2 border-black dark:border-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Skills</Label>
            <Input
              value={edu.skills?.join(', ') || ''}
              onChange={(e) =>
                updateEducation(
                  index,
                  'skills',
                  e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                )
              }
              placeholder="Python, Machine Learning, Research (comma-separated)"
              disabled={disabled}
              className="border-2 border-black dark:border-white"
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        onClick={addEducation}
        disabled={disabled}
        className="w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Education
      </Button>
    </div>
  );
}

