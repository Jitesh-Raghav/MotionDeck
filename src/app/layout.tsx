import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { site } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: "italic",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#fafaf7",
};

/**
 * Runs before first paint. Reveal animations only hide content under `.js`,
 * so with JS off (or broken) everything stays visible. As a safety net, 1.5s
 * after load anything in or above the viewport that hasn't revealed yet is
 * shown; if the observers never started, everything is shown.
 */
const revealScript = `(function(){var d=document.documentElement;d.classList.add('js');
function force(){var ready=d.hasAttribute('data-reveal-ready');var els=document.querySelectorAll('[data-reveal]:not([data-shown])');
for(var i=0;i<els.length;i++){if(!ready||els[i].getBoundingClientRect().top<window.innerHeight)els[i].setAttribute('data-shown','');}}
window.addEventListener('load',function(){setTimeout(force,1500);});})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: revealScript }} />
      </head>
      <body>
        <MotionProvider>{children}</MotionProvider>
        <div aria-hidden="true" className="grain" />
      </body>
    </html>
  );
}
