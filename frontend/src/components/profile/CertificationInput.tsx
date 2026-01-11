import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import type { Certification } from '@/lib/api';

interface CertificationInputProps {
  value: Certification[];
  onChange: (certifications: Certification[]) => void;
  disabled?: boolean;
}

export function CertificationInput({ value, onChange, disabled }: CertificationInputProps) {
  const addCertification = () => {
    onChange([
      ...value,
      {
        name: '',
        issuer: '',
        issue_date: '',
        expiration_date: '',
        credential_id: '',
        credential_url: '',
        skills: [],
      },
    ]);
  };

  const removeCertification = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateCertification = (index: number, field: keyof Certification, fieldValue: any) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: fieldValue };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {value.map((cert, index) => (
        <div key={index} className="p-4 border-2 border-black dark:border-white rounded-lg space-y-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Certification #{index + 1}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeCertification(index)}
              disabled={disabled}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">
                Certification Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={cert.name}
                onChange={(e) => updateCertification(index, 'name', e.target.value)}
                placeholder="AWS Certified Solutions Architect"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">
                Issuer <span className="text-destructive">*</span>
              </Label>
              <Input
                value={cert.issuer}
                onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                placeholder="Amazon Web Services"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Issue Date</Label>
              <Input
                type="month"
                value={cert.issue_date || ''}
                onChange={(e) => updateCertification(index, 'issue_date', e.target.value)}
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Expiration Date</Label>
              <Input
                type="month"
                value={cert.expiration_date || ''}
                onChange={(e) => updateCertification(index, 'expiration_date', e.target.value)}
                placeholder="Leave empty if no expiration"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Credential ID</Label>
              <Input
                value={cert.credential_id || ''}
                onChange={(e) => updateCertification(index, 'credential_id', e.target.value)}
                placeholder="License or certification number"
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Credential URL</Label>
              <Input
                type="url"
                value={cert.credential_url || ''}
                onChange={(e) => updateCertification(index, 'credential_url', e.target.value)}
                placeholder="https://..."
                disabled={disabled}
                className="border-2 border-black dark:border-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Skills</Label>
            <Input
              value={cert.skills?.join(', ') || ''}
              onChange={(e) =>
                updateCertification(
                  index,
                  'skills',
                  e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                )
              }
              placeholder="AWS, Cloud Architecture (comma-separated)"
              disabled={disabled}
              className="border-2 border-black dark:border-white"
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        onClick={addCertification}
        disabled={disabled}
        className="w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Certification
      </Button>
    </div>
  );
}

