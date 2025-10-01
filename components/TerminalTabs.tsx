"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";

import type { TerminalDemoProps } from "./TerminalDemo";
import {
  DEFAULT_THEME_ID,
  TERMINAL_THEMES,
  type TerminalThemeId,
} from "./terminalThemes";

const TerminalPanel = dynamic<TerminalDemoProps>(
  () => import("./TerminalDemo"),
  {
    ssr: false,
  }
);

type TerminalTab = {
  id: number;
  name: string;
  themeId: TerminalThemeId;
};

const buildDefaultName = (index: number) => `Terminal ${index}`;

const TerminalTabs = () => {
  const [tabs, setTabs] = useState<TerminalTab[]>([
    {
      id: 1,
      name: buildDefaultName(1),
      themeId: DEFAULT_THEME_ID,
    },
  ]);
  const [activeId, setActiveId] = useState<number>(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftName, setDraftName] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const idCounter = useRef(2);

  const handleAddTab = () => {
    setTabs((prev) => {
      const nextId = idCounter.current++;
      const nextName = buildDefaultName(prev.length + 1);
      const nextTabs = [
        ...prev,
        { id: nextId, name: nextName, themeId: DEFAULT_THEME_ID },
      ];
      setActiveId(nextId);
      return nextTabs;
    });
    setEditingId(null);
    setDraftName("");
    setSearchTerm("");
  };

  const handleCloseTab = (id: number) => {
    setTabs((prev) => {
      if (prev.length === 1) {
        return prev;
      }

      const closingIndex = prev.findIndex((tab) => tab.id === id);
      if (closingIndex === -1) {
        return prev;
      }

      const nextTabs = prev.filter((tab) => tab.id !== id);

      if (activeId === id) {
        const fallbackIndex = Math.min(closingIndex, nextTabs.length - 1);
        setActiveId(nextTabs[fallbackIndex]?.id ?? nextTabs[0].id);
      }

      if (editingId === id) {
        setEditingId(null);
        setDraftName("");
      }

      return nextTabs;
    });
  };

  const handleTabClick = (id: number) => {
    setActiveId(id);
    if (editingId !== id) {
      setEditingId(null);
      setDraftName("");
    }
  };

  const beginRename = (id: number) => {
    const target = tabs.find((tab) => tab.id === id);
    if (!target) {
      return;
    }
    setEditingId(id);
    setDraftName(target.name);
  };

  const commitRename = (id: number, value: string) => {
    const trimmed = value.trim();
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === id
          ? {
              ...tab,
              name: trimmed ? trimmed : tab.name,
            }
          : tab
      )
    );
    setEditingId(null);
    setDraftName("");
  };

  const cancelRename = () => {
    setEditingId(null);
    setDraftName("");
  };

  const activeTab = tabs.find((tab) => tab.id === activeId);
  const activeThemeId = activeTab?.themeId ?? DEFAULT_THEME_ID;

  const filteredThemes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return TERMINAL_THEMES;
    }
    return TERMINAL_THEMES.filter((theme) =>
      theme.label.toLowerCase().includes(query)
    );
  }, [searchTerm]);

  const handleThemeSelect = (themeId: TerminalThemeId) => {
    if (!activeTab) {
      return;
    }
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTab.id
          ? {
              ...tab,
              themeId,
            }
          : tab
      )
    );
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center gap-2 border-b border-accent/20 bg-slate-900/80 px-2 py-2">
        <div className="flex min-w-0 flex-1 gap-2">
          {tabs.map((tab) => {
            const isActive = tab.id === activeId;
            const isEditing = tab.id === editingId;

            return (
              <div
                key={tab.id}
                className="flex flex-1 min-w-0"
              >
                <button
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  onDoubleClick={() => beginRename(tab.id)}
                  className={`${
                    isActive
                      ? "border-accent/90 bg-slate-800/80 text-slate-50"
                      : "border-transparent text-muted hover:bg-slate-800/60 hover:text-slate-200"
                  } flex min-w-0 flex-1 items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors`}
                >
                  {isEditing ? (
                    <input
                      autoFocus
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      onBlur={(event) =>
                        commitRename(tab.id, event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          commitRename(tab.id, draftName);
                        }
                        if (event.key === "Escape") {
                          event.preventDefault();
                          cancelRename();
                        }
                      }}
                      className="w-full min-w-0 border-none bg-transparent text-left text-sm font-medium text-slate-50 outline-none"
                    />
                  ) : (
                    <span className="min-w-0 flex-1 truncate text-left">
                      {tab.name}
                    </span>
                  )}
                  <button
                    type="button"
                    className={`rounded-sm px-1 text-xs font-semibold transition ${
                      tabs.length === 1
                        ? "cursor-not-allowed text-muted/60"
                        : isActive
                        ? "text-accent/90 hover:text-accent"
                        : "text-muted hover:text-slate-200"
                    }`}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleCloseTab(tab.id);
                    }}
                    disabled={tabs.length === 1}
                    aria-label={`Close ${tab.name}`}
                  >
                    ×
                  </button>
                </button>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={handleAddTab}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-accent/40 text-lg font-semibold text-accent transition hover:bg-accent/10"
          aria-label="Add terminal tab"
        >
          +
        </button>
      </div>
      <div className="flex min-h-0 flex-1 bg-[#0b1220]">
        <aside className="flex w-64 min-w-[16rem] flex-col border-r border-accent/25 bg-slate-900/70 px-3 py-4">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Theme
          </label>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search themes"
            className="mt-2 w-full rounded-md border border-accent/30 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-muted focus:border-accent focus:outline-none"
          />
          <div className="mt-3 flex-1 overflow-y-auto pr-1">
            {filteredThemes.length === 0 ? (
              <p className="px-1 text-xs text-muted">No themes found</p>
            ) : (
              filteredThemes.map((theme) => {
                const isSelected = theme.id === activeThemeId;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleThemeSelect(theme.id)}
                    className={`mt-1 flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition ${
                      isSelected
                        ? "bg-accent/20 text-slate-50"
                        : "text-muted hover:bg-slate-800/70 hover:text-slate-100"
                    }`}
                  >
                    <span className="truncate">{theme.label}</span>
                    {isSelected ? (
                      <span className="text-xs font-semibold text-accent">
                        Active
                      </span>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </aside>
        <div className="relative flex flex-1 overflow-hidden">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={
                tab.id === activeId
                  ? "flex h-full w-full"
                  : "hidden h-full w-full"
              }
            >
              <TerminalPanel themeId={tab.themeId} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TerminalTabs;
