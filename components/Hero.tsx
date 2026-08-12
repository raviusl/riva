"use client";

import { greatVibes } from "@/app/fonts";
import wedding from "../data/wedding";
import Countdown from "./Countdown";

export default function Hero() {
  return (
    <section
      id="home"
      className="wedding-scene wedding-hero"
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
        className="wedding-hero__content"
        style={{
          color: "#fff",
          padding: "40px",
          maxWidth: "1100px",
        }}
      >
        <p
          className="wedding-hero__date"
          style={{
            fontFamily: "var(--font-heading)",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#F4D06F",
            fontSize: "15px",
            fontWeight: 400,
            marginBottom: "36px",
          }}
        >
          {wedding.date}
        </p>

        <h1
          className={`wedding-hero__title ${greatVibes.className}`}
          style={{
            fontFamily: "var(--font-couple)",
            fontSize: "clamp(64px, 11vw, 108px)",
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: "0.02em",
            marginBottom: "36px",
          }}
        >
          <span
            className={`wedding-hero__title-line ${greatVibes.className}`}
            style={{ fontFamily: "var(--font-couple)" }}
          >
            {wedding.groom} &
          </span>
          <span
            className={`wedding-hero__title-line ${greatVibes.className}`}
            style={{ fontFamily: "var(--font-couple)" }}
          >
            {wedding.bride}
          </span>
        </h1>

        <p
          className="wedding-hero__statement"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "13px",
            fontWeight: 400,
            letterSpacing: "0.34em",
            textTransform: "uppercase",
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.88)",
            marginBottom: "72px",
          }}
        >
          Welcome to our day
        </p>

        <Countdown />
      </div>
    </section>
  );
}
