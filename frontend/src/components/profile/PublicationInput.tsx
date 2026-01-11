import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import type { Publication } from '@/lib/api';

interface PublicationInputProps {
  value: Publication[];
  onChange: (publications: Publication[]) => void;
  disabled?: boolean;
}

export function PublicationInput({ value, onChange, disabled }: PublicationInputProps) {
  const addPublication = () => {
    onChange([
      ...value,
      {
        title: '',
        publisher: '',
        publication_date: '',
        url: '',
        description: '',
        authors: [],
      },
    ]);
  };

  const removePublication = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updatePublication = (index: number, field: keyof Publication, fieldValue: any) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: fieldValue };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {value.map((pub, index) => (
        <div key={index} className="p-4 border-2 border-black dark:border-white rounded-lg space-y-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Publication #{index + 1}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removePublication(index)}
              disabled={disabled}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              value={pub.title}
              onChange={(e) => updatePublication(index, 'title', e.target.value)}
              placeholder="Publication title"
              disabled={disabled}
              className="border-2 border-black dark:border-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Publisher</Label>
              <Input
                value={pub.publisher || ''}
                onChange={(e) => updatePublication(index, 'publisher', e.target.value)}
                placeholder="Journal, conference, or platform"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Publication Date</Label>
              <Input
                type="month"
                value={pub.publication_date || ''}
                onChange={(e) => updatePublication(index, 'publication_date', e.target.value)}
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">URL</Label>
            <Input
              type="url"
              value={pub.url || ''}
              onChange={(e) => updatePublication(index, 'url', e.target.value)}
              placeholder="https://..."
              disabled={disabled}
              className="border-2 border-black dark:border-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Description</Label>
            <Textarea
              value={pub.description || ''}
              onChange={(e) => updatePublication(index, 'description', e.target.value)}
              placeholder="Abstract, summary, or description..."
              rows={2}
              disabled={disabled}
              className="resize-none border-2 border-black dark:border-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Authors</Label>
            <Input
              value={pub.authors?.join(', ') || ''}
              onChange={(e) =>
                updatePublication(
                  index,
                  'authors',
                  e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                )
              }
              placeholder="Author names (comma-separated)"
              disabled={disabled}
              className="border-2 border-black dark:border-white"
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        onClick={addPublication}
        disabled={disabled}
        className="w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Publication
      </Button>
    </div>
  );
}

