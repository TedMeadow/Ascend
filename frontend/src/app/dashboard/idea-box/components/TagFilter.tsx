"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagFilterProps {
  folderId: string;
  selectedTags: string[];
  onToggleTag: (tagName: string) => void;
}

export function TagFilter({ folderId, selectedTags, onToggleTag }: TagFilterProps) {
  const { data: tags, isLoading } = useQuery({
    queryKey: ['idea-tags', folderId],
    queryFn: () => api.ideaBox.tags.getForFolder(folderId),
    enabled: !!folderId,
  });

  if (isLoading || !tags || tags.length === 0) {
    return null; // Не показываем ничего, если тегов нет или идет загрузка
  }

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-4">
      {tags.map(tag => (
        <Badge
          key={tag.id}
          variant={selectedTags.includes(tag.name) ? "default" : "outline"}
          onClick={() => onToggleTag(tag.name)}
          className="cursor-pointer"
        >
          {tag.name} <span className="ml-1.5 text-xs opacity-75">{tag.idea_count}</span>
        </Badge>
      ))}
    </div>
  );
}