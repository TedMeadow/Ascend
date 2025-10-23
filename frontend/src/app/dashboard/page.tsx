"use client";

import { useState } from "react";
import { Layout } from "react-grid-layout";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { DashboardGrid } from "./components/DashboardGrid";
import { ManageWidgetsDialog } from "./components/ManageWidgetsDialog";

// В будущем это будет загружаться из настроек пользователя
const initialLayout: Layout[] = [
  { i: "clock", x: 0, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
  { i: "tasks-summary", x: 4, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
];

export default function DashboardPage() {
  const [layout, setLayout] = useState<Layout[]>(initialLayout);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);

  // В будущем эта функция будет сохранять изменения на бэкенде
  const handleLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout);
    // console.log("Layout changed:", newLayout);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Your personal mission control.</p>
        </div>
        <Button variant="outline" onClick={() => setIsManageDialogOpen(true)}>
          <Settings className="mr-2 h-4 w-4" />
          Manage Widgets
        </Button>
      </div>

      <DashboardGrid layout={layout} onLayoutChange={handleLayoutChange} />
      
      <ManageWidgetsDialog
        isOpen={isManageDialogOpen}
        onOpenChange={setIsManageDialogOpen}
        currentLayout={layout}
        onLayoutChange={handleLayoutChange}
      />
    </div>
  );
}