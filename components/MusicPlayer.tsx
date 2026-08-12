"use client";

import { useEffect, useRef, useState } from "react";

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const startMusic = async () => {
    const audio = audioRef.current;

    if (!audio) return;

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.loop = true;
    audio.volume = 0.42;

    const tryAutoplay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    };

    tryAutoplay();

    const handleInteraction = () => {
      startMusic();

      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);
    window.addEventListener("pointerdown", handleInteraction);
    window.addEventListener("keydown", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  const toggleMusic = async () => {
    const audio = audioRef.current;

    if (!audio) return;

    try {
      if (audio.paused) {
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch {
      setIsPlaying(false);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/assets/audio/wedding.mp3"
        preload="auto"
        loop
      />

      <button
        onClick={toggleMusic}
        aria-label={isPlaying ? "Pause music" : "Play music"}
        className="wedding-music-btn"
        style={{
          position: "fixed",
          left: "28px",
          bottom: "28px",
          zIndex: 9999,

          width: "54px",
          height: "54px",

          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.38)",

          background: "rgba(20,20,20,0.22)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",

          color: "#fff",
          cursor: "pointer",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          fontFamily: "var(--font-body)",
          fontSize: "20px",
          fontWeight: 400,

          boxShadow: "0 8px 30px rgba(0,0,0,0.16)",

          transition: "all 0.3s ease",
        }}
      >
        {isPlaying ? "Ⅱ" : "♪"}
      </button>
    </>
  );
}