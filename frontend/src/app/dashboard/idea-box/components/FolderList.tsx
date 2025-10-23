"use client";

import { useState } from "react";
import { useIdeaBoxFolders } from "@/hooks/useIdeaBoxFolders";
import { Button } from "@/components/ui/button";
import { Folder, PlusCircle } from "lucide-react";
import { IconRenderer } from "@/components/IconRenderer"; // <-- Импортируем наш компонент
import { IdeaFolder, FolderCreate, FolderUpdate } from "@/types";
import { FolderForm } from "./FolderForm";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FolderListProps {
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

export function FolderList({ selectedFolderId, onSelectFolder }: FolderListProps) {
  const { folders, isLoading, error, createFolder, updateFolder, deleteFolder } = useIdeaBoxFolders();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<IdeaFolder | null>(null);

  const handleOpenCreateForm = () => {
    setEditingFolder(null);
    setIsFormOpen(true);
  };
  
  const handleOpenEditForm = (folder: IdeaFolder) => {
    setEditingFolder(folder);
    setIsFormOpen(true);
  };

  const handleDeleteFolder = (folderId: string) => {
    deleteFolder(folderId);
    // Если удаляем выбранную папку, сбрасываем выбор
    if (selectedFolderId === folderId) {
      onSelectFolder(null);
    }
  };

  const handleSubmit = (data: FolderCreate | FolderUpdate) => {
    if (editingFolder) {
      updateFolder({ folderId: editingFolder.id, data });
    } else {
      createFolder(data as FolderCreate);
    }
    setIsFormOpen(false);
  };

  if (isLoading) return <div className="p-4 text-center">Loading folders...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Failed to load folders.</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Folders ({folders.length})</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <AlertDialog>
          {folders.map((folder) => (
            <ContextMenu key={folder.id}>
              <ContextMenuTrigger className="w-full rounded-md">
                <Button
                  key={folder.id}
                  variant={selectedFolderId === folder.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => onSelectFolder(folder.id)}
                >
                  {/* ✅ ИЗМЕНЕНИЕ: Заменяем старый span на новый компонент */}
                  <IconRenderer 
                    name={folder.icon} 
                    fallback={<Folder className="h-4 w-4" />} 
                    className="mr-2 h-4 w-4"
                  />
                  <span className="truncate">{folder.name}</span>
                </Button>
              </ContextMenuTrigger>
              
              <ContextMenuContent>
                <ContextMenuItem onClick={() => handleOpenEditForm(folder)}>
                  Edit
                </ContextMenuItem>
                <AlertDialogTrigger asChild>
                  <ContextMenuItem className="text-red-500">
                    Delete
                  </ContextMenuItem>
                </AlertDialogTrigger>
              </ContextMenuContent>

              {/* 
                Этот диалог связан с триггером выше. 
                Он один на всю обертку AlertDialog, но его содержимое будет динамическим 
                благодаря тому, что он находится внутри .map() и имеет доступ к `folder`.
              */}
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the "{folder.name}" folder. All ideas inside it will also be deleted. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteFolder(folder.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </ContextMenu>
          ))}
        </AlertDialog>

        {folders.length === 0 && (
          <p className="p-4 text-sm text-center text-gray-500">
            No folders yet. Create one below!
          </p>
        )}
      </div>

      <div className="p-2 border-t">
        <Button variant="outline" className="w-full" onClick={handleOpenCreateForm}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Folder
        </Button>
      </div>

      <FolderForm 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSubmit={handleSubmit} 
        folder={editingFolder} 
      />
    </div>
  );
}