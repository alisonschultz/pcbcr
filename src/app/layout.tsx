import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Public CbCR Data",
  description:
    "Browse and download public Country-by-Country Reports from multinational enterprises",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <nav className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <a href="/" className="text-xl font-bold text-blue-700">
              Public CbCR Data
            </a>
            <div className="flex gap-6 text-sm">
              <a href="/" className="hover:text-blue-600">
                Companies
              </a>
              <a href="/about" className="hover:text-blue-600">
                About
              </a>
              <a href="/submit" className="hover:text-blue-600">
                Submit Report
              </a>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
        <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-500">
          Data extracted from public Country-by-Country Reports. Not an
          official government source.
        </footer>
      </body>
    </html>
  );
}
