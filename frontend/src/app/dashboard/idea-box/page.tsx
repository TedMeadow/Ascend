"use client";

import { useState, useEffect } from "react"; // <-- Добавляем useEffect
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { FolderList } from "./components/FolderList";
import { IdeaList } from "./components/IdeaList";
import { useIdeaBoxFolders } from "@/hooks/useIdeaBoxFolders";

export default function IdeaBoxPage() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const { folders, isLoading: isLoadingFolders } = useIdeaBoxFolders();

  // ✅ НОВЫЙ КОД: Эффект для выбора первой папки
  useEffect(() => {
    // Если папки загружены, еще не выбрана ни одна, и список не пуст
    if (!isLoadingFolders && !selectedFolderId && folders.length > 0) {
      setSelectedFolderId(folders[0].id);
    }
  }, [folders, isLoadingFolders, selectedFolderId]); // Зависимости эффекта

  const selectedFolder = folders.find(f => f.id === selectedFolderId);

  const handleSelectFolder = (folderId: string | null) => {
    setSelectedFolderId(folderId);
  };

  return (
    <div className="h-[calc(100vh-4rem)] -m-8"> 
      <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border">
        <ResizablePanel defaultSize={25} minSize={20}>
          <FolderList 
            selectedFolderId={selectedFolderId}
            onSelectFolder={handleSelectFolder} // Передаем наш новый хендлер
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          <IdeaList folderId={selectedFolderId} folderName={selectedFolder?.name} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}