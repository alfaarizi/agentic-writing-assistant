import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Type, BarChart3, CheckCircle2 } from 'lucide-react';

interface Stat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

interface StatsGridProps {
  stats: Stat[];
  columns?: number;
}

export function StatsGrid({ stats, columns = 3 }: StatsGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  }[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {stats.map((stat, idx) => (
        <Card key={idx} className="border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export const defaultStats = {
  wordCount: (words: number) => ({
    label: 'Words',
    value: words,
    icon: <Type className="w-5 h-5" />,
    color: 'bg-blue-100 text-blue-600',
  }),
  characterCount: (chars: number) => ({
    label: 'Characters',
    value: chars,
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'bg-purple-100 text-purple-600',
  }),
  qualityScore: (score: number) => ({
    label: 'Quality Score',
    value: `${score.toFixed(1)}%`,
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: 'bg-green-100 text-green-600',
  }),
  estimatedPages: (pages: number) => ({
    label: 'Pages',
    value: pages.toFixed(2),
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'bg-orange-100 text-orange-600',
  }),
};

