import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import type { Volunteering } from '@/lib/api';

interface VolunteeringInputProps {
  value: Volunteering[];
  onChange: (volunteering: Volunteering[]) => void;
  disabled?: boolean;
}

export function VolunteeringInput({ value, onChange, disabled }: VolunteeringInputProps) {
  const addVolunteering = () => {
    onChange([
      ...value,
      {
        organization: '',
        role: '',
        cause: '',
        start_date: '',
        end_date: '',
        description: '',
      },
    ]);
  };

  const removeVolunteering = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateVolunteering = (index: number, field: keyof Volunteering, fieldValue: any) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: fieldValue };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {value.map((vol, index) => (
        <div key={index} className="p-4 border-2 border-black dark:border-white rounded-lg space-y-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Volunteering #{index + 1}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeVolunteering(index)}
              disabled={disabled}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">
                Organization <span className="text-destructive">*</span>
              </Label>
              <Input
                value={vol.organization}
                onChange={(e) => updateVolunteering(index, 'organization', e.target.value)}
                placeholder="Organization name"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">
                Role <span className="text-destructive">*</span>
              </Label>
              <Input
                value={vol.role}
                onChange={(e) => updateVolunteering(index, 'role', e.target.value)}
                placeholder="Volunteer position"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Cause</Label>
            <Input
              value={vol.cause || ''}
              onChange={(e) => updateVolunteering(index, 'cause', e.target.value)}
              placeholder="Cause, mission, or focus area"
              disabled={disabled}
              className="border-2 border-black dark:border-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Start Date</Label>
              <Input
                type="month"
                value={vol.start_date || ''}
                onChange={(e) => updateVolunteering(index, 'start_date', e.target.value)}
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">End Date</Label>
              <Input
                type="month"
                value={vol.end_date || ''}
                onChange={(e) => updateVolunteering(index, 'end_date', e.target.value)}
                placeholder="Leave empty if ongoing"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Description</Label>
            <Textarea
              value={vol.description || ''}
              onChange={(e) => updateVolunteering(index, 'description', e.target.value)}
              placeholder="Description of volunteer work, responsibilities, impact..."
              rows={3}
              disabled={disabled}
              className="resize-none border-2 border-black dark:border-white"
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        onClick={addVolunteering}
        disabled={disabled}
        className="w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Volunteering
      </Button>
    </div>
  );
}

