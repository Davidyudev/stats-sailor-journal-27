
import { MountTransition } from '@/components/ui/mt4-connector';

export const EmptyState = () => {
  return (
    <MountTransition className="glass-card rounded-lg w-full lg:w-96 p-4 flex items-center justify-center h-64">
      <div className="text-center text-muted-foreground">
        <p>Select a trade to view details</p>
      </div>
    </MountTransition>
  );
};
