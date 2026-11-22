import "./globals.css";
import AppProviders from "@/components/AppProviders";
import Header from "@/components/Header";

export const metadata = {
  title: "Meloflix — find movies you’ll love",
  description: "Discover popular and trending movies, and keep your own watchlist.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <Header />
          <main>{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
