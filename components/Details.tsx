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

        backgroundImage: `
          linear-gradient(
            to bottom,
            rgba(0,0,0,.18) 0%,
            rgba(0,0,0,.45) clamp(88px, 18vh, 170px),
            rgba(0,0,0,.45) 100%
          ),
          url(${wedding.detailsImage})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        /* scroll — fixed attachment breaks edge mask dissolve between scenes */
        backgroundAttachment: "scroll",

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
          className="wedding-text-depth"
          style={{
            fontFamily: "var(--font-display)",
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
            src={wedding.detailsImage}
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
            <Info title="Date" value={wedding.date} />
            <Info
              title="Time"
              value={`Dinner ${wedding.details.receptionTime}`}
              valueClassName="wedding-details__time"
            />
            <Info title="Venue" value={wedding.venue} />
            <Info title="Dress Code" value={wedding.details.attire} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Info({
  title,
  value,
  valueClassName,
}: {
  title: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div
      className="wedding-soft-card"
      style={{
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
        className={valueClassName}
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
