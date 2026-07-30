import { GeistSans } from "geist/font/sans";
import Script from "next/script";
import "./globals.css";

export const metadata = {
  title: "Rocket Red Teaming Dashboard",
  description: "Dashboard for visualizing results of red teaming conversations with Sales Agent",
};

const THEME_INIT_SCRIPT = `
  try {
    var stored = localStorage.getItem("rt-theme");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${GeistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        {children}
      </body>
    </html>
  );
}
