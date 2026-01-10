import { Card, CardContent } from '@/components/ui/card';

interface MetricItem {
  label: string;
  value: string | number;
  subtext?: string;
  highlight?: boolean;
}

interface MetricsGridProps {
  metrics: MetricItem[];
  title?: string;
  columns?: 2 | 3 | 4 | 6;
}

export function MetricsGrid({ metrics, title, columns = 3 }: MetricsGridProps) {
  const gridClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  }[columns];

  return (
    <div className="space-y-4">
      {title && <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</h3>}
      <div className={`grid ${gridClass} gap-3`}>
        {metrics.map((metric, idx) => (
          <Card key={idx} className={metric.highlight ? 'border-2 border-primary bg-primary/5' : ''}>
            <CardContent className="pt-6 pb-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-tight">{metric.label}</p>
                <p className={`text-3xl font-bold ${metric.highlight ? 'text-primary' : ''}`}>
                  {metric.value}
                </p>
                {metric.subtext && <p className="text-xs text-muted-foreground mt-1">{metric.subtext}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

