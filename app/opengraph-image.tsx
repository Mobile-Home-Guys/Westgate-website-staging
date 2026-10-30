import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(140deg, #0b1f2d 0%, #145375 55%, #3690c6 100%)",
          padding: 72,
          color: "#f7f4ef",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="52" height="44" viewBox="0 0 34 28">
            <path d="M2 14 17 3l15 11" fill="none" stroke="#f7f4ef" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 16h20v9H7z" fill="none" stroke="#f7f4ef" strokeWidth="2" />
            <path d="M2 25.5h30" stroke="#f77300" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 38, letterSpacing: -1 }}>{site.short}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 84, lineHeight: 1.02, letterSpacing: -3, maxWidth: 900 }}>
            Discover the Westgate Difference
          </span>
          <span
            style={{
              marginTop: 28,
              fontSize: 28,
              color: "rgba(247,244,239,0.72)",
              fontFamily: "sans-serif",
              maxWidth: 820,
            }}
          >
            Manufactured &amp; modular homes — {site.address.city}, {site.address.region}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: 40,
            fontFamily: "monospace",
            fontSize: 20,
            color: "rgba(247,244,239,0.55)",
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          <span>Since 1961</span>
          <span>·</span>
          <span>Live Oak Homes</span>
          <span>·</span>
          <span>TownHomes</span>
        </div>
      </div>
    ),
    size,
  );
}
