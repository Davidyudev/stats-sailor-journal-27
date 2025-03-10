
import { useToast } from '@/hooks/use-toast';
import { isElectron } from './utils';

export const useFileHandling = (
  onSuccess: () => void,
  onError?: (error: Error) => void
) => {
  const { toast } = useToast();
  const isElectronAvailable = isElectron();

  const handleFileFound = async (filePath: string) => {
    try {
      if (isElectronAvailable) {
        const result = await window.electronAPI.readFile(filePath);
        if (result.success) {
          toast({
            title: "New Trading Data Found",
            description: `Importing data from ${filePath.split(/[\\/]/).pop()}`,
          });
          
          // Here you would actually parse the file content
          console.log(`File content length: ${result.content.length} bytes`);
          
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error Processing File",
        description: "Could not process the trading data file.",
        variant: "destructive",
      });
      onError?.(error as Error);
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    try {
      let fileContent: string;
      
      if (isElectronAvailable) {
        // In Electron, we need to use the electron API to read the file
        // The path property is only available in Electron's file object
        // @ts-ignore - path exists in Electron but not in standard web File
        const filePath = file.path;
        if (!filePath) {
          throw new Error("Could not get file path");
        }
        
        const result = await window.electronAPI.readFile(filePath);
        if (result.success) {
          fileContent = result.content;
        } else {
          throw new Error(result.error || "Failed to read file");
        }
      } else {
        // Web fallback
        const reader = new FileReader();
        fileContent = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error("Could not read file"));
          reader.readAsText(file);
        });
      }
      
      // Here we would actually parse the MT4 export file
      console.log(`Successfully read ${file.name} (${fileContent.length} bytes)`);
      
      toast({
        title: "File Imported",
        description: `Successfully imported trading data from ${file.name}`,
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error parsing file:", error);
      toast({
        title: "Import Error",
        description: "Could not parse the MT4 export file.",
        variant: "destructive",
      });
      
      onError?.(new Error('Invalid file format'));
    }
  };

  return {
    handleFileFound,
    handleFileImport
  };
};
