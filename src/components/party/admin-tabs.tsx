"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import * as React from "react";

interface TabItem {
  id: string;
  label: string;
}

interface AdminTabsProps {
  tabs: TabItem[];
  defaultTabId?: string;
  children: React.ReactNode;
}

interface AdminTabPanelProps {
  id: string;
  children: React.ReactNode;
}

export function AdminTabPanel({ children }: AdminTabPanelProps) {
  return <>{children}</>;
}

export function AdminTabs({ tabs, defaultTabId, children }: AdminTabsProps) {
  const initialTabId = defaultTabId ?? tabs[0]?.id ?? "";
  const [activeId, setActiveId] = useState(initialTabId);

  // No useMemo needed - React.Children.toArray is cheap and
  // children reference changes on every render anyway
  const panels = React.Children.toArray(children);

  return (
    <div className="space-y-6">
      <div role="tablist" className="border-b border-gray-200">
        <div className="flex flex-wrap gap-6 sm:gap-8">
          {tabs.map((tab) => {
            const isActive = tab.id === activeId;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-controls={`panel-${tab.id}`}
                aria-selected={isActive}
                onClick={() => setActiveId(tab.id)}
                className={cn(
                  "pb-3 text-[1.05rem] font-semibold transition-colors border-b-2 px-1",
                  isActive
                    ? "text-neighbor-orange border-neighbor-orange"
                    : "text-neighbor-stone border-transparent hover:text-neighbor-orange/80"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        {panels.map((panel, index) => {
          if (!React.isValidElement(panel)) return null;
          const panelId = (panel.props as { id?: string }).id;
          if (!panelId) return null;
          const isActive = panelId === activeId;

          return (
            <div
              key={panelId || index}
              role="tabpanel"
              id={`panel-${panelId}`}
              aria-labelledby={`tab-${panelId}`}
              hidden={!isActive}
              className={cn("space-y-4", !isActive && "hidden")}
            >
              {panel}
            </div>
          );
        })}
      </div>
    </div>
  );
}
