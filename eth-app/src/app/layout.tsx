import "./globals.css"; // Ensure TailwindCSS is loaded
import { ThemeProvider } from "@/components/ui/theme-provider";

export const metadata = {
  title: "Connect to Metamask",
  description: "Connect Metamask",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen flex items-center justify-center">
        <ThemeProvider defaultTheme="light">
          <div className="w-full max-w-2xl p-6">
            <header className="bg-white p-4 shadow-md rounded-lg text-center">
              <h1 className="text-2xl font-semibold">Connect Wallet</h1>
            </header>
            <main className="bg-white p-6 mt-6 shadow-lg rounded-lg">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
