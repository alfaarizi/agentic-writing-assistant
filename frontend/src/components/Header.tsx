import { useEffect, useState } from 'react';
import { Circle, Github } from 'lucide-react';
import { checkHealth } from '@/lib/api';

export function Header() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      const isHealthy = await checkHealth();
      setConnected(isHealthy);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-12 md:px-20 py-4">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-base font-bold tracking-tight flex items-center gap-2">
              <span>✍️</span>
              <span>Writing Assistant</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <a
              href="https://github.com/alfaarizi/agentic-writing-assistant"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="View on GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <div className="flex items-center gap-2 text-xs">
              <Circle className={`h-2 w-2 ${connected ? 'fill-green-600 text-green-600' : 'fill-red-600 text-red-600'}`} />
              <span className={`font-semibold ${connected ? 'text-green-600' : 'text-red-600'}`}>
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
