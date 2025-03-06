
import React from 'react';
import { Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

interface TagFilterProps {
  availableTags: string[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  className?: string;
}

export const TagFilter: React.FC<TagFilterProps> = ({
  availableTags,
  selectedTags,
  setSelectedTags,
  className,
}) => {
  const toggleTag = (tag: string) => {
    setSelectedTags(
      selectedTags.includes(tag)
        ? selectedTags.filter(t => t !== tag)
        : [...selectedTags, tag]
    );
  };

  const toggleAllTags = () => {
    if (selectedTags.length === availableTags.length) {
      setSelectedTags([]);
    } else {
      setSelectedTags([...availableTags]);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn("h-9", className)}>
          <Tag size={16} className="mr-2" />
          Tags
          {selectedTags.length > 0 && (
            <span className="ml-1 rounded-full bg-primary/20 px-1 text-xs">
              {selectedTags.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuCheckboxItem
          checked={selectedTags.length === availableTags.length && availableTags.length > 0}
          onCheckedChange={toggleAllTags}
        >
          All Tags
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuSeparator />
        
        <div className="max-h-60 overflow-y-auto">
          {availableTags.map(tag => (
            <DropdownMenuCheckboxItem
              key={tag}
              checked={selectedTags.includes(tag)}
              onCheckedChange={() => toggleTag(tag)}
            >
              {tag}
            </DropdownMenuCheckboxItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TagFilter;
