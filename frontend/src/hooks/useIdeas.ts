"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { IdeaCreate, IdeaUpdate } from "@/types";

// ✅ ИЗМЕНЕНИЕ: Хук теперь принимает объект с фильтрами
interface UseIdeasProps {
  folderId: string | null;
  searchQuery?: string;
  selectedTags?: string[];
}

export const useIdeas = ({ folderId, searchQuery, selectedTags }: UseIdeasProps) => {
  const queryClient = useQueryClient();
  const queryKey = ['ideas', folderId, searchQuery, selectedTags]; 

  const { data: ideas, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => api.ideaBox.ideas.getAll({ 
      folder_id: folderId,
      q: searchQuery,
      tags: selectedTags,
    }),
    enabled: !!folderId,
    
    // ✅ НОВЫЙ КОД: Магия здесь
    placeholderData: (previousData) => previousData,
  });

  const onSuccess = () => {
    // Принудительно инвалидируем все запросы, связанные с идеями в этой папке,
    // чтобы TanStack Query сам решил, какие из них перезапросить.
    queryClient.invalidateQueries({ queryKey: ['ideas', folderId] });
    queryClient.invalidateQueries({ queryKey: ['idea-tags', folderId] });
  };

  const { mutate: createIdea } = useMutation({
    mutationFn: (data: IdeaCreate) => api.ideaBox.ideas.create(data),
    onSuccess: () => {
      onSuccess();
      toast.success("Idea created!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create idea.");
    },
  });
  
  const { mutate: updateIdea } = useMutation({
    mutationFn: ({ ideaId, data }: { ideaId: string, data: IdeaUpdate }) => api.ideaBox.ideas.update(ideaId, data),
    onSuccess: () => {
      onSuccess();
      toast.success("Idea updated!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update idea.");
    },
  });

  const { mutate: deleteIdea } = useMutation({
    mutationFn: (ideaId: string) => api.ideaBox.ideas.delete(ideaId),
    onSuccess: () => {
      onSuccess();
      toast.success("Idea deleted!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete idea.");
    },
  });

  return {
    ideas: ideas ?? [],
    isLoading,
    error,
    createIdea,
    updateIdea,
    deleteIdea,
  };
};