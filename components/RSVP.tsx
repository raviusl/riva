"use client";

import { FormEvent, useState } from "react";
import wedding from "../data/wedding";

type SubmitStatus = "idle" | "loading" | "success" | "error";

export default function RSVP() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [guests, setGuests] = useState("Guests");
  const [blessing, setBlessing] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [message, setMessage] = useState("");

  const isSubmitting = status === "loading";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    const endpoint = process.env.NEXT_PUBLIC_RSVP_GOOGLE_SHEETS_URL?.trim();

    if (!endpoint) {
      setStatus("error");
      setMessage("RSVP is not configured yet. Please try again later.");
      return;
    }

    if (!fullName.trim()) {
      setStatus("error");
      setMessage("Please enter your full name.");
      return;
    }

    if (guests === "Guests") {
      setStatus("error");
      setMessage("Please select the number of guests.");
      return;
    }

    setStatus("loading");
    setMessage("");

    const payload = {
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.trim(),
      guests,
      blessing: blessing.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      // text/plain avoids a CORS preflight with Google Apps Script Web Apps
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const result = (await response.json().catch(() => null)) as
        | { result?: string; error?: string }
        | null;

      if (result && result.result && result.result !== "success") {
        throw new Error(result.error || "Submission failed");
      }

      setStatus("success");
      setMessage("Thank you! Your RSVP has been received.");
      setFullName("");
      setPhoneNumber("");
      setEmail("");
      setGuests("Guests");
      setBlessing("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again in a moment.");
    }
  };

  return (
    <section
      id="rsvp"
      className="wedding-scene"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 20px",

        backgroundImage: `
          linear-gradient(
            to bottom,
            rgba(0,0,0,.22) 0%,
            rgba(0,0,0,.55) clamp(88px, 18vh, 170px),
            rgba(0,0,0,.55) 100%
          ),
          url(${wedding.rsvpImage})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        /* scroll — fixed attachment breaks edge mask dissolve between scenes */
        backgroundAttachment: "scroll",
      }}
    >
      <div
        className="wedding-rsvp__panel"
        style={{
          maxWidth: "700px",
          width: "100%",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <h2 className="wedding-rsvp__title">
          Kindly fill in your details to reserve your place.
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <input
            placeholder="Full Name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            disabled={isSubmitting}
            style={inputStyle}
            autoComplete="name"
          />
          <input
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            disabled={isSubmitting}
            style={inputStyle}
            autoComplete="tel"
          />
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSubmitting}
            style={inputStyle}
            autoComplete="email"
          />

          <select
            value={guests}
            onChange={(event) => setGuests(event.target.value)}
            disabled={isSubmitting}
            style={inputStyle}
          >
            <option>Guests</option>
            <option>1 Guest</option>
            <option>2 Guests</option>
            <option>3 Guests</option>
          </select>

          <textarea
            rows={5}
            placeholder="Blessing..."
            value={blessing}
            onChange={(event) => setBlessing(event.target.value)}
            disabled={isSubmitting}
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="wedding-rsvp__submit"
            style={{
              padding: "18px",
              borderRadius: "999px",
              background: "#D4AF37",
              border: "none",
              color: "#fff",
              fontSize: "17px",
              textTransform: "uppercase",
              cursor: isSubmitting ? "wait" : "pointer",
              opacity: isSubmitting ? 0.75 : 1,
            }}
          >
            {isSubmitting ? "Submitting..." : "Join Us"}
          </button>

          {message ? (
            <p
              role="status"
              aria-live="polite"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "16px",
                fontWeight: 400,
                letterSpacing: "0.02em",
                lineHeight: 1.6,
                margin: "4px 0 0",
                color:
                  status === "success"
                    ? "#F4D06F"
                    : status === "error"
                      ? "#FFD0D0"
                      : "rgba(255,255,255,0.92)",
              }}
            >
              {message}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}

const inputStyle = {
  width: "100%",
  padding: "18px",
  borderRadius: "12px",
  border: "none",
  fontFamily: "var(--font-body)",
  fontSize: "17px",
  fontWeight: 400,
  letterSpacing: "0.01em",
  boxSizing: "border-box" as const,
};
