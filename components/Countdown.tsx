"use client";

import { useEffect, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const targetDate = new Date("2026-10-24T18:00:00+08:00").getTime();

function calculateTimeLeft(): TimeLeft {
  const difference = targetDate - Date.now();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor(
      (difference / (1000 * 60 * 60)) % 24
    ),
    minutes: Math.floor(
      (difference / (1000 * 60)) % 60
    ),
    seconds: Math.floor(
      (difference / 1000) % 60
    ),
  };
}

function Unit({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      className="wedding-countdown__unit"
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: "9px",
      }}
    >
      <span
        className="wedding-countdown__value"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(42px, 5vw, 68px)",
          lineHeight: 1,
          fontWeight: 400,
          letterSpacing: "0.02em",
          color: "#fff",
          textShadow: "0 2px 18px rgba(0,0,0,0.28)",
        }}
      >
        {String(value).padStart(2, "0")}
      </span>

      <span
        className="wedding-countdown__label"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "10px",
          letterSpacing: "0.22em",
          fontWeight: 400,
          color: "rgba(255,255,255,0.82)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const timer = window.setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div
      className="wedding-countdown"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        columnGap: "26px",
        rowGap: "14px",
        width: "100%",
        padding: "0 24px",
      }}
    >
      <Unit value={timeLeft.days} label="Days" />

      <span
        className="wedding-countdown__dot"
        style={{
          color: "rgba(255,255,255,0.55)",
          fontFamily: "var(--font-body)",
          fontSize: "25px",
        }}
      >
        ·
      </span>

      <Unit value={timeLeft.hours} label="Hours" />

      <span
        className="wedding-countdown__dot"
        style={{
          color: "rgba(255,255,255,0.55)",
          fontFamily: "var(--font-body)",
          fontSize: "25px",
        }}
      >
        ·
      </span>

      <Unit value={timeLeft.minutes} label="Minutes" />

      <span
        className="wedding-countdown__dot"
        style={{
          color: "rgba(255,255,255,0.55)",
          fontFamily: "var(--font-body)",
          fontSize: "25px",
        }}
      >
        ·
      </span>

      <Unit value={timeLeft.seconds} label="Seconds" />
    </div>
  );
}
