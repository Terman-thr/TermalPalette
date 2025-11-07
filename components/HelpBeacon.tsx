"use client";

import { useMemo, useState } from "react";

const tutorialSteps = [
  "Open a terminal tab and explore the builtin commands.",
  "Use Customize theme to rearrange segments or pick new colors.",
  "Export the theme to a .zsh-theme file once you're happy.",
];

const faqs = [
  {
    question: "Where is my exported file?",
    answer: "It lands in your browser's default downloads folder as <theme>.zsh-theme.",
  },
  {
    question: "How do I apply the theme?",
    answer: "Move the file to ~/.oh-my-zsh/custom/themes/, set ZSH_THEME to that filename, then run source ~/.zshrc.",
  },
  {
    question: "Can I revert my changes?",
    answer: "Switch back to any built-in theme from the sidebar or reopen the editor to tweak your custom one.",
  },
];

const HelpBeacon = () => {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((prev) => !prev);
  const panelId = useMemo(() => `help-panel-${Math.random().toString(36).slice(2)}`, []);

  return (
    <>
      <button
        type="button"
        aria-label="Open workspace guide"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-accent/60 bg-slate-900/80 text-xl font-semibold text-accent shadow-lg transition hover:bg-accent/20"
      >
        ?
      </button>
      {open ? (
        <section
          id={panelId}
          className="fixed bottom-20 right-4 z-40 w-80 rounded-2xl border border-accent/40 bg-slate-950/95 p-4 text-sm text-slate-100 shadow-2xl"
        >
          <header className="flex items-center justify-between">
            <p className="text-base font-semibold">Quick guide</p>
            <button
              type="button"
              onClick={toggle}
              aria-label="Close workspace guide"
              className="rounded-md border border-white/10 px-2 py-1 text-xs text-muted transition hover:border-white/30"
            >
              Close
            </button>
          </header>
          <div className="mt-3 space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Tutorial</p>
            <ol className="space-y-1 text-slate-200">
              {tutorialSteps.map((step, index) => (
                <li key={step}>
                  <span className="font-semibold text-accent">{index + 1}.</span> {step}
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">FAQs</p>
            <dl className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <dt className="font-semibold text-accent">{faq.question}</dt>
                  <dd className="text-slate-300">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}
    </>
  );
};

export default HelpBeacon;
