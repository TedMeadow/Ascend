"use client";

import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce"; // Мы создадим этот простой хук
import { useIdeas } from "@/hooks/useIdeas";
import { IdeaCard } from "./IdeaCard";
import { Idea, IdeaCreate, IdeaUpdate } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, MoreVertical, Search } from "lucide-react";
import { IdeaForm } from "./IdeaForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TagFilter } from "./TagFilter"; // <-- Импортируем

interface IdeaListProps {
  folderId: string | null;
  folderName?: string;
}

export function IdeaList({ folderId, folderName }: IdeaListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Хук для "отложенного" поиска, чтобы не делать запрос на каждое нажатие клавиши
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { ideas, isLoading, error, createIdea, updateIdea, deleteIdea } = useIdeas({
    folderId,
    searchQuery: debouncedSearchQuery,
    selectedTags,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);

  const handleToggleTag = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    );
  };

  const handleOpenCreateForm = () => {
    setEditingIdea(null);
    setIsFormOpen(true);
  };
  
  const handleOpenEditForm = (idea: Idea) => {
    setEditingIdea(idea);
    setIsFormOpen(true);
  };

  const handleSubmit = (data: IdeaCreate | IdeaUpdate) => {
    if (editingIdea) {
      updateIdea({ ideaId: editingIdea.id, data });
    } else if (folderId) {
      // API ожидает folder_id в теле запроса
      createIdea({ ...data, folder_id: folderId } as IdeaCreate);
    }
    setIsFormOpen(false);
  };

  if (!folderId) {
    return <div className="flex h-full items-center justify-center"><p className="text-gray-500">Select a folder to see your ideas.</p></div>;
  }
  if (isLoading) return <div className="p-4">Loading ideas...</div>;
  if (error) return <div className="p-4 text-red-500">Failed to load ideas.</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold truncate">{folderName || 'Ideas'} ({ideas.length})</h2>
          <Button onClick={handleOpenCreateForm}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Idea
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search ideas..." 
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <TagFilter folderId={folderId} selectedTags={selectedTags} onToggleTag={handleToggleTag} />

      <div className="flex-1 overflow-y-auto p-4 pt-0">
        {!isLoading && !error && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ideas.map((idea) => (
              <div key={idea.id} className="relative group">
                <IdeaCard idea={idea} />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {/* ✅ Кнопка вызывает handleOpenEditForm */}
                        <DropdownMenuItem onClick={() => handleOpenEditForm(idea)}>Edit</DropdownMenuItem>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete this idea. This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        {/* ✅ Кнопка вызывает deleteIdea */}
                        <AlertDialogAction onClick={() => deleteIdea(idea.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLoading && ideas.length === 0 && <p className="text-gray-500 text-center mt-8">No ideas found.</p>}
      </div>
      <IdeaForm isOpen={isFormOpen} onOpenChange={setIsFormOpen} onSubmit={handleSubmit} idea={editingIdea} />
    </div>
  );
}