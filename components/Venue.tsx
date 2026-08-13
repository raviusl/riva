"use client";

import wedding from "../data/wedding";

export default function Venue() {
  return (
    <section
      id="venue"
      className="wedding-scene"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "120px 20px",

        backgroundImage: `
          linear-gradient(
            to bottom,
            rgba(0,0,0,.18) 0%,
            rgba(0,0,0,.45) clamp(88px, 18vh, 170px),
            rgba(0,0,0,.45) 100%
          ),
          url(${wedding.venueImage})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        /* scroll — fixed attachment breaks edge mask dissolve between scenes */
        backgroundAttachment: "scroll",
      }}
    >
      <div
        style={{
          color: "#fff",
          maxWidth: "900px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-heading)",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#D4AF37",
            fontSize: "15px",
            fontWeight: 400,
          }}
        >
          Venue
        </p>

        <h2
          className="wedding-text-depth"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(42px, 6vw, 64px)",
            fontWeight: 400,
            letterSpacing: "0.02em",
            lineHeight: 1.15,
            marginTop: "20px",
            marginBottom: "30px",
          }}
        >
          {wedding.venue}
        </h2>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "18px",
            fontWeight: 400,
            lineHeight: 1.85,
            letterSpacing: "0.02em",
            color: "rgba(255,255,255,0.95)",
          }}
        >
          {wedding.address},
          Kuala Lumpur City Centre,
          50450 Kuala Lumpur,
          Malaysia
        </p>

        <a
          href={wedding.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            marginTop: "28px",
            fontFamily: "var(--font-heading)",
            fontSize: "14px",
            fontWeight: 400,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#D4AF37",
            textDecoration: "underline",
            textUnderlineOffset: "0.35em",
          }}
        >
          Open in Google Maps
        </a>
      </div>
    </section>
  );
}
