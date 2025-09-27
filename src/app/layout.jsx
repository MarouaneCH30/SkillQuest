import "@fontsource/inter";
import "./globals.css";
import { ThemeProvider } from "next-themes";

export const metadata = {
  title: "SkillQuest",
  description: "Track your learning journey with XP and quests",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground font-sans min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <main className="max-w-5xl mx-auto px-4 py-10">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
