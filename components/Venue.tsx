"use client";

import wedding from "../data/wedding";

export default function Venue() {
  return (
    <section
      id="venue"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "120px 20px",

        backgroundImage: `
          linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)),
          url(${wedding.venueImage})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
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
            letterSpacing: "6px",
            color: "#D4AF37",
          }}
        >
          VENUE
        </p>

        <h2
          style={{
            fontSize: "64px",
            marginTop: "20px",
            marginBottom: "30px",
            fontFamily: "Cormorant Garamond",
          }}
        >
          Grand Hyatt Kuala Lumpur
        </h2>

        <p
          style={{
            fontSize: "22px",
            lineHeight: 1.8,
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