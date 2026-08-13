"use client";

import wedding from "../data/wedding";

export default function Timeline() {
  return (
    <section
      id="timeline"
      className="wedding-scene"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `
          linear-gradient(
            to bottom,
            rgba(0,0,0,.22) 0%,
            rgba(0,0,0,.55) clamp(88px, 18vh, 170px),
            rgba(0,0,0,.55) 100%
          ),
          url(${wedding.timelineImage})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        /* scroll — fixed attachment breaks edge mask dissolve between scenes */
        backgroundAttachment: "scroll",
        padding: "120px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          color: "#fff",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-heading)",
            textAlign: "center",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#D4AF37",
            marginBottom: "24px",
            fontSize: "15px",
            fontWeight: 400,
          }}
        >
          Timeline
        </p>

        <h2
          className="wedding-text-depth"
          style={{
            fontFamily: "var(--font-display)",
            textAlign: "center",
            fontSize: "clamp(42px, 6vw, 64px)",
            fontWeight: 400,
            letterSpacing: "0.02em",
            lineHeight: 1.15,
            marginBottom: "80px",
          }}
        >
          Our Journey
        </h2>

        {wedding.timeline.map((item: any, index: number) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: "40px",
              marginBottom: "50px",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-heading)",
                minWidth: "120px",
                color: "#D4AF37",
                fontWeight: 400,
                fontSize: "18px",
                letterSpacing: "0.04em",
              }}
            >
              {item.date}
            </div>

            <div
              className="wedding-soft-card"
              style={{
                flex: 1,
                borderRadius: "24px",
                padding: "30px",
              }}
            >
              <h3
                className="wedding-text-depth"
                style={{
                  fontFamily: "var(--font-display)",
                  marginBottom: "14px",
                  fontSize: "28px",
                  fontWeight: 400,
                  letterSpacing: "0.02em",
                  lineHeight: 1.2,
                }}
              >
                {item.title}
              </h3>

              <p
                style={{
                  fontFamily: "var(--font-body)",
                  color: "rgba(255,255,255,.9)",
                  lineHeight: 1.8,
                  fontSize: "17px",
                  fontWeight: 400,
                  letterSpacing: "0.01em",
                  margin: 0,
                }}
              >
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
