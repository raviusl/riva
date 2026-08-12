"use client";

import wedding from "../data/wedding";

export default function Timeline() {
  return (
    <section
      id="timeline"
      style={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundImage: `
          linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)),
          url(${wedding.timelineImage})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
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
            textAlign: "center",
            letterSpacing: "8px",
            textTransform: "uppercase",
            color: "#D4AF37",
            marginBottom: "24px",
            fontSize: "15px",
          }}
        >
          Timeline
        </p>

        <h2
          style={{
            textAlign: "center",
            fontSize: "64px",
            fontFamily: "Cormorant Garamond, serif",
            fontWeight: 500,
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
                minWidth: "120px",
                color: "#D4AF37",
                fontWeight: 600,
                fontSize: "20px",
              }}
            >
              {item.date}
            </div>

            <div
              style={{
                flex: 1,
                backdropFilter: "blur(14px)",
                background: "rgba(255,255,255,.08)",
                border: "1px solid rgba(255,255,255,.15)",
                borderRadius: "24px",
                padding: "30px",
              }}
            >
              <h3
                style={{
                  marginBottom: "14px",
                  fontSize: "32px",
                  fontFamily: "Cormorant Garamond, serif",
                  fontWeight: 500,
                }}
              >
                {item.title}
              </h3>

              <p
                style={{
                  color: "rgba(255,255,255,.9)",
                  lineHeight: 1.8,
                  fontSize: "18px",
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