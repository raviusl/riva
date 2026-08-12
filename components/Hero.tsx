"use client";

import wedding from "../data/wedding";
import Countdown from "./Countdown";

export default function Hero() {
  return (
    <section
      id="home"
      style={{
        minHeight: "100vh",
        position: "relative",
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
            letterSpacing: "10px",
            textTransform: "uppercase",
            color: "#F4D06F",
            fontSize: "18px",
            marginBottom: "30px",
          }}
        >
          {wedding.date}
        </p>

        <h1
          style={{
            fontSize: "90px",
            fontFamily: "Cormorant Garamond, serif",
            fontWeight: 500,
            lineHeight: 1.1,
            marginBottom: "30px",
          }}
        >
          {wedding.groom} & {wedding.bride}
        </h1>

        <p
          style={{
            fontSize: "30px",
            color: "#ffffff",
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