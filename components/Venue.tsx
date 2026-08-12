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
        overflow: "hidden",

        backgroundImage: `
          linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)),
          url(${wedding.venueImage})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
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
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(42px, 6vw, 64px)",
            fontWeight: 400,
            letterSpacing: "0.02em",
            lineHeight: 1.15,
            marginTop: "20px",
            marginBottom: "30px",
          }}
        >
          Grand Hyatt Kuala Lumpur
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
          12 Jalan Pinang,
          Kuala Lumpur City Centre,
          50450 Kuala Lumpur,
          Malaysia
        </p>
      </div>
    </section>
  );
}
