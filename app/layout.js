import "./globals.css";

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
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          referrerPolicy="no-referrer"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
