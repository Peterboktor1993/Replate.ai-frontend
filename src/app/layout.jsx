import "../scss/main.scss";
// import "./globals.css";
// import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap is already imported in your SCSS
import "@fortawesome/fontawesome-free/css/all.min.css";
import "swiper/css";
import Script from "next/script";
import ThemeContextProvider from "@/context/ThemeContext";
import AppShell from "@/components/layout/AppShell";
// import "./test.css";

export const metadata = {
  title: "Food App",
  description: "A food delivery application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeContextProvider>
          <AppShell>{children}</AppShell>
        </ThemeContextProvider>
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
