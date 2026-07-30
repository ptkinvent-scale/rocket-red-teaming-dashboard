import "./globals.css";

export const metadata = {
  title: "Rocket Red Teaming Dashboard",
  description: "Dashboard for visualizing results of red teaming conversations with Sales Agent",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
