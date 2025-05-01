import "../scss/main.scss";
import "../app/globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "swiper/css";
import Script from "next/script";
import ThemeContextProvider from "@/context/ThemeContext";
import AppShell from "@/components/layout/AppShell";
import { getRestaurantDetailsServer } from "@/store/services/restaurantService";
import { headers } from "next/headers";

export default async function RootLayout({ children }) {
  const headersList = headers();
  const searchParams = Object.fromEntries(
    new URLSearchParams(headersList.get("searchParams") || "")
  );
  const restaurantId = searchParams?.restaurant || "2";

  console.log("[RootLayout restaurantId]", restaurantId);
  const restaurant = await getRestaurantDetailsServer(restaurantId);
  console.log("[RootLayout restaurant]", restaurant);
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={restaurant?.meta_description} />
        <meta
          name="title"
          content={restaurant?.meta_title || restaurant?.name}
        />
        <meta name="keywords" content={restaurant?.tags} />
        <meta name="author" content={restaurant?.author} />
        <meta
          name="name"
          content={restaurant?.name || restaurant?.meta_title}
        />
        <title>{restaurant?.name}</title>
        <link rel="icon" href={restaurant?.logo_full_url} />
      </head>
      <body>
        <ThemeContextProvider>
          <AppShell details={restaurant}>{children}</AppShell>
        </ThemeContextProvider>
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
