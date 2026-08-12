"use client";

import wedding from "../data/wedding";

export default function Story() {
  return (
    <section
      id="story"
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
          url(${wedding.storyImage})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
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
            letterSpacing: "8px",
            textTransform: "uppercase",
            color: "#D4AF37",
            marginBottom: "24px",
            fontSize: "15px",
          }}
        >
          Our Story
        </p>

        <h2
          style={{
            fontSize: "64px",
            fontFamily: "Cormorant Garamond, serif",
            fontWeight: 500,
            marginBottom: "40px",
            lineHeight: 1.1,
          }}
        >
          {wedding.story.title}
        </h2>

        <p
          style={{
            fontSize: "22px",
            lineHeight: 1.9,
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