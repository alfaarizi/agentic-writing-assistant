import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X, FileText, Eye, Loader2 } from 'lucide-react';
import { uploadWritingSampleFile, getWritingSamples, deleteWritingSample, type WritingSample } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WritingSampleUploadProps {
  userId: string;
  onUploadSuccess?: (sample: WritingSample) => void;
  onSamplesChange?: (samples: WritingSample[]) => void;
  disabled?: boolean;
  initialSamples?: WritingSample[];
}

interface FileWithPreview extends File {
  preview?: string;
  sampleId?: string;
}

export function WritingSampleUpload({ userId, onUploadSuccess, onSamplesChange, disabled, initialSamples }: WritingSampleUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [existingSamples, setExistingSamples] = useState<WritingSample[]>(initialSamples || []);
  const [isUploading, setIsUploading] = useState(false);
  const [previewSample, setPreviewSample] = useState<WritingSample | null>(null);
  const [error, setError] = useState<string | null>(null);
  const prevInitialSamplesRef = useRef<string>('');

  const loadExistingSamples = useCallback(async () => {
    try {
      const samples = await getWritingSamples(userId);
      setExistingSamples(samples);
    } catch (err) {
      console.error('Failed to load samples:', err);
    }
  }, [userId]);

  useEffect(() => {
    if (initialSamples !== undefined) {
      const currentKey = JSON.stringify(initialSamples);
      if (currentKey !== prevInitialSamplesRef.current) {
        prevInitialSamplesRef.current = currentKey;
        setExistingSamples(initialSamples);
      }
    } else if (userId) {
      loadExistingSamples();
    }
  }, [userId, initialSamples, loadExistingSamples]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const ext = file.name.toLowerCase().split('.').pop();
      return ['pdf', 'docx', 'txt'].includes(ext || '');
    });

    if (validFiles.length !== acceptedFiles.length) {
      setError('Some files were rejected. Only PDF, DOCX, and TXT files are supported.');
      setTimeout(() => setError(null), 5000);
    }

    setFiles(prev => [...prev, ...validFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    disabled: disabled || isUploading,
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const deleteSample = async (sampleId: string) => {
    try {
      await deleteWritingSample(userId, sampleId);
      const updatedSamples = existingSamples.filter(s => s.sample_id !== sampleId);
      setExistingSamples(updatedSamples);
      onSamplesChange?.(updatedSamples);
    } catch (err) {
      setError('Failed to delete sample');
      setTimeout(() => setError(null), 3000);
    }
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      for (const file of files) {
        let type: 'cover_letter' | 'motivational_letter' | 'email' | 'social_response' = 'email';

        if (file.name.toLowerCase().includes('cover')) type = 'cover_letter';
        else if (file.name.toLowerCase().includes('motivation')) type = 'motivational_letter';
        else if (file.name.toLowerCase().includes('email')) type = 'email';
        else if (file.name.toLowerCase().includes('social') || file.name.toLowerCase().includes('post')) type = 'social_response';

        const sample = await uploadWritingSampleFile(userId, file, type, {}, undefined);
        onUploadSuccess?.(sample);
      }

      await loadExistingSamples();
      const updatedSamples = await getWritingSamples(userId);
      setExistingSamples(updatedSamples);
      onSamplesChange?.(updatedSamples);
      setFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        } ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-sm text-muted-foreground">Drop files here...</p>
        ) : (
          <>
            <p className="text-sm font-medium mb-1">
              Drag & drop files here, or click to select
            </p>
            <p className="text-xs text-muted-foreground">
              Supports PDF, DOCX, and TXT files (max 10MB each)
            </p>
          </>
        )}
      </div>

      {/* Pending Files */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Files to Upload ({files.length})</h4>
            <Button
              onClick={uploadFiles}
              disabled={disabled || isUploading}
              size="sm"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                `Upload ${files.length} File${files.length > 1 ? 's' : ''}`
              )}
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {files.map((file, index) => (
              <Card
                key={index}
                className="relative p-3 hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 disabled:opacity-50"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="flex flex-col items-center gap-2 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <p className="text-xs font-medium truncate w-full" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Samples */}
      {existingSamples.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Uploaded Samples ({existingSamples.length})</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {existingSamples.map((sample) => {
              const getSampleTitle = () => {
                if (sample.context.job_title && sample.context.company) {
                  return `${sample.context.job_title} @ ${sample.context.company}`;
                } else if (sample.context.program_name) {
                  return sample.context.program_name;
                } else if (sample.context.scholarship_name) {
                  return sample.context.scholarship_name;
                } else if (sample.context.subject) {
                  return sample.context.subject;
                } else if (sample.context.post_content) {
                  return sample.context.post_content.substring(0, 30) + '...';
                } else {
                  const typeLabel = sample.type.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                  return typeLabel;
                }
              };

              const typeLabel = sample.type.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
              const contentPreview = sample.content
                ? sample.content.length > 150
                  ? sample.content.substring(0, 150).trim() + '...'
                  : sample.content
                : 'No content available';

              return (
                <Card
                  key={sample.sample_id}
                  className="relative p-3 hover:shadow-md transition-all border-2 group flex flex-col"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSample(sample.sample_id);
                    }}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => setPreviewSample(sample)}
                    className="w-full text-left space-y-2 flex flex-col flex-1"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                      <p className="text-xs font-semibold truncate flex-1" title={getSampleTitle()}>
                        {getSampleTitle()}
                      </p>
                      <Eye className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                    <div className="bg-muted/50 rounded-md p-2 border border-border flex-1 min-h-[80px]">
                      <p className="text-xs text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                        {contentPreview}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span>{typeLabel}</span>
                      <span>•</span>
                      <span>{new Date(sample.created_at).toLocaleDateString()}</span>
                      {sample.quality_score && (
                        <>
                          <span>•</span>
                          <span className="text-primary font-medium">{sample.quality_score}/100</span>
                        </>
                      )}
                    </div>
                  </button>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewSample} onOpenChange={() => setPreviewSample(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {previewSample?.type.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
            <div className="space-y-4">
              {previewSample?.context && Object.keys(previewSample.context).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Context</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {Object.entries(previewSample.context).map(([key, value]) => (
                      <p key={key}>
                        <span className="font-medium capitalize">{key.replace('_', ' ')}:</span> {value}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Content</h4>
                <p className="text-sm whitespace-pre-wrap">{previewSample?.content}</p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
