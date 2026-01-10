import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { WritingResponse } from '@/lib/api';

interface WritingResultProps {
  result: WritingResponse;
}

export function WritingResult({ result }: WritingResultProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.content || '');
  };

  const downloadAsText = () => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(result.content || ''));
    element.setAttribute('download', 'writing.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const isError = result.status === 'failed';
  const hasMetrics = result.assessment?.quality_metrics;
  const hasStats = result.assessment?.text_stats;

  return (
    <div className="space-y-3">
      {/* Status Alert */}
      <Alert variant={isError ? "destructive" : "success"} className={`text-xs py-2.5 px-4 ${isError ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
        <div className="flex items-start gap-2">
          {isError ? (
            <AlertCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <AlertTitle className={`text-xs font-semibold ${isError ? 'text-red-800' : 'text-green-800'}`}>
              {isError ? 'Generation Failed' : 'Successfully Generated'}
            </AlertTitle>
            <AlertDescription className={`text-xs mt-0.5 ${isError ? 'text-red-700' : 'text-green-700'}`}>
              {isError ? result.error || 'An error occurred during generation' : 'Your writing has been generated successfully'}
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {/* Generated Content */}
      {result.content && (
        <Card>
          <CardHeader className="pb-1 flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-xs font-semibold uppercase">Generated Content</CardTitle>
          <div className="flex gap-1.5">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyToClipboard} 
              className="h-7 px-2 text-xs"
              title="Copy to clipboard"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadAsText} 
              className="h-7 px-2 text-xs"
              title="Download as text"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="py-3">
            <ScrollArea className="h-48 border border-border bg-background/50 rounded">
              <div className="p-3 whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">
                {result.content}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Text Statistics */}
      {hasStats && (
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-semibold uppercase">Text Statistics</CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2.5 border border-border bg-background/50 rounded">
                <div className="text-xs font-semibold text-foreground">{hasStats.word_count}</div>
                <div className="text-xs text-muted-foreground mt-1">Words</div>
              </div>
              <div className="text-center p-2.5 border border-border bg-background/50 rounded">
                <div className="text-xs font-semibold text-foreground">{hasStats.character_count}</div>
                <div className="text-xs text-muted-foreground mt-1">Characters</div>
              </div>
              <div className="text-center p-2.5 border border-border bg-background/50 rounded">
                <div className="text-xs font-semibold text-foreground">{hasStats.paragraph_count}</div>
                <div className="text-xs text-muted-foreground mt-1">Paragraphs</div>
              </div>
              <div className="text-center p-2.5 border border-border bg-background/50 rounded">
                <div className="text-xs font-semibold text-foreground">{hasStats.estimated_pages.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground mt-1">Pages</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quality Metrics */}
      {hasMetrics && (
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-semibold uppercase">Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <div className="grid grid-cols-3 gap-2">
              <div className={`text-center p-2.5 border rounded ${hasMetrics.overall_score >= 85 ? 'border-primary/50 bg-primary/5' : 'border-border bg-background/50'}`}>
                <div className={`text-xs font-bold ${hasMetrics.overall_score >= 85 ? 'text-primary' : 'text-foreground'}`}>
                  {hasMetrics.overall_score.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Overall</div>
              </div>
              <div className="text-center p-2.5 border border-border bg-background/50 rounded">
                <div className="text-xs font-semibold text-foreground">{hasMetrics.coherence.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground mt-1">Coherence</div>
              </div>
              <div className="text-center p-2.5 border border-border bg-background/50 rounded">
                <div className="text-xs font-semibold text-foreground">{hasMetrics.naturalness.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground mt-1">Natural</div>
              </div>
              <div className="text-center p-2.5 border border-border bg-background/50 rounded">
                <div className="text-xs font-semibold text-foreground">{hasMetrics.grammar_accuracy.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground mt-1">Grammar</div>
              </div>
              <div className="text-center p-2.5 border border-border bg-background/50 rounded">
                <div className="text-xs font-semibold text-foreground">{hasMetrics.completeness.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground mt-1">Complete</div>
              </div>
              <div className="text-center p-2.5 border border-border bg-background/50 rounded">
                <div className="text-xs font-semibold text-foreground">{hasMetrics.personalization.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground mt-1">Personal</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requirements Check */}
      {result.assessment?.requirements_checks && (
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-semibold uppercase">Requirements Check</CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(result.assessment.requirements_checks).map(([key, passed]) => (
                <div 
                  key={key} 
                  className={`flex items-center gap-2 p-2.5 border rounded text-xs ${
                    passed 
                      ? 'border-green-200/50 bg-green-50' 
                      : 'border-red-200/50 bg-red-50'
                  }`}
                >
                  <span className={`flex-shrink-0 font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                    {passed ? '✓' : '×'}
                  </span>
                  <span className={`truncate font-medium text-xs ${passed ? 'text-green-800' : 'text-red-800'}`}>
                    {key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {result.suggestions && result.suggestions.length > 0 && (
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-semibold uppercase">Suggestions ({result.suggestions.length})</CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <ol className="space-y-2">
              {result.suggestions.map((suggestion, index) => (
                <li key={index} className="flex gap-2.5 text-xs">
                  <span className="flex-shrink-0 font-bold text-primary min-w-5">{index + 1}.</span>
                  <span className="text-foreground/80 leading-relaxed">{suggestion}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
