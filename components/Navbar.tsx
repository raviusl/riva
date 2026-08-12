"use client";

import { greatVibes } from "@/app/fonts";

export default function Navbar() {
  const scrollHome = () => {
    const home = document.getElementById("home");

    if (home) {
      home.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="wedding-header">
      <h2
        className={`wedding-header__brand ${greatVibes.className}`}
        onClick={scrollHome}
        style={{
          fontFamily: "var(--font-couple)",
          fontSize: "35px",
          fontWeight: 400,
          letterSpacing: "0.01em",
          lineHeight: 1.2,
          color: "#222",
          margin: 0,
          cursor: "pointer",
        }}
      >
        Jun Yu & Samuel
      </h2>

      <p
        className="wedding-header__tagline"
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "16.5px",
          fontWeight: 400,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#444",
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        A Beautiful Beginning
      </p>
    </nav>
  );
}
