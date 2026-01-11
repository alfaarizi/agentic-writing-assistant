import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import type { Award } from '@/lib/api';

interface AwardInputProps {
  value: Award[];
  onChange: (awards: Award[]) => void;
  disabled?: boolean;
}

export function AwardInput({ value, onChange, disabled }: AwardInputProps) {
  const addAward = () => {
    onChange([
      ...value,
      {
        title: '',
        issuer: '',
        issue_date: '',
        description: '',
        associated_with: '',
      },
    ]);
  };

  const removeAward = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateAward = (index: number, field: keyof Award, fieldValue: any) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: fieldValue };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {value.map((award, index) => (
        <div key={index} className="p-4 border-2 border-black dark:border-white rounded-lg space-y-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Award #{index + 1}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeAward(index)}
              disabled={disabled}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">
                Award Title <span className="text-destructive">*</span>
              </Label>
              <Input
                value={award.title}
                onChange={(e) => updateAward(index, 'title', e.target.value)}
                placeholder="Award name"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">
                Issuer <span className="text-destructive">*</span>
              </Label>
              <Input
                value={award.issuer}
                onChange={(e) => updateAward(index, 'issuer', e.target.value)}
                placeholder="Organization name"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Issue Date</Label>
            <Input
              type="month"
              value={award.issue_date || ''}
              onChange={(e) => updateAward(index, 'issue_date', e.target.value)}
              disabled={disabled}
              className="border-2 border-black dark:border-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Description</Label>
            <Textarea
              value={award.description || ''}
              onChange={(e) => updateAward(index, 'description', e.target.value)}
              placeholder="Description of award, reason, or significance..."
              rows={2}
              disabled={disabled}
              className="resize-none border-2 border-black dark:border-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Associated With</Label>
            <Input
              value={award.associated_with || ''}
              onChange={(e) => updateAward(index, 'associated_with', e.target.value)}
              placeholder="Related project, organization, or context"
              disabled={disabled}
              className="border-2 border-black dark:border-white"
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        onClick={addAward}
        disabled={disabled}
        className="w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Award
      </Button>
    </div>
  );
}

