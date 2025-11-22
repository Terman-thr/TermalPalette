"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";

import type { TerminalWorkspaceProps } from "./TerminalWorkspace";
import ThemeEditor from "./ThemeEditor";
import {
  DEFAULT_THEME_ID,
  TERMINAL_THEMES,
  getThemeById,
  type TerminalThemeId,
  type TerminalThemeConfig,
  type PromptComponentConfig,
  type ThemeVariant,
} from "./terminalThemes";
import type { InstructionSection } from "./helpTypes";
import { useThemeStore } from "./ThemeContext";

const TerminalPanel = dynamic<TerminalWorkspaceProps>(
  () => import("./TerminalWorkspace"),
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

const promptTokenForComponent = (
  component: PromptComponentConfig
): string => {
  switch (component.type) {
    case "time":
      return "%D{%H:%M}";
    case "user":
      return "%n";
    case "host":
      return "%m";
    case "cwd":
      return "%~";
    case "fullPath":
      return "%d";
    case "git":
      return "$(git_prompt_info)";
    case "emoji":
    case "text":
      return escapeLiteralSegment(component.value ?? "");
    default:
      return "";
  }
};

const ANSI_256_COLOR_REGEX = /\[38;5;(\d+)m/g;
const ANSI_RESET_REGEX = /\[0m/g;

const escapeForSingleQuotes = (value: string) => value.replace(/'/g, "'\"'\"'");

const escapeLiteralSegment = (value: string) =>
  escapeForSingleQuotes(value).replace(/%/g, "%%");

const extractAnsi256ColorCode = (sequence: string): string | null => {
  const match = sequence.match(/\[38;5;(\d+)m/);
  return match?.[1] ?? null;
};

const buildPromptSuffixSegment = (suffix: string) => {
  if (!suffix) {
    return "";
  }

  const withZshColors = suffix
    .replace(ANSI_256_COLOR_REGEX, (_match, code: string) => `%F{${code}}`)
    .replace(ANSI_RESET_REGEX, "%f");

  const withPromptChar = withZshColors.replace(/%(?!F\{|f)/g, "%#");

  return escapeForSingleQuotes(withPromptChar);
};

const buildOhMyZshTheme = (theme: TerminalThemeConfig) => {
  const segments: string[] = [];
  let gitPromptPrefix: string | null = null;
  let gitPromptSuffix: string | null = null;

  theme.promptComponents.forEach((component) => {
    if (component.type === "git") {
      const colorCode = extractAnsi256ColorCode(component.color);
      const colorStart = colorCode ? `%F{${colorCode}}` : "";
      const colorEnd = colorCode ? "%f" : "";
      const prefix = escapeLiteralSegment(component.prefix ?? "");
      const suffix = escapeLiteralSegment(component.suffix ?? "");

      gitPromptPrefix = `${prefix}${colorStart}`;
      gitPromptSuffix = `${colorEnd}${suffix}`;
      segments.push(promptTokenForComponent(component));
      return;
    }

    const colorCode = extractAnsi256ColorCode(component.color);
    const colorStart = colorCode ? `%F{${colorCode}}` : "";
    const colorEnd = colorCode ? "%f" : "";
    const prefix = escapeLiteralSegment(component.prefix ?? "");
    const suffix = escapeLiteralSegment(component.suffix ?? "");
    const token = promptTokenForComponent(component);

    segments.push(`${prefix}${colorStart}${token}${colorEnd}${suffix}`);
  });

  segments.push(buildPromptSuffixSegment(theme.promptSuffix));
  const prompt = segments.join("");

  const themeFileName = `${theme.id}.zsh-theme`;

  const lines: string[] = [
    `# oh-my-zsh theme exported from the CS465 terminal workspace`,
    `# Theme: ${theme.label}`,
    "#",
    "# Quick checklist (copy the commands you need):",
    "#   zsh --version",
    "#   echo $ZSH",
    "#   omz --version",
    "#",
    "# Install & activate:",
    "#   mkdir -p ~/.oh-my-zsh/custom/themes",
    `#   mv ~/Downloads/${themeFileName} ~/.oh-my-zsh/custom/themes/`,
    "#   nano ~/.zshrc    # set ZSH_THEME=\"${theme.id}\" and save",
    "#   source ~/.zshrc",
    "#",
    "# Alternate switcher (if you have multiple custom themes):",
    `#   omz theme set \"${theme.id}\" --skip-clone`,
    "#",
    "# Troubleshooting:",
    `#   ls ~/.oh-my-zsh/custom/themes | grep ${theme.id}`,
    "#   ensure the git plugin stays in plugins=(git ...)",
    "#   rerun source ~/.zshrc after edits",
    "#",
    "autoload -U colors && colors",
    "setopt prompt_subst",
  ];

  if (gitPromptPrefix !== null && gitPromptSuffix !== null) {
    lines.push(
      `ZSH_THEME_GIT_PROMPT_PREFIX='${gitPromptPrefix}'`,
      `ZSH_THEME_GIT_PROMPT_SUFFIX='${gitPromptSuffix}'`,
      "ZSH_THEME_GIT_PROMPT_DIRTY='%F{196}✗%f'",
      "ZSH_THEME_GIT_PROMPT_CLEAN='%F{46}✔%f'"
    );
  }

  lines.push(`PROMPT='${prompt}'`, "RPROMPT=''");

  const paletteComment = [
    "",
    "# Xterm.js color palette",
    `# Background: ${theme.theme.background}`,
    `# Foreground: ${theme.theme.foreground}`,
    `# Cursor: ${theme.theme.cursor}`,
  ];

  lines.push(...paletteComment);

  return `${lines.join("\n")}\n`;
};

const buildInstructionSections = (
  theme: TerminalThemeConfig
): InstructionSection[] => {
  const fileName = `${theme.id}.zsh-theme`;
  return [
    {
      title: "Verify installation",
      description:
        "Confirm zsh and oh-my-zsh are ready before applying the exported theme.",
      items: [
        { kind: "command", content: "zsh --version" },
        { kind: "command", content: "echo $USER" },
        { kind: "command", content: "echo $ZSH" },
        { kind: "command", content: "omz --version" },
      ],
    },
    {
      title: "Inspect download (optional)",
      description: "Peek at the generated file if you want to double-check it.",
      items: [{ kind: "command", content: `head ~/Downloads/${fileName}` }],
    },
    {
      title: "Move the theme file",
      description:
        "Place the downloaded file in oh-my-zsh's custom themes directory.",
      items: [
        { kind: "command", content: "mkdir -p ~/.oh-my-zsh/custom/themes" },
        {
          kind: "command",
          content: `mv ~/Downloads/${fileName} ~/.oh-my-zsh/custom/themes/`,
        },
      ],
    },
    {
      title: "Activate via ~/.zshrc",
      description: `Set ZSH_THEME=\"${theme.id}\" and reload your shell.`,
      items: [
        { kind: "command", content: "nano ~/.zshrc" },
        {
          kind: "text",
          content: `Inside the file ensure: ZSH_THEME=\"${theme.id}\"`,
        },
        { kind: "command", content: "source ~/.zshrc" },
      ],
    },
    {
      title: "Alternate omz switcher",
      description:
        "Use the omz helper when you juggle multiple custom themes.",
      items: [
        {
          kind: "command",
          content: `omz theme set "${theme.id}" --skip-clone`,
        },
      ],
    },
    {
      title: "Troubleshooting",
      description: "Quick checks if the prompt does not load as expected.",
      items: [
        {
          kind: "command",
          content: `ls ~/.oh-my-zsh/custom/themes | grep ${theme.id}`,
        },
        { kind: "command", content: "plugins=(git ...)" },
        { kind: "command", content: "source ~/.zshrc" },
      ],
    },
  ];
};

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
  const { customThemes, setCustomThemes, setInstructionSections } =
    useThemeStore();
  const [variantFilter, setVariantFilter] = useState<ThemeVariant | "all">(
    "all"
  );
  const [accessibilityFilter, setAccessibilityFilter] = useState<
    "all" | "cb-friendly" | "protanopia" | "deuteranopia" | "tritanopia"
  >("all");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorSeed, setEditorSeed] = useState<TerminalThemeConfig | null>(
    null
  );
  const [showExportGuide, setShowExportGuide] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const commandCopyTimeoutRef = useRef<number | null>(null);
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
  const activeTheme = useMemo(
    () => getThemeById(activeThemeId),
    [activeThemeId]
  );
  const instructionSections = useMemo(
    () => buildInstructionSections(activeTheme),
    [activeTheme]
  );

  useEffect(() => {
    setInstructionSections(instructionSections);
  }, [instructionSections, setInstructionSections]);
  const availableThemes = useMemo(
    () => [...TERMINAL_THEMES, ...customThemes],
    [customThemes]
  );

  const filteredThemes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return availableThemes.filter((theme) => {
      const matchesQuery = query
        ? theme.label.toLowerCase().includes(query)
        : true;
      const matchesVariant =
        variantFilter === "all" ? true : theme.variant === variantFilter;
      const accessibilityTags = theme.accessibilityTags ?? [];
      const matchesAccessibility =
        accessibilityFilter === "all"
          ? true
          : accessibilityFilter === "cb-friendly"
          ? accessibilityTags.length > 0
          : accessibilityTags.includes(accessibilityFilter);
      return matchesQuery && matchesVariant && matchesAccessibility;
    });
  }, [searchTerm, availableThemes, variantFilter, accessibilityFilter]);

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

  const handleExportTheme = () => {
    const contents = buildOhMyZshTheme(activeTheme);
    const blob = new Blob([contents], {
      type: "text/plain;charset=utf-8",
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${activeTheme.id}.zsh-theme`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
    setShowExportGuide(true);
  };

  const openEditor = () => {
    setEditorSeed(activeTheme);
    setIsEditorOpen(true);
  };

  const handleEditorCancel = () => {
    setIsEditorOpen(false);
    setEditorSeed(null);
  };

  const handleEditorSave = (theme: TerminalThemeConfig) => {
    setCustomThemes((prev) => {
      const index = prev.findIndex((item) => item.id === theme.id);
      const next = [...prev];
      if (index === -1) {
        next.push(theme);
      } else {
        next[index] = theme;
      }
      return next;
    });
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeId
          ? {
              ...tab,
              themeId: theme.id,
            }
          : tab
      )
    );
    setIsEditorOpen(false);
    setEditorSeed(null);
  };

  const handleCopyCommand = (command: string) => {
    if (commandCopyTimeoutRef.current !== null) {
      window.clearTimeout(commandCopyTimeoutRef.current);
    }
    navigator.clipboard
      .writeText(command)
      .then(() => {
        setCopiedCommand(command);
        commandCopyTimeoutRef.current = window.setTimeout(() => {
          setCopiedCommand(null);
          commandCopyTimeoutRef.current = null;
        }, 2000);
      })
      .catch(() => {
        setCopiedCommand(null);
      });
  };

  useEffect(() => {
    return () => {
      if (commandCopyTimeoutRef.current !== null) {
        window.clearTimeout(commandCopyTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
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
          <aside className="flex w-64 min-w-[16rem] h-shrink flex-col border-r border-accent/25 bg-slate-900/70 px-3 py-4">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Theme
          </label>
          <div className="mt-2 flex flex-col gap-2">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search themes"
              className="w-full rounded-md border border-accent/30 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-muted focus:border-accent focus:outline-none"
            />
            <div className="flex flex-col gap-2">
              <select
                value={variantFilter}
                onChange={(event) =>
                  setVariantFilter(event.target.value as ThemeVariant | "all")
                }
                className="flex-1 rounded-md border border-accent/30 bg-slate-950/60 px-2 py-2 text-sm text-slate-100 focus:border-accent focus:outline-none"
              >
                <option value="all">All tones</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="contrast">Contrast</option>
              </select>
              <select
                value={accessibilityFilter}
                onChange={(event) =>
                  setAccessibilityFilter(
                    event.target.value as
                      | "all"
                      | "cb-friendly"
                      | "protanopia"
                      | "deuteranopia"
                      | "tritanopia"
                  )
                }
                className="flex-1 rounded-md border border-accent/30 bg-slate-950/60 px-2 py-2 text-sm text-slate-100 focus:border-accent focus:outline-none"
              >
                <option value="all">All palettes</option>
                <option value="cb-friendly">Color-blind friendly</option>
                <option value="protanopia">Protanopia</option>
                <option value="deuteranopia">Deuteranopia</option>
                <option value="tritanopia">Tritanopia</option>
              </select>
            </div>
          </div>
          <div>
            <div className="mt-3 flex-1 max-h-72 overflow-y-auto pr-1">
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
          </div>
            <button
              type="button"
              onClick={handleExportTheme}
              className="mt-4 inline-flex items-center justify-center rounded-md border border-accent/40 bg-slate-900/70 px-3 py-2 text-sm font-medium text-accent transition hover:bg-accent/20 hover:text-slate-50"
            >
              Export theme for oh-my-zsh
            </button>
            <button
              type="button"
              onClick={openEditor}
              className="mt-2 inline-flex items-center justify-center rounded-md border border-white/20 bg-slate-900/50 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-accent/60 hover:text-accent"
            >
              Customize theme
            </button>
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

      {isEditorOpen && editorSeed ? (
        <ThemeEditor
          initialTheme={editorSeed}
          onCancel={handleEditorCancel}
          onSave={handleEditorSave}
        />
      ) : null}

      {showExportGuide ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-accent/30 bg-slate-900/95 p-8 text-sm text-slate-100 shadow-2xl my-auto">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-semibold">
                Apply “{activeTheme.label}” in oh-my-zsh
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowExportGuide(false);
                  setCopiedCommand(null);
                }}
                className="rounded-md border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted transition hover:border-white/40"
              >
                Close
              </button>
            </div>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted">
              Follow the steps below. Commands include copy buttons on the right.
            </p>
            <div className="mt-5 space-y-4">
              {instructionSections.map((section) => (
                <section
                  key={section.title}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"
                >
                  <h4 className="text-lg font-semibold text-slate-50">
                    {section.title}
                  </h4>
                  {section.description ? (
                    <p className="mt-1 text-sm text-slate-300">
                      {section.description}
                    </p>
                  ) : null}
                  <ul className="mt-3 space-y-2">
                    {section.items.map((item, index) =>
                      item.kind === "text" ? (
                        <li
                          key={`${section.title}-text-${index}`}
                          className="text-sm text-slate-200"
                        >
                          {item.content}
                        </li>
                      ) : (
                        <li
                          key={`${section.title}-cmd-${index}`}
                          className="flex items-center gap-3 rounded-xl bg-slate-950/90 px-3 py-2"
                        >
                          <code className="flex-1 truncate text-xs text-slate-100">
                            {item.content}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopyCommand(item.content)}
                            className="rounded-md border border-white/20 px-2 py-1 text-xs font-semibold text-slate-100 transition hover:border-accent"
                          >
                            {copiedCommand === item.content ? "Copied!" : "Copy"}
                          </button>
                        </li>
                      )
                    )}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>
      ) : null}

    </>
  );
};

export default TerminalTabs;
