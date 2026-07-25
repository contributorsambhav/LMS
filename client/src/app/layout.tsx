import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "../lib/theme-provider";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LumenLMS | Next-Gen Learning Management System",
  description: "A secure, modern, multi-tenant learning management system for students, faculty, and administrators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans antialiased selection:bg-blue-600/20 selection:text-blue-900 dark:selection:text-blue-100" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <ToastContainer position="bottom-right" theme="colored" autoClose={3000} />
        </ThemeProvider>
      </body>
    </html>
  );
}
