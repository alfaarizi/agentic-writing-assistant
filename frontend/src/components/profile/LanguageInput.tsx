import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import type { Language } from '@/lib/api';

interface LanguageInputProps {
  value: Language[];
  onChange: (languages: Language[]) => void;
  disabled?: boolean;
}

export function LanguageInput({ value, onChange, disabled }: LanguageInputProps) {
  const addLanguage = () => {
    onChange([
      ...value,
      {
        name: '',
        proficiency: '',
      },
    ]);
  };

  const removeLanguage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateLanguage = (index: number, field: keyof Language, fieldValue: any) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: fieldValue };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {value.map((lang, index) => (
        <div key={index} className="p-4 border-2 border-black dark:border-white rounded-lg space-y-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Language #{index + 1}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeLanguage(index)}
              disabled={disabled}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">
                Language Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={lang.name}
                onChange={(e) => updateLanguage(index, 'name', e.target.value)}
                placeholder="English, Spanish, French"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Proficiency</Label>
              <Select
                value={lang.proficiency || ''}
                onValueChange={(val) => updateLanguage(index, 'proficiency', val)}
                disabled={disabled}
              >
                <SelectTrigger className="border-2 border-black dark:border-white">
                  <SelectValue placeholder="Select proficiency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="native">Native</SelectItem>
                  <SelectItem value="full_professional">Full Professional</SelectItem>
                  <SelectItem value="professional_working">Professional Working</SelectItem>
                  <SelectItem value="limited_working">Limited Working</SelectItem>
                  <SelectItem value="elementary">Elementary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        onClick={addLanguage}
        disabled={disabled}
        className="w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Language
      </Button>
    </div>
  );
}

