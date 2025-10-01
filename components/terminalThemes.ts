import type { ITheme } from "xterm";

export type TerminalThemeId =
  | "robbyrussell"
  | "agnoster"
  | "ys"
  | "bureau"
  | "avit";

export type PromptComponentType =
  | "time"
  | "user"
  | "host"
  | "cwd"
  | "fullPath"
  | "git";

export type PromptComponentConfig = {
  type: PromptComponentType;
  color: string;
  prefix?: string;
  suffix?: string;
};

export type TerminalThemeConfig = {
  id: TerminalThemeId;
  label: string;
  promptComponents: PromptComponentConfig[];
  promptSuffix: string;
  theme: ITheme;
};

export const TERMINAL_THEMES: TerminalThemeConfig[] = [
  {
    id: "robbyrussell",
    label: "robbyrussell",
    promptComponents: [
      {
        type: "time",
        color: "\u001b[38;5;75m",
        prefix: "[",
        suffix: "] ",
      },
      {
        type: "user",
        color: "\u001b[38;5;39m",
      },
      {
        type: "host",
        color: "\u001b[38;5;81m",
        prefix: "@",
        suffix: " ",
      },
      {
        type: "cwd",
        color: "\u001b[38;5;214m",
      },
      {
        type: "git",
        color: "\u001b[38;5;171m",
        prefix: " (",
        suffix: ")",
      },
    ],
    promptSuffix: " \u001b[38;5;118m%\u001b[0m ",
    theme: {
      background: "#0b1220",
      foreground: "#cbd5f5",
      cursor: "#7aa2f7",
      black: "#1c2433",
      red: "#f7768e",
      green: "#9ece6a",
      yellow: "#e0af68",
      blue: "#7aa2f7",
      magenta: "#bb9af7",
      cyan: "#7dcfff",
      white: "#c0caf5",
      brightBlack: "#414868",
      brightRed: "#f7768e",
      brightGreen: "#9ece6a",
      brightYellow: "#e0af68",
      brightBlue: "#7aa2f7",
      brightMagenta: "#bb9af7",
      brightCyan: "#7dcfff",
      brightWhite: "#c0caf5",
    },
  },
  {
    id: "agnoster",
    label: "agnoster",
    promptComponents: [
      {
        type: "user",
        color: "\u001b[38;5;110m",
      },
      {
        type: "host",
        color: "\u001b[38;5;208m",
        prefix: "@",
        suffix: " ",
      },
      {
        type: "fullPath",
        color: "\u001b[38;5;117m",
      },
      {
        type: "git",
        color: "\u001b[38;5;147m",
        prefix: " (",
        suffix: ")",
      },
      {
        type: "time",
        color: "\u001b[38;5;223m",
        prefix: " [",
        suffix: "]",
      },
    ],
    promptSuffix: " \u001b[38;5;223m➜\u001b[0m ",
    theme: {
      background: "#09111c",
      foreground: "#e8f1ff",
      cursor: "#66fbd1",
      black: "#0f172a",
      red: "#fb7185",
      green: "#34d399",
      yellow: "#facc15",
      blue: "#60a5fa",
      magenta: "#c084fc",
      cyan: "#22d3ee",
      white: "#f1f5f9",
      brightBlack: "#1f2937",
      brightRed: "#f43f5e",
      brightGreen: "#10b981",
      brightYellow: "#fbbf24",
      brightBlue: "#3b82f6",
      brightMagenta: "#d8b4fe",
      brightCyan: "#67e8f9",
      brightWhite: "#f8fafc",
    },
  },
  {
    id: "ys",
    label: "ys",
    promptComponents: [
      {
        type: "time",
        color: "\u001b[38;5;151m",
        prefix: "[",
        suffix: "] ",
      },
      {
        type: "host",
        color: "\u001b[38;5;220m",
        prefix: "@",
        suffix: ":",
      },
      {
        type: "cwd",
        color: "\u001b[38;5;81m",
        suffix: " ",
      },
      {
        type: "fullPath",
        color: "\u001b[38;5;45m",
        prefix: "(",
        suffix: ")",
      },
      {
        type: "git",
        color: "\u001b[38;5;190m",
        prefix: " <",
        suffix: ">",
      },
    ],
    promptSuffix: " \u001b[38;5;190m%\u001b[0m ",
    theme: {
      background: "#020b06",
      foreground: "#e4fffa",
      cursor: "#5efc8d",
      black: "#012b0b",
      red: "#ff6f91",
      green: "#69f0ae",
      yellow: "#ffee58",
      blue: "#4dd0e1",
      magenta: "#ce93d8",
      cyan: "#80deea",
      white: "#f4fff8",
      brightBlack: "#1b4332",
      brightRed: "#ff4d6d",
      brightGreen: "#8cffda",
      brightYellow: "#f4ff81",
      brightBlue: "#84ffff",
      brightMagenta: "#da9ff9",
      brightCyan: "#a7ffeb",
      brightWhite: "#ffffff",
    },
  },
  {
    id: "bureau",
    label: "bureau",
    promptComponents: [
      {
        type: "time",
        color: "\u001b[38;5;75m",
        prefix: "⏱ ",
        suffix: " ",
      },
      {
        type: "user",
        color: "\u001b[38;5;111m",
      },
      {
        type: "host",
        color: "\u001b[38;5;198m",
        prefix: "@",
        suffix: " ",
      },
      {
        type: "fullPath",
        color: "\u001b[38;5;142m",
      },
      {
        type: "git",
        color: "\u001b[38;5;81m",
        prefix: " (",
        suffix: ")",
      },
    ],
    promptSuffix: " \u001b[38;5;81m%\u001b[0m ",
    theme: {
      background: "#111827",
      foreground: "#e2e8f0",
      cursor: "#f97316",
      black: "#1f2937",
      red: "#f87171",
      green: "#34d399",
      yellow: "#f59e0b",
      blue: "#3b82f6",
      magenta: "#a855f7",
      cyan: "#22d3ee",
      white: "#f3f4f6",
      brightBlack: "#374151",
      brightRed: "#ef4444",
      brightGreen: "#10b981",
      brightYellow: "#fbbf24",
      brightBlue: "#2563eb",
      brightMagenta: "#c084fc",
      brightCyan: "#38bdf8",
      brightWhite: "#ffffff",
    },
  },
  {
    id: "avit",
    label: "avit",
    promptComponents: [
      {
        type: "time",
        color: "\u001b[38;5;215m",
        prefix: "⌚ ",
        suffix: " ",
      },
      {
        type: "user",
        color: "\u001b[38;5;215m",
      },
      {
        type: "host",
        color: "\u001b[38;5;45m",
        prefix: "@",
        suffix: " ",
      },
      {
        type: "cwd",
        color: "\u001b[38;5;148m",
      },
      {
        type: "git",
        color: "\u001b[38;5;81m",
        prefix: " (",
        suffix: ")",
      },
    ],
    promptSuffix: " \u001b[38;5;81m❯\u001b[0m ",
    theme: {
      background: "#141414",
      foreground: "#f4f4f5",
      cursor: "#f97316",
      black: "#1f1f1f",
      red: "#ef4444",
      green: "#22c55e",
      yellow: "#eab308",
      blue: "#3b82f6",
      magenta: "#a855f7",
      cyan: "#06b6d4",
      white: "#d4d4d8",
      brightBlack: "#3f3f46",
      brightRed: "#f87171",
      brightGreen: "#4ade80",
      brightYellow: "#facc15",
      brightBlue: "#60a5fa",
      brightMagenta: "#d8b4fe",
      brightCyan: "#67e8f9",
      brightWhite: "#ffffff",
    },
  },
];

export const DEFAULT_THEME_ID: TerminalThemeId = TERMINAL_THEMES[0].id;

const themeMap = new Map<TerminalThemeId, TerminalThemeConfig>(
  TERMINAL_THEMES.map((theme) => [theme.id, theme])
);

export const getThemeById = (
  id: TerminalThemeId | undefined
): TerminalThemeConfig => {
  if (!id) {
    return TERMINAL_THEMES[0];
  }
  return themeMap.get(id) ?? TERMINAL_THEMES[0];
};

export const getThemeIndex = (id: TerminalThemeId | undefined): number => {
  if (!id) {
    return 0;
  }
  const index = TERMINAL_THEMES.findIndex((theme) => theme.id === id);
  return index === -1 ? 0 : index;
};

export const isThemeId = (value: string): value is TerminalThemeId => {
  return themeMap.has(value as TerminalThemeId);
};
