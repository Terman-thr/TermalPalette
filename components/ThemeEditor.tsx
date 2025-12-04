"use client";

import { useMemo, useState } from "react";

import type {
  PromptComponentConfig,
  PromptComponentType,
  TerminalThemeConfig,
  TerminalThemeId,
} from "./terminalThemes";

const COMPONENT_OPTIONS: Array<{ value: PromptComponentType; label: string }> = [
  { value: "user", label: "User" },
  { value: "host", label: "Host" },
  { value: "cwd", label: "Current directory" },
  { value: "fullPath", label: "Full path" },
  { value: "time", label: "Time" },
  { value: "git", label: "Git branch" },
  { value: "emoji", label: "Emoji" },
  { value: "text", label: "Custom text" },
];

const ANSI_COLOR_REGEX = /\u001b\[38;5;(\d+)m/;

type EditableComponent = PromptComponentConfig & {
  id: string;
  hexColor: string;
};

type ThemeEditorProps = {
  initialTheme: TerminalThemeConfig;
  onCancel: () => void;
  onSave: (theme: TerminalThemeConfig) => void;
};

const BASIC_16: Array<[number, number, number]> = [
  [0, 0, 0],
  [128, 0, 0],
  [0, 128, 0],
  [128, 128, 0],
  [0, 0, 128],
  [128, 0, 128],
  [0, 128, 128],
  [192, 192, 192],
  [128, 128, 128],
  [255, 0, 0],
  [0, 255, 0],
  [255, 255, 0],
  [0, 0, 255],
  [255, 0, 255],
  [0, 255, 255],
  [255, 255, 255],
];

const ANSI_COLOR_TABLE = Array.from({ length: 256 }, (_, code) => {
  if (code < 16) {
    const [r, g, b] = BASIC_16[code];
    return { r, g, b };
  }
  if (code >= 16 && code <= 231) {
    const idx = code - 16;
    const r = Math.floor(idx / 36);
    const g = Math.floor((idx % 36) / 6);
    const b = idx % 6;
    const steps = [0, 95, 135, 175, 215, 255];
    return {
      r: steps[r],
      g: steps[g],
      b: steps[b],
    };
  }
  const gray = 8 + (code - 232) * 10;
  return { r: gray, g: gray, b: gray };
});

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;

const hexToRgb = (value: string) => {
  const match = value.replace("#", "");
  if (match.length !== 6) {
    return { r: 255, g: 255, b: 255 };
  }
  return {
    r: parseInt(match.slice(0, 2), 16),
    g: parseInt(match.slice(2, 4), 16),
    b: parseInt(match.slice(4, 6), 16),
  };
};

const ansiColorToHex = (sequence: string): string => {
  const match = sequence.match(ANSI_COLOR_REGEX);
  if (!match) {
    return "#f97316";
  }
  const code = Number(match[1]);
  const rgb = ANSI_COLOR_TABLE[code] ?? { r: 249, g: 115, b: 22 };
  return rgbToHex(rgb.r, rgb.g, rgb.b);
};

const rgbToAnsi256 = (r: number, g: number, b: number): number => {
  let closest = 0;
  let minDistance = Number.POSITIVE_INFINITY;
  ANSI_COLOR_TABLE.forEach((candidate, code) => {
    const distance =
      (candidate.r - r) * (candidate.r - r) +
      (candidate.g - g) * (candidate.g - g) +
      (candidate.b - b) * (candidate.b - b);
    if (distance < minDistance) {
      minDistance = distance;
      closest = code;
    }
  });
  return closest;
};

const hexToAnsi = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const code = rgbToAnsi256(r, g, b);
  return `\u001b[38;5;${code}m`;
};

const randomId = () => Math.random().toString(36).slice(2);

const createEditableComponent = (
  component: PromptComponentConfig,
  fallbackType: PromptComponentType
): EditableComponent => {
  const color = component.color ?? "\u001b[38;5;214m";
  return {
    ...component,
    type: component.type ?? fallbackType,
    value:
      component.type === "emoji" || component.type === "text"
        ? component.value ?? ""
        : component.value,
    id: randomId(),
    hexColor: ansiColorToHex(color),
    color,
  };
};

const stripAnsi = (value: string) => value.replace(/\u001b\[[0-9;]*m/g, "");

const parseSuffix = (suffix: string) => {
  const match = suffix.match(/\u001b\[38;5;(\d+)m([^\u001b]+)\u001b\[0m/);
  if (match) {
    const code = Number(match[1]);
    const rgb = ANSI_COLOR_TABLE[code] ?? { r: 249, g: 115, b: 22 };
    return {
      text: match[2].trim() || "❯",
      hex: rgbToHex(rgb.r, rgb.g, rgb.b),
    };
  }
  const text = stripAnsi(suffix).trim() || "❯";
  return { text, hex: "#f97316" };
};

const buildSuffix = (text: string, hex: string) => {
  const target = text.trim() || "❯";
  const color = hexToAnsi(hex);
  return ` ${color}${target}\u001b[0m `;
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const PREVIEW_CONTEXT = {
  user: "<your-name>",
  host: "frontend",
  cwd: "~/playground",
  fullPath: "/Users/<your-name>/playground",
  git: "main",
  time: "14:32",
};

const getPreviewValue = (component: EditableComponent) => {
  switch (component.type) {
    case "user":
      return PREVIEW_CONTEXT.user;
    case "host":
      return PREVIEW_CONTEXT.host;
    case "cwd":
      return PREVIEW_CONTEXT.cwd;
    case "fullPath":
      return PREVIEW_CONTEXT.fullPath;
    case "git":
      return PREVIEW_CONTEXT.git;
    case "time":
      return PREVIEW_CONTEXT.time;
    case "emoji":
    case "text":
      return component.value ?? "";
    default:
      return "";
  }
};

const ensureValueForType = (
  component: EditableComponent,
  type: PromptComponentType
) => {
  if (type === "emoji" && !component.value) {
    return "✨";
  }
  if (type === "text" && !component.value) {
    return "custom";
  }
  return component.value;
};

const ThemeEditor = ({ initialTheme, onCancel, onSave }: ThemeEditorProps) => {
  const suffixInfo = parseSuffix(initialTheme.promptSuffix);
  const [themeName, setThemeName] = useState(
    `Custom ${initialTheme.label}`
  );
  const [components, setComponents] = useState<EditableComponent[]>(
    initialTheme.promptComponents.map((component) =>
      createEditableComponent(component, component.type)
    )
  );
  const [suffixText, setSuffixText] = useState(suffixInfo.text);
  const [suffixHex, setSuffixHex] = useState(suffixInfo.hex);
  const [palette, setPalette] = useState({
    background: initialTheme.theme.background ?? "#0b1220",
    foreground: initialTheme.theme.foreground ?? "#cbd5f5",
    cursor: initialTheme.theme.cursor ?? "#7aa2f7",
  });

  const updateComponent = (
    id: string,
    updates: Partial<Omit<EditableComponent, "id">>
  ) => {
    setComponents((prev) =>
      prev.map((component) => {
        if (component.id !== id) {
          return component;
        }
        const next: EditableComponent = {
          ...component,
          ...updates,
        };
        if (updates.hexColor) {
          next.color = hexToAnsi(updates.hexColor);
        }
        if (updates.type) {
          next.value = ensureValueForType(next, updates.type);
        }
        return next;
      })
    );
  };

  const handleAddComponent = () => {
    const hexColor = "#fbbf24";
    const color = hexToAnsi(hexColor);
    setComponents((prev) => [
      ...prev,
      {
        id: randomId(),
        type: "emoji",
        value: "✨",
        color,
        hexColor,
        prefix: "",
        suffix: " ",
      },
    ]);
  };

  const handleRemoveComponent = (id: string) => {
    setComponents((prev) => prev.filter((component) => component.id !== id));
  };

  const moveComponent = (id: string, direction: -1 | 1) => {
    setComponents((prev) => {
      const index = prev.findIndex((component) => component.id === id);
      if (index === -1) {
        return prev;
      }
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  };

  const previewComponents = useMemo(() => components, [components]);

  const handleReset = () => {
    const suffixInfo = parseSuffix(initialTheme.promptSuffix);
    setThemeName(initialTheme.label);
    setComponents(
      initialTheme.promptComponents.map((component) =>
        createEditableComponent(component, component.type)
      )
    );
    setSuffixText(suffixInfo.text);
    setSuffixHex(suffixInfo.hex);
    setPalette({
      background: initialTheme.theme.background ?? "#0b1220",
      foreground: initialTheme.theme.foreground ?? "#cbd5f5",
      cursor: initialTheme.theme.cursor ?? "#7aa2f7",
    });
  };

  const handleSave = () => {
    const sanitizedComponents: PromptComponentConfig[] = components.map(
      ({ id, hexColor, ...rest }) => ({
        ...rest,
      })
    );

    const baseId = initialTheme.id;
    const safeName = themeName.trim() || initialTheme.label;
    const slug = slugify(safeName) || "custom-theme";
    const id: TerminalThemeId = baseId.startsWith("custom-")
      ? baseId
      : (`custom-${slug}-${Date.now()}` as TerminalThemeId);

    const updatedTheme: TerminalThemeConfig = {
      ...initialTheme,
      id,
      label: safeName,
      variant: initialTheme.variant,
      promptComponents: sanitizedComponents,
      promptSuffix: buildSuffix(suffixText, suffixHex),
      theme: {
        ...initialTheme.theme,
        background: palette.background,
        foreground: palette.foreground,
        cursor: palette.cursor,
      },
    };

    onSave(updatedTheme);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/80 px-4 py-8 backdrop-blur">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(56,189,248,0.08),transparent_32%),radial-gradient(circle_at_85%_10%,rgba(244,114,182,0.12),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(94,234,212,0.08),transparent_26%)]" />
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-accent/30 bg-slate-900/95 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
        <div className="relative border-b border-white/10 bg-gradient-to-r from-slate-900/98 via-slate-900/95 to-slate-900/98 px-6 py-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(94,234,212,0.12),transparent_35%)]" />
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold text-slate-50">
                Theme editor
              </h2>
              <p className="text-sm text-slate-300">
                Adjust your prompt, palette, and ending mark with immediate feedback. Hover elements to see microinteractions.
              </p>
            </div>
            <label className="text-sm font-medium text-slate-200">
              Theme name
              <input
                value={themeName}
                onChange={(event) => setThemeName(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-base text-slate-50 shadow-inner shadow-black/20 placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none"
                placeholder="Give your theme a memorable name"
              />
            </label>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-xl shadow-cyan-500/10 backdrop-blur">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_80%_60%,rgba(244,114,182,0.12),transparent_40%)]" />
              <div className="relative flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    Live prompt
                  </div>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-200">
                    {initialTheme.variant} mode
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.18)]" />
                  Live view
                </div>
              </div>
              <div
                className="mt-4 overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-inner shadow-black/40"
                style={{ background: palette.background }}
              >
                <div className="bg-black/25 px-6 py-5">
                  <div
                    className="font-mono text-lg leading-relaxed md:text-xl"
                    style={{ color: palette.foreground }}
                  >
                    {previewComponents.map((component) => (
                      <span
                        key={component.id}
                        style={{ color: component.hexColor }}
                      >
                        {component.prefix}
                        {getPreviewValue(component)}
                        {component.suffix}
                      </span>
                    ))}
                    <span style={{ color: suffixHex, marginLeft: 6 }}>
                      {suffixText}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-semibold text-slate-100">
                Prompt components
              </h3>
              <span className="text-sm text-muted">
                Reorder with arrows; hover fields for subtle glow feedback.
              </span>
              <div className="h-px flex-1 bg-white/10" />
              <button
                type="button"
                onClick={handleAddComponent}
                className="rounded-md border border-accent/50 bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent shadow-[0_0_0_1px_rgba(56,189,248,0.35)] transition hover:scale-[1.01] hover:bg-accent/20 hover:shadow-[0_0_0_2px_rgba(56,189,248,0.35)]"
              >
                Add component
              </button>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <div className="space-y-4">
                <div className="space-y-3 rounded-2xl border border-white/5 bg-slate-950/40 p-3 pr-3 shadow-inner shadow-black/30">
                  <div className="max-h-[50vh] space-y-3 pr-1">
                    {components.map((component, index) => (
                      <div
                        key={component.id}
                        className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950/60 via-slate-900/70 to-slate-950/50 p-4 shadow-lg shadow-black/30 transition duration-150 hover:border-accent/60 hover:shadow-cyan-500/10"
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                              {index + 1 < 10 ? `0${index + 1}` : index + 1}
                              <span
                                className="h-2.5 w-2.5 rounded-full shadow-[0_0_0_4px_rgba(255,255,255,0.06)]"
                                style={{ background: component.hexColor }}
                                aria-hidden
                              />
                            </span>
                            <select
                              value={component.type}
                              onChange={(event) =>
                                updateComponent(component.id, {
                                  type: event.target.value as PromptComponentType,
                                })
                              }
                              className="flex-1 rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 shadow-inner shadow-black/30 focus:border-accent focus:ring-2 focus:ring-accent/25 focus:outline-none"
                            >
                              {COMPONENT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="rounded-md border border-white/10 px-2 py-1 text-xs text-slate-300 transition hover:border-accent hover:text-accent"
                                onClick={() => moveComponent(component.id, -1)}
                                disabled={index === 0}
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                className="rounded-md border border-white/10 px-2 py-1 text-xs text-slate-300 transition hover:border-accent hover:text-accent"
                                onClick={() => moveComponent(component.id, 1)}
                                disabled={index === components.length - 1}
                              >
                                ↓
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveComponent(component.id)}
                              className="rounded-md border border-white/10 px-2 py-1 text-xs text-rose-200 transition hover:border-rose-400 hover:text-rose-200"
                            >
                              Remove
                            </button>
                          </div>
                          {(component.type === "emoji" ||
                            component.type === "text") && (
                            <label className="text-sm text-slate-200">
                              Value
                              <input
                                value={component.value ?? ""}
                                onChange={(event) =>
                                  updateComponent(component.id, {
                                    value: event.target.value,
                                  })
                                }
                                placeholder={
                                  component.type === "emoji"
                                    ? "e.g. ✨"
                                    : "Custom text"
                                }
                                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 shadow-inner shadow-black/30 transition focus:border-accent focus:ring-2 focus:ring-accent/25 focus:outline-none"
                              />
                            </label>
                          )}
                          <div className="grid gap-3 sm:grid-cols-3">
                            <label className="text-sm text-slate-200">
                              Prefix
                              <input
                                value={component.prefix ?? ""}
                                onChange={(event) =>
                                  updateComponent(component.id, {
                                    prefix: event.target.value,
                                  })
                                }
                                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 shadow-inner shadow-black/30 transition focus:border-accent focus:ring-2 focus:ring-accent/25 focus:outline-none"
                              />
                            </label>
                            <label className="text-sm text-slate-200">
                              Suffix
                              <input
                                value={component.suffix ?? ""}
                                onChange={(event) =>
                                  updateComponent(component.id, {
                                    suffix: event.target.value,
                                  })
                                }
                                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 shadow-inner shadow-black/30 transition focus:border-accent focus:ring-2 focus:ring-accent/25 focus:outline-none"
                              />
                            </label>
                            {component.type !== "emoji" ? (
                              <label className="text-sm text-slate-200">
                                Color
                                <input
                                  type="color"
                                  value={component.hexColor}
                                  onChange={(event) =>
                                    updateComponent(component.id, {
                                      hexColor: event.target.value,
                                    })
                                  }
                                  className="mt-1 h-10 w-full rounded-md border border-white/20 bg-slate-900/70"
                                />
                              </label>
                            ) : (
                              <span />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
              </div>
            </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950/60 via-slate-900/70 to-slate-950/50 p-4 shadow-inner shadow-black/30">
                  <h3 className="text-lg font-semibold text-slate-100">
                    Prompt ending
                  </h3>
                  <p className="mt-1 text-xs text-slate-300">
                    Tweak the closing symbol and color; it anchors the cursor zone.
                  </p>
                  <div className="mt-3 space-y-3">
                    <label className="text-sm text-slate-200">
                      Symbol / emoji
                      <input
                        value={suffixText}
                        onChange={(event) => setSuffixText(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 shadow-inner shadow-black/30 transition focus:border-accent focus:ring-2 focus:ring-accent/25 focus:outline-none"
                      />
                    </label>
                    <label className="text-sm text-slate-200">
                      Color
                      <input
                        type="color"
                        value={suffixHex}
                        onChange={(event) => setSuffixHex(event.target.value)}
                        className="mt-1 h-10 w-full rounded-md border border-white/20 bg-slate-900/70 shadow-inner shadow-black/30 transition hover:border-accent/50"
                      />
                    </label>
                    <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/30 px-3 py-2 text-xs text-slate-200">
                      <span
                        className="h-3 w-3 rounded-full shadow-[0_0_0_4px_rgba(148,163,184,0.25)]"
                        style={{ background: suffixHex }}
                        aria-hidden
                      />
                      <span className="uppercase tracking-[0.2em] text-muted">
                        Preview
                      </span>
                      <code className="rounded bg-white/5 px-2 py-1 text-[11px] text-slate-100">
                        {buildSuffix(suffixText, suffixHex).trim()}
                      </code>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950/60 via-slate-900/70 to-slate-950/50 p-4 shadow-inner shadow-black/30">
                  <h3 className="text-lg font-semibold text-slate-100">
                    Terminal palette
                  </h3>
                  <p className="mt-1 text-xs text-slate-300">
                    Match your prompt colors with the terminal backdrop and cursor glow.
                  </p>
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/5 bg-black/25 px-3 py-2 text-xs text-slate-200">
                    {(["background", "foreground", "cursor"] as const).map(
                      (key) => (
                        <div key={key} className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full shadow-[0_0_0_4px_rgba(148,163,184,0.25)]"
                            style={{ background: palette[key] }}
                            aria-hidden
                          />
                          <span className="capitalize text-[11px] text-muted">
                            {key}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                  <div className="mt-3 space-y-3">
                    <label className="text-sm text-slate-200">
                      Background
                      <input
                        type="color"
                        value={palette.background}
                        onChange={(event) =>
                          setPalette((prev) => ({
                            ...prev,
                            background: event.target.value,
                          }))
                        }
                        className="mt-1 h-10 w-full rounded-md border border-white/20 bg-slate-900/70 shadow-inner shadow-black/30 transition hover:border-accent/50"
                      />
                    </label>
                    <label className="text-sm text-slate-200">
                      Foreground
                      <input
                        type="color"
                        value={palette.foreground}
                        onChange={(event) =>
                          setPalette((prev) => ({
                            ...prev,
                            foreground: event.target.value,
                          }))
                        }
                        className="mt-1 h-10 w-full rounded-md border border-white/20 bg-slate-900/70 shadow-inner shadow-black/30 transition hover:border-accent/50"
                      />
                    </label>
                    <label className="text-sm text-slate-200">
                      Cursor
                      <input
                        type="color"
                        value={palette.cursor}
                        onChange={(event) =>
                          setPalette((prev) => ({
                            ...prev,
                            cursor: event.target.value,
                          }))
                        }
                        className="mt-1 h-10 w-full rounded-md border border-white/20 bg-slate-900/70 shadow-inner shadow-black/30 transition hover:border-accent/50"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-white/10 bg-slate-900/90 px-6 py-4 shadow-inner shadow-black/30 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-orange-400/50 bg-orange-400/10 px-4 py-2 text-sm font-medium text-orange-200 shadow-[0_0_0_1px_rgba(251,146,60,0.35)] transition hover:scale-[1.01] hover:bg-orange-400/20"
          >
            Reset
          </button>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-white/25 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-white/40 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg border border-accent/70 bg-gradient-to-r from-accent/30 to-cyan-400/25 px-4 py-2 text-sm font-semibold text-accent shadow-[0_10px_35px_-15px_rgba(56,189,248,0.75)] transition hover:scale-[1.01] hover:shadow-[0_14px_40px_-12px_rgba(56,189,248,0.9)]"
            >
              Save theme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeEditor;
