import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import type { Project } from '@/lib/api';

interface ProjectInputProps {
  value: Project[];
  onChange: (projects: Project[]) => void;
  disabled?: boolean;
}

export function ProjectInput({ value, onChange, disabled }: ProjectInputProps) {
  const addProject = () => {
    onChange([
      ...value,
      {
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        url: '',
        skills: [],
        contributors: [],
        associated_with: '',
      },
    ]);
  };

  const removeProject = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateProject = (index: number, field: keyof Project, fieldValue: any) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: fieldValue };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {value.map((proj, index) => (
        <div key={index} className="p-4 border-2 border-black dark:border-white rounded-lg space-y-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Project #{index + 1}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeProject(index)}
              disabled={disabled}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">
                Project Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={proj.name}
                onChange={(e) => updateProject(index, 'name', e.target.value)}
                placeholder="Project name"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">URL</Label>
              <Input
                type="url"
                value={proj.url || ''}
                onChange={(e) => updateProject(index, 'url', e.target.value)}
                placeholder="https://github.com/..."
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={proj.description}
              onChange={(e) => updateProject(index, 'description', e.target.value)}
              placeholder="Project description..."
              rows={3}
              disabled={disabled}
              className="resize-none border-2 border-black dark:border-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Start Date</Label>
              <Input
                type="month"
                value={proj.start_date || ''}
                onChange={(e) => updateProject(index, 'start_date', e.target.value)}
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">End Date</Label>
              <Input
                type="month"
                value={proj.end_date || ''}
                onChange={(e) => updateProject(index, 'end_date', e.target.value)}
                placeholder="Leave empty if ongoing"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Associated With</Label>
            <Input
              value={proj.associated_with || ''}
              onChange={(e) => updateProject(index, 'associated_with', e.target.value)}
              placeholder="Company, organization, or institution"
              disabled={disabled}
              className="border-2 border-black dark:border-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Skills</Label>
              <Input
                value={proj.skills?.join(', ') || ''}
                onChange={(e) =>
                  updateProject(
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
            <div className="space-y-2">
              <Label className="text-sm">Contributors</Label>
              <Input
                value={proj.contributors?.join(', ') || ''}
                onChange={(e) =>
                  updateProject(
                    index,
                    'contributors',
                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  )
                }
                placeholder="Team members (comma-separated)"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        onClick={addProject}
        disabled={disabled}
        className="w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Project
      </Button>
    </div>
  );
}

