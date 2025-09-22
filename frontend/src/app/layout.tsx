import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Simple PDF Tools",
  description: "Convert, merge, split, and compress PDF files with ease. Professional-grade PDF tools that work right in your browser.",
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '16x16', type: 'image/png' }
    ],
    shortcut: '/favicon.png',
    apple: '/SIMPLEPDF_TOOL.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
      </head>
      <body
        className={`${montserrat.variable} antialiased font-montserrat`}
        suppressHydrationWarning={true}
      >
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
