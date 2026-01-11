import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import type { Social } from '@/lib/api';

interface SocialInputProps {
  value: Social[];
  onChange: (socials: Social[]) => void;
  disabled?: boolean;
}

export function SocialInput({ value, onChange, disabled }: SocialInputProps) {
  const addSocial = () => {
    onChange([
      ...value,
      {
        platform: '',
        url: '',
        username: '',
      },
    ]);
  };

  const removeSocial = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateSocial = (index: number, field: keyof Social, fieldValue: any) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: fieldValue };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {value.map((social, index) => (
        <div key={index} className="p-4 border-2 border-black dark:border-white rounded-lg space-y-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Social Link #{index + 1}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeSocial(index)}
              disabled={disabled}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">
                Platform <span className="text-destructive">*</span>
              </Label>
              <Input
                value={social.platform}
                onChange={(e) => updateSocial(index, 'platform', e.target.value)}
                placeholder="LinkedIn, GitHub, Portfolio"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Username</Label>
              <Input
                value={social.username || ''}
                onChange={(e) => updateSocial(index, 'username', e.target.value)}
                placeholder="Your username or handle"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">
              URL <span className="text-destructive">*</span>
            </Label>
            <Input
              type="url"
              value={social.url}
              onChange={(e) => updateSocial(index, 'url', e.target.value)}
              placeholder="https://linkedin.com/in/..."
              disabled={disabled}
              className="border-2 border-black dark:border-white"
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        onClick={addSocial}
        disabled={disabled}
        className="w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Social Link
      </Button>
    </div>
  );
}

