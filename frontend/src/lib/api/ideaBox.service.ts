import { http } from './_base';
import { Idea, IdeaFolder, FolderCreate, FolderUpdate, IdeaCreate, IdeaUpdate, TagWithCount } from '@/types';

export const ideaBoxFoldersService = {
  getAll: (): Promise<IdeaFolder[]> => {
    return http.request<IdeaFolder[]>('/idea-box/folders/');
  },
  create: (data: FolderCreate): Promise<IdeaFolder> => {
    return http.request<IdeaFolder>('/idea-box/folders/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: (folderId: string, data: FolderUpdate): Promise<IdeaFolder> => {
    return http.request<IdeaFolder>(`/idea-box/folders/${folderId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: (folderId: string): Promise<void> => {
    return http.request<void>(`/idea-box/folders/${folderId}`, {
      method: 'DELETE',
    });
  },
};

export const ideaBoxIdeasService = {
  getAll: (filters: { folder_id?: string | null; q?: string; tags?: string[] }): Promise<Idea[]> => {
    const params = new URLSearchParams();
    if (filters.folder_id) {
      params.append('folder_id', filters.folder_id);
    }
    if (filters.q) {
      params.append('q', filters.q);
    }
    if (filters.tags && filters.tags.length > 0) {
      // API ожидает несколько параметров 'tags', по одному на каждый тег
      filters.tags.forEach(tag => params.append('tags', tag));
    }
    return http.request<Idea[]>(`/idea-box/ideas?${params.toString()}`);
  },
  create: (data: IdeaCreate): Promise<Idea> => {
    return http.request<Idea>('/idea-box/ideas/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: (ideaId: string, data: IdeaUpdate): Promise<Idea> => {
    return http.request<Idea>(`/idea-box/ideas/${ideaId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: (ideaId: string): Promise<void> => {
    return http.request<void>(`/idea-box/ideas/${ideaId}`, {
      method: 'DELETE',
    });
  },
  getById: (ideaId: string): Promise<Idea> => {
    return http.request<Idea>(`/idea-box/ideas/${ideaId}`);
  },
};


export const ideaBoxTagsService = {
  getForFolder: (folderId: string): Promise<TagWithCount[]> => {
    return http.request<TagWithCount[]>(`/idea-box/folders/${folderId}/tags`);
  },
};