
import * as React from "react";
import { CheckIcon, PlusCircle, Tag, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface TagFilterProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  className?: string;
}

export function TagFilter({ 
  availableTags, 
  selectedTags, 
  onTagsChange,
  className 
}: TagFilterProps) {
  const [open, setOpen] = React.useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="border-dashed">
            <Tag className="mr-2 h-4 w-4" />
            <span>Filter by Tags</span>
            {selectedTags.length > 0 && (
              <>
                <span className="mx-1">·</span>
                <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                  {selectedTags.length}
                </Badge>
                <div className="hidden space-x-1 lg:flex">
                  {selectedTags.length > 2 ? (
                    <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                      {selectedTags.length} selected
                    </Badge>
                  ) : (
                    selectedTags.map((tag) => (
                      <Badge
                        variant="secondary"
                        key={tag}
                        className="rounded-sm px-1 font-normal"
                      >
                        {tag}
                      </Badge>
                    ))
                  )}
                </div>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandList>
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <CommandItem
                      key={tag}
                      onSelect={() => toggleTag(tag)}
                      className="flex items-center justify-between"
                    >
                      {tag}
                      {isSelected && <CheckIcon className="h-4 w-4" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {selectedTags.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => onTagsChange([])}
                      className="justify-center text-center"
                    >
                      Clear Tags
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleTag(tag)}
              />
            </Badge>
          ))}
          {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-2 text-xs"
              onClick={() => onTagsChange([])}
            >
              Clear All
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
