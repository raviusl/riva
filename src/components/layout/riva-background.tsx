/**
 * Project 068 / 068.1 — RIVA OS Brand Background System
 *
 * Fixed full-viewport atmosphere. Mount once at the app root.
 * Landscape must be visually readable (not a flat black panel).
 */
export function RivaBackground() {
  return (
    <div
      aria-hidden
      data-riva-background
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Layer 1 — warm gray base (#191919) */}
      <div className="absolute inset-0 bg-[#191919]" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 120% 80% at 50% -5%, rgba(90, 86, 80, 0.45), transparent 58%),
            linear-gradient(180deg, #22201e 0%, #191919 42%, #141312 100%)
          `,
        }}
      />

      {/* Layer 2 — Chinese ink landscape (inline SVG so it always paints) */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMax slice"
        style={{ opacity: 0.72, filter: "blur(10px)" }}
      >
        <defs>
          <linearGradient id="rivaBgSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e7e5e4" stopOpacity="0.22" />
            <stop offset="45%" stopColor="#c4c0bb" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#8a847c" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="rivaBgMist" cx="50%" cy="28%" r="55%">
            <stop offset="0%" stopColor="#f5f5f4" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f5f5f4" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1600" height="900" fill="url(#rivaBgSky)" />
        <ellipse cx="780" cy="210" rx="620" ry="190" fill="url(#rivaBgMist)" />
        {/* Far peaks */}
        <path
          d="M0 500 C180 450 300 420 460 445 C620 470 720 390 880 415 C1040 440 1160 370 1320 400 C1460 425 1540 450 1600 440 L1600 900 L0 900 Z"
          fill="#d6d3d1"
          fillOpacity="0.72"
        />
        {/* Mid ridge */}
        <path
          d="M0 610 C220 550 380 580 560 560 C780 535 920 490 1100 525 C1280 560 1440 520 1600 545 L1600 900 L0 900 Z"
          fill="#a8a29e"
          fillOpacity="0.68"
        />
        {/* Near foothills */}
        <path
          d="M0 730 C280 680 520 710 780 690 C1080 665 1300 705 1600 680 L1600 900 L0 900 Z"
          fill="#78716c"
          fillOpacity="0.62"
        />
        {/* Soft pine marks */}
        <path
          d="M1220 500 C1238 450 1255 410 1268 370 C1285 420 1310 470 1335 510 C1295 500 1250 495 1220 500 Z"
          fill="#44403c"
          fillOpacity="0.55"
        />
        <path
          d="M280 540 C296 495 312 458 324 420 C340 465 362 510 386 548 C350 538 312 534 280 540 Z"
          fill="#44403c"
          fillOpacity="0.45"
        />
        {/* River line */}
        <path
          d="M0 770 C400 745 820 790 1200 760 C1400 742 1520 750 1600 735"
          stroke="#e7e5e4"
          strokeOpacity="0.5"
          strokeWidth="18"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Soft veil — readable UI without erasing silhouette */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(25,25,25,0) 0%, rgba(25,25,25,0.06) 55%, rgba(25,25,25,0.14) 100%)",
        }}
      />
    </div>
  );
}
