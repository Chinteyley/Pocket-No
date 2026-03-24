import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  const siteOrigin =
    process.env.EXPO_PUBLIC_SITE_ORIGIN?.trim().replace(/\/$/, "") ?? "";
  const origin = siteOrigin || "https://pocket-no.ctey.dev";
  const description = "Witty excuses to say no, one tap away.";
  const ogImageUrl = `${origin}/og-pocket-no.png`;

  return (
    <html lang="en" style={{ backgroundColor: "#332e2a" }}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#332e2a" />
        <title>Pocket No</title>
        <meta name="application-name" content="Pocket No" />
        <meta name="apple-mobile-web-app-title" content="Pocket No" />
        <meta name="description" content={description} />

        <meta property="og:title" content="Pocket No" />
        <meta property="og:site_name" content="Pocket No" />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={origin} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta
          property="og:image:alt"
          content="Pocket No social card with the tagline The art of saying no."
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pocket No" />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImageUrl} />
        <meta
          name="twitter:image:alt"
          content="Pocket No social card with the tagline The art of saying no."
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Figtree:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />

        <ScrollViewStyleReset />
      </head>
      <body style={{ backgroundColor: "#332e2a" }}>{children}</body>
    </html>
  );
}
