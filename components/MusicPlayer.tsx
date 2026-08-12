"use client";

import { useEffect, useRef, useState } from "react";

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.volume = 0.4;

    const playMusic = async () => {
      try {
        await audio.play();
        setPlaying(true);
      } catch {}
    };

    playMusic();

    const unlock = () => {
      playMusic();

      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };

    window.addEventListener("click", unlock);
    window.addEventListener("touchstart", unlock);

    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  const toggleMusic = () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (audio.paused) {
      audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} loop preload="auto">
        <source
          src="/assets/audio/Wedding.mp3"
          type="audio/mpeg"
        />
      </audio>

      <button
        onClick={toggleMusic}
        style={{
          position: "fixed",
          bottom: "28px",
          left: "28px",
          width: "60px",
          height: "60px",
          borderRadius: "999px",
          border: "none",
          background: "rgba(255,255,255,.18)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          color: "#fff",
          fontSize: "24px",
          cursor: "pointer",
          zIndex: 99999,
        }}
      >
        {playing ? "♫" : "▶"}
      </button>
    </>
  );
}