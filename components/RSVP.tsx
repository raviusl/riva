"use client";

import wedding from "../data/wedding";

export default function RSVP() {
  return (
    <section
      id="rsvp"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 20px",

        backgroundImage: `
          linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)),
          url(${wedding.rsvpImage})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
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
            color: "#D4AF37",
            letterSpacing: "6px",
          }}
        >
          RSVP
        </p>

        <h2
          style={{
            fontSize: "60px",
            margin: "20px 0 50px",
            fontFamily: "Cormorant Garamond",
          }}
        >
          We'd Love To Celebrate With You
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
              padding: "18px",
              borderRadius: "999px",
              background: "#D4AF37",
              border: "none",
              color: "#fff",
              fontSize: "18px",
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
  fontSize: "18px",
  boxSizing: "border-box" as const,
};