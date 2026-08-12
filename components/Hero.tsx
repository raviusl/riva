"use client";

import wedding from "../data/wedding";
import Countdown from "./Countdown";

export default function Hero() {
  return (
    <section
      id="home"
      className="wedding-scene"
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        overflow: "hidden",

        backgroundImage: `
          linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)),
          url(${wedding.heroImage})
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
          padding: "40px",
          maxWidth: "1100px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-heading)",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#F4D06F",
            fontSize: "15px",
            fontWeight: 400,
            marginBottom: "28px",
          }}
        >
          {wedding.date}
        </p>

        <h1
          style={{
            fontFamily: "var(--font-couple)",
            fontSize: "clamp(64px, 11vw, 108px)",
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: "0.02em",
            marginBottom: "28px",
          }}
        >
          {wedding.groom} & {wedding.bride}
        </h1>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "20px",
            fontWeight: 400,
            letterSpacing: "0.06em",
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.95)",
            marginBottom: "60px",
          }}
        >
          {wedding.location}
        </p>

        <Countdown />
      </div>
    </section>
  );
}
