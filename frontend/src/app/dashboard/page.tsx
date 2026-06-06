"use client";

import { useState, useEffect, useCallback } from "react";
import { Layout } from "react-grid-layout";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import { DashboardGrid } from "./components/DashboardGrid";
import { ManageWidgetsDialog } from "./components/ManageWidgetsDialog";

const DEFAULT_LAYOUT: Layout[] = [
  { i: "clock", x: 0, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
  { i: "tasks-summary", x: 4, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [layout, setLayout] = useState<Layout[]>(DEFAULT_LAYOUT);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (user && !initialized) {
      if (user.dashboard_layout && user.dashboard_layout.length > 0) {
        setLayout(user.dashboard_layout);
      }
      setInitialized(true);
    }
  }, [user, initialized]);

  const debouncedLayout = useDebounce(layout, 800);

  useEffect(() => {
    if (!initialized) return;
    api.auth.saveDashboardLayout(debouncedLayout).catch(() => {});
  }, [debouncedLayout, initialized]);

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    setLayout(newLayout);
  }, []);

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
