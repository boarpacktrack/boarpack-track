"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false)

useEffect(() => {
  const checkScreenSize = () => {
    setIsMobile(window.innerWidth <= 767)
  }

  checkScreenSize()
  window.addEventListener("resize", checkScreenSize)

  return () => {
    window.removeEventListener("resize", checkScreenSize)
  }
}, [])

  async function handleLogin(event) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main style={styles.page}>
      <div style={styles.backgroundGlowOne} />
      <div style={styles.backgroundGlowTwo} />

   <section
  style={{
    ...styles.layout,
    gridTemplateColumns: isMobile ? "1fr" : styles.layout.gridTemplateColumns,
    gap: isMobile ? "24px" : styles.layout.gap,
    padding: isMobile ? "20px 16px" : styles.layout.padding,
  }}
>
        <div style={styles.brandPanel}>
          <div style={styles.brandBadge}>BOAR PACK TRACK</div>

          <h1 style={styles.mainHeading}>
            Built by coaches.
            <br />
            Built for the pack.
          </h1>

          <p style={styles.introText}>
            Player development, attendance, matchday management and club
            communication—all in one secure rugby platform.
          </p>

          <div style={styles.featureGrid}>
            <div style={styles.featureCard}>
              <span style={styles.featureIcon}>🏉</span>
              <div>
                <strong style={styles.featureTitle}>Player Development</strong>
                <p style={styles.featureText}>
                  Track progress, goals, reviews and achievements.
                </p>
              </div>
            </div>

            <div style={styles.featureCard}>
              <span style={styles.featureIcon}>📊</span>
              <div>
                <strong style={styles.featureTitle}>Club Insight</strong>
                <p style={styles.featureText}>
                  Attendance, match statistics and squad reports.
                </p>
              </div>
            </div>

            <div style={styles.featureCard}>
              <span style={styles.featureIcon}>🔐</span>
              <div>
                <strong style={styles.featureTitle}>Secure Access</strong>
                <p style={styles.featureText}>
                  Dedicated access for coaches, parents and club officials.
                </p>
              </div>
            </div>
          </div>

          <div style={styles.sponsorSection}>
            <p style={styles.sponsorHeading}>DEMONSTRATION PARTNERS</p>

            <div style={styles.sponsorGrid}>
              <div style={styles.sponsorCard}>
                <div style={styles.sponsorLogo}>
  <img
    src="/sponsors/boar-pack-sponsor-logo.png"
    alt="Boar Pack Rugby Academy"
    style={{
  width: "50px",
  height: "50px",
  objectFit: "contain",
  borderRadius: "8px",
}}
  />
</div>
                <div>
                  <strong style={styles.sponsorName}>
                    Boar Pack Rugby Academy
                  </strong>
                  <p style={styles.sponsorText}>
                    Official Player Development Partner
                  </p>
                </div>
              </div>

              <div style={styles.sponsorCard}>
                <div style={styles.sponsorLogo}>
  <img
    src="/sponsors/ib-automotive-logo.jpg"
    alt="IB Automotive"
   style={{
  width: "50px",
  height: "50px",
  objectFit: "contain",
  borderRadius: "8px",
}}
  />
</div>
                <div>
                  <strong style={styles.sponsorName}>IB Automotive</strong>
                  <p style={styles.sponsorText}>
                    Official Photography Partner
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.loginPanel}>
          <div style={styles.loginCard}>
           <div style={styles.logoCircle}>
  <img
    src="/boarpack-logo.png"
    alt="Boar Pack Track"
    style={{
      width: "42px",
      height: "42px",
      objectFit: "contain",
    }}
  />
</div>

            <p style={styles.eyebrow}>BOAR PACK TRACK</p>

            <h2 style={styles.loginHeading}>Welcome back</h2>

            <p style={styles.loginSubheading}>
              Sign in to access your club dashboard.
            </p>

            <form onSubmit={handleLogin} style={styles.form}>
              <div style={styles.field}>
                <label htmlFor="email" style={styles.label}>
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  style={styles.input}
                  autoComplete="email"
                  required
                />
              </div>

              <div style={styles.field}>
                <label htmlFor="password" style={styles.label}>
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  style={styles.input}
                  autoComplete="current-password"
                  required
                />
              </div>

              {errorMessage && (
                <div style={styles.errorBox}>{errorMessage}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.loginButton,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Signing in..." : "Sign in to Boar Pack Track"}
              </button>
            </form>

            <div style={styles.securityNotice}>
              <span>🛡️</span>
              <span>
                Secure club access. GDPR and safeguarding controls coming next.
              </span>
            </div>

            <p style={styles.supportText}>
              Need access? Contact your club administrator.
            </p>
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        <span>BOAR PACK TRACK</span>
        <span>•</span>
        <span>TEAMWORK</span>
        <span>•</span>
        <span>RESPECT</span>
        <span>•</span>
        <span>ENJOYMENT</span>
        <span>•</span>
        <span>DISCIPLINE</span>
        <span>•</span>
        <span>SPORTSMANSHIP</span>
      </footer>
    </main>
  );
}

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #061120 0%, #0b1e3a 48%, #071324 100%)",
    color: "#ffffff",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  backgroundGlowOne: {
    position: "absolute",
    width: "520px",
    height: "520px",
    borderRadius: "50%",
    background: "rgba(245,181,27,0.12)",
    filter: "blur(90px)",
    top: "-180px",
    left: "-130px",
  },

  backgroundGlowTwo: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "rgba(28,100,210,0.18)",
    filter: "blur(100px)",
    right: "-170px",
    bottom: "-180px",
  },

  layout: {
    position: "relative",
    zIndex: 2,
    width: "min(1180px, calc(100% - 32px))",
    minHeight: "calc(100vh - 74px)",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.2fr) minmax(340px, 0.8fr)",
    alignItems: "center",
    gap: "52px",
    padding: "42px 0",
  },

  brandPanel: {
    padding: "20px 0",
  },

  brandBadge: {
    display: "inline-block",
    padding: "9px 14px",
    border: "1px solid rgba(245,181,27,0.55)",
    borderRadius: "999px",
    background: "rgba(245,181,27,0.1)",
    color: "#f5b51b",
    fontSize: "12px",
    fontWeight: "900",
    letterSpacing: "1.7px",
  },

  mainHeading: {
    margin: "24px 0 18px",
    fontSize: "clamp(42px, 6vw, 76px)",
    lineHeight: "0.98",
    letterSpacing: "-2px",
    textTransform: "uppercase",
  },

  introText: {
    maxWidth: "650px",
    margin: "0 0 28px",
    color: "#c6d3e5",
    fontSize: "18px",
    lineHeight: "1.65",
  },

  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
  },

  featureCard: {
    display: "flex",
    gap: "11px",
    padding: "16px",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.055)",
    backdropFilter: "blur(14px)",
  },

  featureIcon: {
    fontSize: "23px",
  },

  featureTitle: {
    display: "block",
    marginBottom: "6px",
    color: "#ffffff",
    fontSize: "14px",
  },

  featureText: {
    margin: 0,
    color: "#aebdd1",
    fontSize: "12px",
    lineHeight: "1.45",
  },

  sponsorSection: {
    marginTop: "30px",
  },

  sponsorHeading: {
    margin: "0 0 10px",
    color: "#f5b51b",
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "1.6px",
  },

  sponsorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  },

  sponsorCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px",
    borderRadius: "13px",
    background: "rgba(3,12,25,0.68)",
    border: "1px solid rgba(245,181,27,0.3)",
  },

  sponsorLogo: {
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  width: "56px",
  height: "56px",
  borderRadius: "12px",
  background: "linear-gradient(145deg, #f5b51b, #ffd86a)",
  overflow: "hidden",
},

  sponsorName: {
    display: "block",
    color: "#ffffff",
    fontSize: "14px",
  },

  sponsorText: {
    margin: "4px 0 0",
    color: "#9fb0c7",
    fontSize: "11px",
  },

  loginPanel: {
    display: "flex",
    justifyContent: "center",
  },

  loginCard: {
    width: "100%",
    maxWidth: "430px",
    padding: "34px",
    border: "1px solid rgba(245,181,27,0.42)",
    borderRadius: "24px",
    background:
      "linear-gradient(165deg, rgba(15,35,66,0.97), rgba(5,16,32,0.97))",
    boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
    backdropFilter: "blur(18px)",
  },

  logoCircle: {
    display: "grid",
    placeItems: "center",
    width: "68px",
    height: "68px",
    marginBottom: "20px",
    borderRadius: "18px",
    background: "linear-gradient(145deg, #f5b51b, #ffd768)",
    boxShadow: "0 12px 35px rgba(245,181,27,0.25)",
    fontSize: "36px",
  },

  eyebrow: {
    margin: "0 0 8px",
    color: "#f5b51b",
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "1.7px",
  },

  loginHeading: {
    margin: 0,
    fontSize: "34px",
    letterSpacing: "-1px",
  },

  loginSubheading: {
    margin: "10px 0 25px",
    color: "#aebdd1",
    lineHeight: "1.5",
  },

  form: {
    display: "grid",
    gap: "18px",
  },

  field: {
    display: "grid",
    gap: "8px",
  },

  label: {
    color: "#e7edf6",
    fontSize: "13px",
    fontWeight: "800",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    border: "1px solid rgba(255,255,255,0.17)",
    borderRadius: "11px",
    outline: "none",
    background: "rgba(255,255,255,0.08)",
    color: "#ffffff",
    fontSize: "15px",
  },

  errorBox: {
    padding: "12px 14px",
    border: "1px solid rgba(255,100,100,0.5)",
    borderRadius: "10px",
    background: "rgba(150,20,20,0.22)",
    color: "#ffd6d6",
    fontSize: "13px",
    lineHeight: "1.45",
  },

  loginButton: {
    width: "100%",
    padding: "15px 18px",
    border: "none",
    borderRadius: "11px",
    background: "linear-gradient(135deg, #f5b51b, #ffd660)",
    color: "#071324",
    fontSize: "14px",
    fontWeight: "900",
    boxShadow: "0 12px 32px rgba(245,181,27,0.22)",
  },

  securityNotice: {
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    marginTop: "20px",
    padding: "12px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.045)",
    color: "#aebdd1",
    fontSize: "11px",
    lineHeight: "1.5",
  },

  supportText: {
    margin: "16px 0 0",
    color: "#7789a2",
    fontSize: "11px",
    textAlign: "center",
  },

  footer: {
    position: "relative",
    zIndex: 2,
    minHeight: "74px",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    padding: "14px 22px",
    borderTop: "2px solid #f5b51b",
    background: "rgba(3,10,20,0.92)",
    color: "#f5b51b",
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "0.7px",
  },
};