"use client";

import wedding from "../data/wedding";

export default function Story() {
  return (
    <section
      id="story"
      className="wedding-scene"
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",

        backgroundImage: `
          linear-gradient(
            to bottom,
            rgba(0,0,0,.18) 0%,
            rgba(0,0,0,.45) clamp(88px, 18vh, 170px),
            rgba(0,0,0,.45) 100%
          ),
          url(${wedding.storyImage})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        /* scroll — fixed attachment breaks edge mask dissolve between scenes */
        backgroundAttachment: "scroll",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          padding: "40px",
          color: "#fff",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-heading)",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#D4AF37",
            marginBottom: "24px",
            fontSize: "15px",
            fontWeight: 400,
          }}
        >
          Our Story
        </p>

        <h2
          className="wedding-text-depth"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(42px, 6vw, 64px)",
            fontWeight: 400,
            letterSpacing: "0.02em",
            marginBottom: "40px",
            lineHeight: 1.15,
          }}
        >
          {wedding.story.title}
        </h2>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "18px",
            fontWeight: 400,
            lineHeight: 1.9,
            letterSpacing: "0.02em",
            color: "rgba(255,255,255,.92)",
            maxWidth: "760px",
            margin: "0 auto",
          }}
        >
          {wedding.story.description}
        </p>
      </div>
    </section>
  );
}
