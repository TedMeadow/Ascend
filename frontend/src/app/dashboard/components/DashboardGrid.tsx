"use client";

import React from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { WIDGETS, WidgetId } from '@/widgets/registry';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  layout: Layout[];
  onLayoutChange: (layout: Layout[]) => void;
}

export function DashboardGrid({ layout, onLayoutChange }: DashboardGridProps) {
  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={{ lg: layout }}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={100}
      onLayoutChange={(layout) => onLayoutChange(layout)}
    >
      {layout.map((item) => {
        const WidgetComponent = WIDGETS[item.i as WidgetId]?.component;
        if (!WidgetComponent) {
          return (
            <div key={item.i} className="bg-red-200 flex items-center justify-center">
              Widget "{item.i}" not found!
            </div>
          );
        }
        return (
          <div key={item.i} className="bg-card rounded-lg overflow-hidden">
            <WidgetComponent />
          </div>
        );
      })}
    </ResponsiveGridLayout>
  );
}