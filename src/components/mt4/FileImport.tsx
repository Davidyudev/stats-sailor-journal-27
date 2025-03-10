
import React from 'react';

interface FileImportProps {
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileImport: React.FC<FileImportProps> = ({
  fileInputRef,
  handleFileImport
}) => {
  return (
    <div className="border rounded-md p-3 bg-muted/20">
      <h4 className="font-medium mb-2 text-sm">Import From File</h4>
      <p className="text-xs text-muted-foreground mb-3">
        Import trading data directly from an MT4 export file
      </p>
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileImport}
          accept=".csv,.txt,.html,.htm"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full"
        >
          Select MT4 Export File
        </button>
      </div>
    </div>
  );
};
