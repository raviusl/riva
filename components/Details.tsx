"use client";

import wedding from "../data/wedding";

export default function Details() {
  return (
    <section
      id="details"
      style={{
        minHeight: "100vh",
        padding: "120px 40px",

        backgroundImage: `
          linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)),
          url(${wedding.detailsImage})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
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
            textAlign: "center",
            letterSpacing: "6px",
            color: "#D4AF37",
            textTransform: "uppercase",
            marginBottom: "20px",
          }}
        >
          Wedding Details
        </p>

        <h2
          style={{
            textAlign: "center",
            fontSize: "64px",
            fontFamily: "Cormorant Garamond, serif",
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
          color: "#D4AF37",
          letterSpacing: "3px",
          marginBottom: "10px",
          textTransform: "uppercase",
          fontSize: "14px",
        }}
      >
        {title}
      </p>

      <h3
        style={{
          fontSize: "30px",
          fontWeight: 400,
          margin: 0,
        }}
      >
        {value}
      </h3>
    </div>
  );
}