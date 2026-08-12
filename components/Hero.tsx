"use client";

import { greatVibes } from "@/app/fonts";
import wedding from "../data/wedding";
import Countdown from "./Countdown";

export default function Hero() {
  return (
    <section id="home" className="wedding-scene wedding-hero">
      {/*
        Dedicated <img> paint layer — more reliable than CSS background
        (and background-attachment:fixed) on iOS Safari.
      */}
      <div className="wedding-hero__media" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="wedding-hero__photo"
          src={wedding.heroImage}
          alt=""
          decoding="async"
          fetchPriority="high"
        />
      </div>
      <div className="wedding-hero__shade" aria-hidden="true" />

      <div className="wedding-hero__content">
        <p className="wedding-hero__date">{wedding.date}</p>

        <h1 className={`wedding-hero__title ${greatVibes.className}`}>
          <span className={`wedding-hero__title-line ${greatVibes.className}`}>
            {wedding.groom} &
          </span>
          <span className={`wedding-hero__title-line ${greatVibes.className}`}>
            {wedding.bride}
          </span>
        </h1>

        <p className="wedding-hero__statement">Welcome to our day</p>

        <Countdown />
      </div>
    </section>
  );
}
