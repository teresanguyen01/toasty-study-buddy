import type { Metadata } from "next";
import { Source_Sans_3, JetBrains_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DecksProvider } from "@/contexts/DecksContext";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Toasty's Study Buddy",
  description: "Convert notes to flashcards with AI-powered spaced repetition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedDarkMode = localStorage.getItem('darkMode');
                  var isDark = savedDarkMode === 'true' || 
                    (savedDarkMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${sourceSans.variable} ${jetbrainsMono.variable} ${montserrat.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <DecksProvider>{children}</DecksProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
