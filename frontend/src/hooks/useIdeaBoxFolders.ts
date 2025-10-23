"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { FolderCreate, FolderUpdate } from "@/types";

const FOLDERS_QUERY_KEY = ['idea-folders'];

export const useIdeaBoxFolders = () => {
  const queryClient = useQueryClient();

  const { data: folders, isLoading, error } = useQuery({
    queryKey: FOLDERS_QUERY_KEY,
    queryFn: api.ideaBox.folders.getAll,
  });

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: FOLDERS_QUERY_KEY });
  };

  const { mutate: createFolder } = useMutation({
    mutationFn: (data: FolderCreate) => api.ideaBox.folders.create(data),
    onSuccess: () => {
      onSuccess();
      toast.success("Folder created!");
    },
    onError: (err) => toast.error(err.message || "Failed to create folder."),
  });

  // ✅ НОВЫЙ КОД
  const { mutate: updateFolder } = useMutation({
    mutationFn: ({ folderId, data }: { folderId: string, data: FolderUpdate }) => 
      api.ideaBox.folders.update(folderId, data),
    onSuccess: () => {
      onSuccess();
      toast.success("Folder updated!");
    },
    onError: (err) => toast.error(err.message || "Failed to update folder."),
  });

  const { mutate: deleteFolder } = useMutation({
    mutationFn: (folderId: string) => api.ideaBox.folders.delete(folderId),
    onSuccess: () => {
      onSuccess();
      toast.success("Folder deleted!");
    },
    onError: (err) => toast.error(err.message || "Failed to delete folder."),
  });

  return {
    folders: folders ?? [],
    isLoading,
    error,
    createFolder,
    updateFolder, // <-- Возвращаем
    deleteFolder, // <-- Возвращаем
  };
};