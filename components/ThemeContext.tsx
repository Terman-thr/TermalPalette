"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { InstructionSection } from "./helpTypes";
import {
  setCustomThemes as registerCustomThemes,
  type TerminalThemeConfig,
} from "./terminalThemes";

type ThemeContextValue = {
  customThemes: TerminalThemeConfig[];
  setCustomThemes: Dispatch<SetStateAction<TerminalThemeConfig[]>>;
  instructionSections: InstructionSection[];
  setInstructionSections: Dispatch<SetStateAction<InstructionSection[]>>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [customThemes, setCustomThemes] = useState<TerminalThemeConfig[]>([]);
  const [instructionSections, setInstructionSections] = useState<
    InstructionSection[]
  >([]);

  useEffect(() => {
    registerCustomThemes(customThemes);
  }, [customThemes]);

  return (
    <ThemeContext.Provider
      value={{
        customThemes,
        setCustomThemes,
        instructionSections,
        setInstructionSections,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeStore = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeStore must be used within ThemeProvider");
  }
  return ctx;
};
