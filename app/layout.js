import "./globals.css";

export const metadata = {
  title: "Sales Agent Red Team Dashboard",
  description: "Visualizing red-team conversations against the sales agent",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
