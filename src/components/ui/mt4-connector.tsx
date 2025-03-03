
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MountTransitionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const MountTransition: React.FC<MountTransitionProps> = ({
  children,
  delay = 150,
  className,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        'transition-opacity duration-500 ease-in-out',
        isMounted ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      {children}
    </div>
  );
};

type ConnectorStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface MT4ConnectorProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export const MT4Connector: React.FC<MT4ConnectorProps> = ({ 
  onConnect, 
  onDisconnect,
  onError 
}) => {
  const [status, setStatus] = useState<ConnectorStatus>('idle');
  const [accountInfo, setAccountInfo] = useState({
    server: '',
    account: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConnect = () => {
    setStatus('connecting');
    
    // Simulating connection
    setTimeout(() => {
      if (accountInfo.server && accountInfo.account && accountInfo.password) {
        setStatus('connected');
        onConnect?.();
      } else {
        setStatus('error');
        onError?.(new Error('Invalid credentials'));
      }
    }, 2000);
  };

  const handleDisconnect = () => {
    setStatus('idle');
    onDisconnect?.();
  };

  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">MetaTrader 4 Connection</h3>
          <div className="flex items-center">
            {status === 'connected' ? (
              <div className="h-2 w-2 rounded-full bg-profit mr-2"></div>
            ) : status === 'error' ? (
              <div className="h-2 w-2 rounded-full bg-loss mr-2"></div>
            ) : (
              <div className="h-2 w-2 rounded-full bg-neutral mr-2"></div>
            )}
            <span className="text-sm">
              {status === 'idle' && 'Not Connected'}
              {status === 'connecting' && 'Connecting...'}
              {status === 'connected' && 'Connected'}
              {status === 'error' && 'Connection Error'}
            </span>
          </div>
        </div>

        {status !== 'connected' && (
          <div className="grid gap-3">
            <div className="grid gap-1">
              <label className="text-sm font-medium" htmlFor="server">
                MT4 Server
              </label>
              <input
                id="server"
                name="server"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={accountInfo.server}
                onChange={handleChange}
                placeholder="broker.mt4server.com"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-medium" htmlFor="account">
                Account Number
              </label>
              <input
                id="account"
                name="account"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={accountInfo.account}
                onChange={handleChange}
                placeholder="12345678"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={accountInfo.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>
            
            <button
              onClick={handleConnect}
              disabled={status === 'connecting'}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
            >
              {status === 'connecting' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : status === 'error' ? (
                'Retry Connection'
              ) : (
                'Connect to MT4'
              )}
            </button>
          </div>
        )}

        {status === 'connected' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Server:</span>
              <span className="font-medium">{accountInfo.server}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Account:</span>
              <span className="font-medium">****{accountInfo.account.slice(-4)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Last Sync:</span>
              <span className="font-medium">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
            <button
              onClick={handleDisconnect}
              className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
