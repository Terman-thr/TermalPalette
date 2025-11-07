import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Terminal Workspace",
  description: "Pure frontend terminal emulation workspace powered by xterm.js",
};

export default function RootLayout(
  props: Readonly<{ children: React.ReactNode }>
) {
  const { children } = props;

  return (
    <html lang="en">
      <body className="bg-hero-glow font-sans text-slate-200 h-screen overflow-hidden antialiased">
        {children}
      </body>
    </html>
  );
}
