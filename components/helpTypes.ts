export type InstructionItem =
  | { kind: "text"; content: string }
  | { kind: "command"; content: string };

export type InstructionSection = {
  title: string;
  description?: string;
  items: InstructionItem[];
};
