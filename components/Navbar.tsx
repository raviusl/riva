"use client";

import type { SyntheticEvent } from "react";

export default function Navbar() {
  const scrollHome = () => {
    const home = document.getElementById("home");

    if (home) {
      home.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hideBroken = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.visibility = "hidden";
  };

  return (
    <nav className="wedding-header" aria-label="Site header">
      <div className="wedding-header__logos">
        <button
          type="button"
          className="wedding-header__logo-btn"
          onClick={scrollHome}
          aria-label="Back to top"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="wedding-header__logo wedding-header__logo--couple"
            src="/assets/couple-logo.png"
            alt="Couple monogram"
            decoding="async"
            onError={hideBroken}
          />
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="wedding-header__logo wedding-header__logo--ruyan"
          src="/assets/ruyan-weddings-logo.png"
          alt="RuYan Weddings"
          decoding="async"
          onError={hideBroken}
        />
      </div>

      <p className="wedding-header__tagline">A Beautiful Beginning</p>
    </nav>
  );
}
