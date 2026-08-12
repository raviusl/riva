"use client";

import wedding from "../data/wedding";

export default function Navbar() {
  const menu = [
    { name: "Home", id: "home" },
    { name: "Story", id: "story" },
    { name: "Timeline", id: "timeline" },
    { name: "Venue", id: "venue" },
    { name: "RSVP", id: "rsvp" },
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        background: "rgba(255,255,255,0.65)",
        borderBottom: "1px solid rgba(255,255,255,.25)",
        padding: "22px 50px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h2
        style={{
          fontSize: "30px",
          fontFamily: "serif",
          color: "#222",
          cursor: "pointer",
        }}
        onClick={() => scrollTo("home")}
      >
        {wedding.bride} ❤️ {wedding.groom}
      </h2>

      <div
        style={{
          display: "flex",
          gap: "35px",
        }}
      >
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#444",
              fontSize: "17px",
              transition: ".3s",
            }}
          >
            {item.name}
          </button>
        ))}
      </div>
    </nav>
  );
}