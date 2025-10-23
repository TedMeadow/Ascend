"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Idea, IdeaType } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

// ✅ НОВЫЙ БЛОК ИМПОРТОВ: Добавляем все недостающие компоненты
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2, Globe } from "lucide-react";


interface IdeaCardProps {
  idea: Idea;
}

// Компонент LinkPreview (остается без изменений, так как импорты внутри него)
function LinkPreview({ idea }: { idea: Idea }) {
  const { data: updatedIdea, isLoading, isFetching, error } = useQuery({
    queryKey: ['idea', idea.id],
    queryFn: () => api.ideaBox.ideas.getById(idea.id),
    // ✅ ИЗМЕНЕНИЕ 1: Продолжаем опрос, даже если metadata есть, но image_url отсутствует.
    // Опрос остановится, как только появится image_url или после 10 попыток.
    refetchInterval: (query) => 
      (query.state.data?.link_metadata?.image_url || query.state.fetchFailureCount > 10) ? false : 2000,
    refetchOnWindowFocus: false,
  });

  if (error) {
    console.error(`Failed to refetch idea ${idea.id}:`, error);
  }

  const metadata = updatedIdea?.link_metadata || idea.link_metadata;
  const displayTitle = updatedIdea?.title || idea.title || metadata?.title || idea.url;
  const displayDescription = idea.content || metadata?.description;

  // ✅ ИЗМЕНЕНИЕ 2: Улучшенная логика отображения состояний
  const showSkeleton = (isLoading || isFetching) && !metadata;

  if (showSkeleton) {
    return (
      <div className="p-4 space-y-2">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-4 w-3/4 mt-2" />
        <Skeleton className="h-3 w-full" />
      </div>
    );
  }
  
  return (
    <a 
      href={idea.url!} // Указываем URL для перехода
      target="_blank"   // Открывать в новой вкладке
      rel="noopener noreferrer" // Лучшая практика для безопасности
      className="flex flex-col h-full hover:bg-gray-50/50 dark:hover:bg-gray-800/20 rounded-lg transition-colors"
    >
      {metadata?.image_url ? (
        <img src={metadata.image_url} alt={metadata.title || ''} className="rounded-t-lg object-cover h-32 w-full border-b" />
      ) : (
        <div className="rounded-t-lg h-32 w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Globe className="h-12 w-12 text-gray-400" />
        </div>
      )}
      <CardHeader className="flex-1"> {/* Добавляем flex-1, чтобы шапка растягивалась */}
        <CardTitle className="pt-2 text-base line-clamp-2">{displayTitle}</CardTitle>
      </CardHeader>
      {displayDescription && (
        <CardContent>
          <p className="text-sm text-gray-500 line-clamp-3">{displayDescription}</p>
        </CardContent>
      )}
    </a>
  );
}


// Основной компонент IdeaCard
export function IdeaCard({ idea }: IdeaCardProps) {
  return (
    <Card>
      {idea.idea_type === 'link' ? (
        <LinkPreview idea={idea} />
      ) : (
        <>
          <CardHeader>
            <CardTitle>{idea.title || 'Untitled Idea'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 line-clamp-3">{idea.content}</p>
          </CardContent>
        </>
      )}
      <CardFooter className="flex justify-between items-center pt-4">
        <div className="flex gap-2 flex-wrap">
          {idea.tags.map(tag => (
            <Badge key={tag.id} variant="outline">{tag.name}</Badge>
          ))}
        </div>
        {idea.idea_type === 'link' && <Link2 className="h-4 w-4 text-gray-400" />}
      </CardFooter>
    </Card>
  );
}