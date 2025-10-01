"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";

const TerminalPanel = dynamic(() => import("./TerminalDemo"), {
  ssr: false,
});

type TerminalTab = {
  id: number;
  name: string;
};

const buildDefaultName = (index: number) => `Terminal ${index}`;

const TerminalTabs = () => {
  const [tabs, setTabs] = useState<TerminalTab[]>([
    {
      id: 1,
      name: buildDefaultName(1),
    },
  ]);
  const [activeId, setActiveId] = useState<number>(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftName, setDraftName] = useState<string>("");
  const idCounter = useRef(2);

  const handleAddTab = () => {
    setTabs((prev) => {
      const nextId = idCounter.current++;
      const nextName = buildDefaultName(prev.length + 1);
      const nextTabs = [...prev, { id: nextId, name: nextName }];
      setActiveId(nextId);
      return nextTabs;
    });
    setEditingId(null);
    setDraftName("");
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
        <div className="relative flex h-full w-full overflow-hidden">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={
                tab.id === activeId
                  ? "flex h-full w-full"
                  : "hidden h-full w-full"
              }
            >
              <TerminalPanel />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TerminalTabs;
