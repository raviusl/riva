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
      >
        Jun Yu & Samuel
      </h2>

      <p className="wedding-header__tagline">A Beautiful Beginning</p>
    </nav>
  );
}
