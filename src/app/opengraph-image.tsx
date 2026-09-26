import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SANS_TEXT = "MotiondeckPresentations that.Type a topic. Get an animated deck in under a minute.";
const SERIF_TEXT = "move";

// Google Fonts returns a TTF when asked for a text subset, which Satori can read.
async function googleFont(family: string, text: string) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`,
  ).then((response) => response.text());
  const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error(`No font file for ${family}`);
  return fetch(url).then((response) => response.arrayBuffer());
}

async function loadFonts() {
  try {
    const [sans, serif] = await Promise.all([
      googleFont("Geist:wght@500", SANS_TEXT),
      googleFont("Instrument+Serif:ital@1", SERIF_TEXT),
    ]);
    return [
      { name: "Geist", data: sans, weight: 500 as const, style: "normal" as const },
      { name: "Instrument Serif", data: serif, weight: 400 as const, style: "italic" as const },
    ];
  } catch (error) {
    // Offline builds still produce an image, just in the default font.
    console.warn("[og] falling back to the default font:", error);
    return [];
  }
}

export default async function OpengraphImage() {
  const fonts = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#FAFAF7",
          color: "#0B0B0C",
          fontFamily: "Geist",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 34, letterSpacing: "-0.02em" }}>
          <div style={{ display: "flex", position: "relative", width: 40, height: 40 }}>
            <div
              style={{
                position: "absolute",
                left: 12,
                top: 6,
                width: 24,
                height: 18,
                borderRadius: 4,
                background: "rgba(11,11,12,0.22)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 4,
                top: 16,
                width: 24,
                height: 18,
                borderRadius: 4,
                background: "#0B0B0C",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 10,
                top: 26,
                width: 8,
                height: 3,
                borderRadius: 2,
                background: "#FF5A1F",
              }}
            />
          </div>
          Motiondeck
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 128,
            lineHeight: 1.02,
            letterSpacing: "-0.035em",
          }}
        >
          <span>Presentations</span>
          <span style={{ display: "flex", gap: 28 }}>
            that
            <span style={{ fontFamily: "Instrument Serif", fontStyle: "italic", fontSize: 136 }}>
              move
            </span>
            <span style={{ marginLeft: -28 }}>.</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 30, color: "#6B6B6B" }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: "#FF5A1F" }} />
          Type a topic. Get an animated deck in under a minute.
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
