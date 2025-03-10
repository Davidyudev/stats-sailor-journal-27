
import React, { useState, useEffect } from 'react';
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
