import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "XCStrings Online",
  description: "Edit Xcode String Catalog anywhere, anytime.",
};

// Applies the saved (or system) theme before paint to avoid a flash of the
// wrong theme. Kept inline so it runs before React hydrates.
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    var isDark = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
