import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider"; // 1. Import the ThemeProvider

export const metadata: Metadata = {
  title: "BlogSpot StoryTeller AI",
  description: "Bringing your stories to life!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        {/* 2. Wrap your components with the ThemeProvider */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Header */}
          <Header />
          {children}

          {/* Toaster */}
        </ThemeProvider>
      </body>
    </html>
  );
}