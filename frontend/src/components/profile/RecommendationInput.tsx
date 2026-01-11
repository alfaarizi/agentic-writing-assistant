import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import type { Recommendation } from '@/lib/api';

interface RecommendationInputProps {
  value: Recommendation[];
  onChange: (recommendations: Recommendation[]) => void;
  disabled?: boolean;
}

export function RecommendationInput({ value, onChange, disabled }: RecommendationInputProps) {
  const addRecommendation = () => {
    onChange([
      ...value,
      {
        name: '',
        position: '',
        relationship: '',
        message: '',
        date: '',
      },
    ]);
  };

  const removeRecommendation = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateRecommendation = (index: number, field: keyof Recommendation, fieldValue: any) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: fieldValue };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {value.map((rec, index) => (
        <div key={index} className="p-4 border-2 border-black dark:border-white rounded-lg space-y-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Recommendation #{index + 1}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeRecommendation(index)}
              disabled={disabled}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">
                Recommender Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={rec.name}
                onChange={(e) => updateRecommendation(index, 'name', e.target.value)}
                placeholder="Full name"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Position</Label>
              <Input
                value={rec.position || ''}
                onChange={(e) => updateRecommendation(index, 'position', e.target.value)}
                placeholder="Job title or position"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Relationship</Label>
              <Input
                value={rec.relationship || ''}
                onChange={(e) => updateRecommendation(index, 'relationship', e.target.value)}
                placeholder="Manager, Colleague, Professor, Client"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Date</Label>
              <Input
                type="month"
                value={rec.date || ''}
                onChange={(e) => updateRecommendation(index, 'date', e.target.value)}
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">
              Recommendation Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={rec.message}
              onChange={(e) => updateRecommendation(index, 'message', e.target.value)}
              placeholder="Recommendation text or testimonial..."
              rows={4}
              disabled={disabled}
              className="resize-none border-2 border-black dark:border-white"
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        onClick={addRecommendation}
        disabled={disabled}
        className="w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Recommendation
      </Button>
    </div>
  );
}

