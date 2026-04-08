import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anna | Consultant & Coach",
  description:
    "Empowering leaders and teams to unlock their full potential through strategic consulting and personalized coaching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-white text-neutral-900 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
