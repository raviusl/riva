"use client";

import wedding from "../data/wedding";

export default function Details() {
  return (
    <section
      id="details"
      className="wedding-scene"
      style={{
        minHeight: "100vh",
        padding: "120px 40px",
        overflow: "hidden",

        backgroundImage: `
          linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)),
          url(${wedding.detailsImage})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",

        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1300px",
          color: "#fff",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-heading)",
            textAlign: "center",
            letterSpacing: "0.28em",
            color: "#D4AF37",
            textTransform: "uppercase",
            marginBottom: "20px",
            fontSize: "15px",
            fontWeight: 400,
          }}
        >
          Wedding Details
        </p>

        <h2
          style={{
            fontFamily: "var(--font-heading)",
            textAlign: "center",
            fontSize: "clamp(42px, 6vw, 64px)",
            fontWeight: 400,
            letterSpacing: "0.02em",
            lineHeight: 1.15,
            marginBottom: "70px",
          }}
        >
          Join Us On Our Special Day
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "60px",
            alignItems: "center",
          }}
        >
          <img
            src="/assets/images/details/photo.jpg"
            alt=""
            style={{
              width: "100%",
              height: "700px",
              objectFit: "cover",
              borderRadius: "28px",
              boxShadow: "0 25px 70px rgba(0,0,0,.35)",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <Info title="Date" value="24 October 2026" />
            <Info title="Time" value="5:00 PM" />
            <Info title="Venue" value="Grand Hyatt Kuala Lumpur" />
            <Info title="Dress Code" value="Formal · Champagne Gold" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Info({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,.12)",
        backdropFilter: "blur(18px)",
        borderRadius: "22px",
        padding: "28px 34px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-heading)",
          color: "#D4AF37",
          letterSpacing: "0.18em",
          marginBottom: "10px",
          textTransform: "uppercase",
          fontSize: "13px",
          fontWeight: 400,
        }}
      >
        {title}
      </p>

      <h3
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "26px",
          fontWeight: 400,
          letterSpacing: "0.02em",
          lineHeight: 1.35,
          margin: 0,
        }}
      >
        {value}
      </h3>
    </div>
  );
}
