
import React from 'react';
import { Loader2 } from 'lucide-react';
import { AccountInfo, ConnectorStatus } from './utils';

interface ConnectionFormProps {
  status: ConnectorStatus;
  accountInfo: AccountInfo;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleConnect: () => void;
}

export const ConnectionForm: React.FC<ConnectionFormProps> = ({
  status,
  accountInfo,
  handleChange,
  handleConnect,
}) => {
  return (
    <div className="grid gap-1">
      <h4 className="font-medium mb-2 text-sm">Direct MT4 Connection</h4>
      <div className="grid gap-2">
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
      </div>
      
      <button
        onClick={handleConnect}
        disabled={status === 'connecting'}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 mt-2"
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
  );
};
