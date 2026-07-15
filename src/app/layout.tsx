import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-serif-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AI Guide Portal — AI를 배우고, 탐색하고, 완성하는 곳",
  description:
    "AI 도구, 프롬프트 라이브러리, 메타 프롬프트 엔진, AI 미니툴, 바이브코딩 솔루션 아카이브, 커뮤니티를 하나로. AI를 실제 업무와 창작에 활용하는 통합 AI 생산성 플랫폼.",
  keywords: [
    "AI 가이드", "AI 도구", "프롬프트", "메타 프롬프트", "AI 미니툴",
    "바이브코딩", "AI 포털", "생성형 AI",
  ],
  authors: [{ name: "AI Guide Portal" }],
  icons: { icon: "/logo.svg" },
  openGraph: {
    title: "AI Guide Portal",
    description: "AI를 배우고, 탐색하고, 활용하고, 완성하는 통합 AI 플랫폼",
    siteName: "AI Guide Portal",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1714" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
          <SonnerToaster position="bottom-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
