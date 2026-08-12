"use client";

import wedding from "../data/wedding";

export default function RSVP() {
  return (
    <section
      id="rsvp"
      className="wedding-scene"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 20px",
        overflow: "hidden",

        backgroundImage: `
          linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)),
          url(${wedding.rsvpImage})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          width: "100%",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-heading)",
            color: "#D4AF37",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            fontSize: "15px",
            fontWeight: 400,
          }}
        >
          RSVP
        </p>

        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(40px, 6vw, 60px)",
            fontWeight: 400,
            letterSpacing: "0.02em",
            lineHeight: 1.2,
            margin: "20px 0 50px",
          }}
        >
          We&apos;d Love To Celebrate With You
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <input placeholder="Full Name" style={inputStyle} />
          <input placeholder="Phone Number" style={inputStyle} />
          <input placeholder="Email" style={inputStyle} />

          <select style={inputStyle}>
            <option>Guests</option>
            <option>1 Guest</option>
            <option>2 Guests</option>
            <option>3 Guests</option>
          </select>

          <textarea
            rows={5}
            placeholder="Blessing..."
            style={inputStyle}
          />

          <button
            style={{
              fontFamily: "var(--font-body)",
              padding: "18px",
              borderRadius: "999px",
              background: "#D4AF37",
              border: "none",
              color: "#fff",
              fontSize: "17px",
              fontWeight: 400,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Submit RSVP
          </button>
        </div>
      </div>
    </section>
  );
}

const inputStyle = {
  width: "100%",
  padding: "18px",
  borderRadius: "12px",
  border: "none",
  fontFamily: "var(--font-body)",
  fontSize: "17px",
  fontWeight: 400,
  letterSpacing: "0.01em",
  boxSizing: "border-box" as const,
};
