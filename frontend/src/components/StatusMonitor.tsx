import { CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export interface StatusUpdate {
  stage: 'orchestrating' | 'researching' | 'writing' | 'assessing' | 'refining' | 'personalizing' | 'complete' | 'error';
  progress: number;
  message: string;
  details?: string;
  timestamp: string;
}

interface StatusMonitorProps {
  status: StatusUpdate | null;
  isActive: boolean;
}

const stageConfig = {
  orchestrating: { label: 'Orchestrating', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  researching: { label: 'Researching', color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  writing: { label: 'Writing', color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
  assessing: { label: 'Assessing', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  refining: { label: 'Refining', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  personalizing: { label: 'Personalizing', color: 'text-pink-600', bgColor: 'bg-pink-50', borderColor: 'border-pink-200' },
  complete: { label: 'Complete', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  error: { label: 'Error', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
};

export function StatusMonitor({ status, isActive }: StatusMonitorProps) {
  if (!status && !isActive) return null;

  const currentStatus = status || {
    stage: 'orchestrating' as const,
    progress: 0,
    message: 'Initializing...',
    timestamp: new Date().toISOString(),
  };

  const config = stageConfig[currentStatus.stage];
  const isLoadingStage = isActive && currentStatus.stage !== 'complete' && currentStatus.stage !== 'error';
  const Icon = isLoadingStage ? Loader2 : currentStatus.stage === 'complete' ? CheckCircle2 : currentStatus.stage === 'error' ? AlertCircle : Clock;

  return (
    <Card className={`${config.bgColor} border-2 ${config.borderColor}`}>
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${config.color} flex-shrink-0 ${isLoadingStage ? 'animate-spin' : ''}`} />
            <CardTitle className={`text-xs font-bold uppercase ${config.color}`}>
              {config.label}
            </CardTitle>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(currentStatus.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5 py-3">
        <p className="text-xs font-semibold text-foreground">{currentStatus.message}</p>
        <div className="space-y-1">
          <Progress value={currentStatus.progress} max={100} className="h-1.5" />
          <div className="flex items-center justify-between gap-2">
            {currentStatus.details && (
              <p className="text-xs text-muted-foreground">{currentStatus.details}</p>
            )}
            <p className="text-xs text-muted-foreground font-medium ml-auto">{currentStatus.progress}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
