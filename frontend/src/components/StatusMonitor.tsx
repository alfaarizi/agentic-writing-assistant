import { CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  agentData?: Record<string, any>;
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

const agentLabels: Record<string, string> = {
  researching: 'Research Agent',
  writing: 'Writing Agent',
  personalizing: 'Personalization Agent',
  refining: 'Editing Agent',
  assessing: 'Quality Assurance Agent',
};

function formatAgentData(data: any): string {
  if (typeof data === 'string') {
    return data;
  }
  return JSON.stringify(data, null, 2);
}

export function StatusMonitor({ status, isActive, agentData = {} }: StatusMonitorProps) {
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

  const agentsWithData = Object.keys(agentData).filter(stage => agentData[stage] !== undefined);

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

        {agentsWithData.length > 0 && (
          <div className="border-t border-border pt-2 mt-2">
            <Accordion type="multiple" className="w-full">
              {agentsWithData.map((stage) => (
                <AccordionItem key={stage} value={stage}>
                  <AccordionTrigger className="text-xs py-2">
                    {agentLabels[stage] || stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs">
                    <ScrollArea className="h-40 border border-border bg-background/50 rounded">
                      <pre className="p-3 text-xs whitespace-pre-wrap break-words">
                        {formatAgentData(agentData[stage])}
                      </pre>
                    </ScrollArea>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
