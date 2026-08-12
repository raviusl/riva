"use client";

import { useEffect, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
};

const targetDate = new Date("2026-10-24T18:00:00+08:00").getTime();

function calculateTimeLeft(): TimeLeft {
  const difference = targetDate - Date.now();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
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
    <div className="wedding-countdown__unit">
      <span className="wedding-countdown__value">
        {String(value).padStart(2, "0")}
      </span>
      <span className="wedding-countdown__label">{label}</span>
    </div>
  );
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
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
    <div className="wedding-countdown" aria-label="Countdown to the wedding">
      <Unit value={timeLeft.days} label="Days" />
      <span className="wedding-countdown__divider" aria-hidden="true" />
      <Unit value={timeLeft.hours} label="Hours" />
      <span className="wedding-countdown__divider" aria-hidden="true" />
      <Unit value={timeLeft.minutes} label="Minutes" />
    </div>
  );
}
