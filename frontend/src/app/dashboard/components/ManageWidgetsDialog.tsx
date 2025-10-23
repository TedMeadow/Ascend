"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { WIDGETS, WidgetId } from "@/widgets/registry";
import { Layout } from "react-grid-layout";

interface ManageWidgetsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentLayout: Layout[];
  onLayoutChange: (layout: Layout[]) => void;
}

export function ManageWidgetsDialog({ isOpen, onOpenChange, currentLayout, onLayoutChange }: ManageWidgetsDialogProps) {
  const toggleWidget = (widgetId: WidgetId) => {
    const isEnabled = currentLayout.some(item => item.i === widgetId);
    if (isEnabled) {
      onLayoutChange(currentLayout.filter(item => item.i !== widgetId));
    } else {
      const widgetConfig = WIDGETS[widgetId];
      const newWidgetItem: Layout = {
        i: widgetId,
        x: 0,
        y: Infinity, // This will cause react-grid-layout to place it at the bottom
        ...widgetConfig.defaultLayout,
      };
      onLayoutChange([...currentLayout, newWidgetItem]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Widgets</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {Object.entries(WIDGETS).map(([id, { name }]) => (
            <div key={id} className="flex items-center justify-between">
              <label htmlFor={id} className="font-medium">{name}</label>
              <Switch
                id={id}
                checked={currentLayout.some(item => item.i === id)}
                onCheckedChange={() => toggleWidget(id as WidgetId)}
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}