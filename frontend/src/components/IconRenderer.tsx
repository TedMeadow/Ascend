"use client";

import { createElement } from 'react';
import { icons } from 'lucide-react';

interface IconRendererProps {
  name: string | null | undefined;
  fallback?: React.ReactNode;
  className?: string;
}

// Функция для преобразования 'folder-open' в 'FolderOpen'
const toPascalCase = (str: string) => {
  return str.replace(/(^\w|-\w)/g, (text) => text.replace(/-/, "").toUpperCase());
};

export function IconRenderer({ name, fallback, className }: IconRendererProps) {
  if (!name) {
    return <>{fallback}</>;
  }

  const IconComponent = icons[toPascalCase(name) as keyof typeof icons];

  if (!IconComponent) {
    return <>{fallback}</>;
  }

  return createElement(IconComponent, { className });
}