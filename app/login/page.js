"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  async function handleLogin(event) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (!data?.user) {
        setErrorMessage(
          "Login succeeded, but your user account could not be loaded."
        );
        setLoading(false);
        return;
      }

      const { data: consent, error: consentCheckError } = await supabase
        .from("user_consents")
        .select("accepted, gdpr_version")
        .eq("user_id", data.user.id)
        .eq("accepted", true)
        .eq("gdpr_version", "1.0")
        .order("accepted_at", { ascending: false })
.limit(1)
.maybeSingle();

      if (consentCheckError) {
        console.error("Consent check error:", consentCheckError);

        setErrorMessage(
          "We could not check your consent status. Please try again."
        );

        setLoading(false);
        return;
      }

      if (!consent) {
        router.replace("/gdpr");
        return;
      }

      router.replace("/dashboard");
    } catch (error) {
      console.error("Unexpected login error:", error);

      setErrorMessage(
        "Something went wrong while signing in. Please try again."
      );

      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.backgroundGlowOne} />
      <div style={styles.backgroundGlowTwo} />

      <section
        style={{
          ...styles.layout,
          gridTemplateColumns: isMobile ? "1fr" : "1.35fr 0.85fr",
          gap: isMobile ? "32px" : "48px",
          padding: isMobile ? "48px 18px 42px" : "54px 38px 46px",
        }}
      >
        <div style={styles.brandPanel}>
          <div style={styles.brandBadge}>BOAR PACK TRACK</div>

          <h1
            style={{
              ...styles.mainHeading,
              fontSize: isMobile ? "52px" : "clamp(58px, 6vw, 88px)",
            }}
          >
            BUILT BY COACHES.
            <br />
            BUILT FOR THE PACK.
          </h1>

          <p style={styles.introText}>
            Player development, attendance, matchday management and club
            communication—all in one secure rugby platform.
          </p>

          <section
            style={{
              ...styles.featureGrid,
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            }}
          >
            <div style={styles.featureCard}>
              <span style={styles.featureIcon}>🏉</span>

              <div>
                <strong style={styles.featureTitle}>
                  Player Development
                </strong>

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
          </section>

          <p style={styles.sponsorHeading}>DEMONSTRATION PARTNERS</p>

          <section
            style={{
              ...styles.sponsorGrid,
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
            }}
          >
            <div style={styles.sponsorCard}>
              <div style={styles.sponsorLogo}>
                <img
                  src="/sponsors/boar-pack-sponsor-logo.png"
                  alt="Boar Pack Rugby Academy"
                  style={styles.sponsorImage}
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
                  style={styles.sponsorImage}
                />
              </div>

              <div>
                <strong style={styles.sponsorName}>IB Automotive</strong>

                <p style={styles.sponsorText}>
                  Official Photography Partner
                </p>
              </div>
            </div>
          </section>
        </div>

        <div style={styles.loginPanel}>
          <div
            style={{
              ...styles.loginCard,
              padding: isMobile ? "30px 24px" : "34px",
            }}
          >
            <div style={styles.logoCircle}>
              <img
                src="/boarpack-logo.png"
                alt="Boar Pack Track"
                style={styles.mainLogo}
              />
            </div>

            <p style={styles.eyebrow}>BOAR PACK TRACK</p>

            <h2
              style={{
                ...styles.loginHeading,
                fontSize: isMobile ? "42px" : "44px",
              }}
            >
              Welcome back
            </h2>

            <p style={styles.loginSubheading}>
              Sign in to access your club dashboard.
            </p>

            <form onSubmit={handleLogin} style={styles.form}>
              <label style={styles.field}>
                <span style={styles.label}>Email address</span>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  disabled={loading}
                  style={styles.input}
                />
              </label>

              <label style={styles.field}>
                <span style={styles.label}>Password</span>

                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  style={styles.input}
                />
              </label>

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
                Secure club access with GDPR and safeguarding controls.
              </span>
            </div>

            <p style={styles.supportText}>
              Need access? Contact your club administrator.
            </p>
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        BOAR PACK TRACK&nbsp;&nbsp;•&nbsp;&nbsp;TEAMWORK&nbsp;&nbsp;•&nbsp;&nbsp;
        RESPECT&nbsp;&nbsp;•&nbsp;&nbsp;ENJOYMENT&nbsp;&nbsp;•&nbsp;&nbsp;
        DISCIPLINE&nbsp;&nbsp;•&nbsp;&nbsp;SPORTSMANSHIP
      </footer>
    </main>
  );
}

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    overflow: "hidden",
    color: "#f7f8fb",
    background:
      "radial-gradient(circle at top left, #1d2c2a 0%, #0b203d 46%, #06162c 100%)",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  backgroundGlowOne: {
    position: "absolute",
    width: "520px",
    height: "520px",
    top: "-220px",
    left: "-180px",
    borderRadius: "50%",
    background: "rgba(245,181,27,0.12)",
    filter: "blur(85px)",
  },

  backgroundGlowTwo: {
    position: "absolute",
    width: "480px",
    height: "480px",
    right: "-180px",
    bottom: "-200px",
    borderRadius: "50%",
    background: "rgba(32,104,191,0.17)",
    filter: "blur(90px)",
  },

  layout: {
    position: "relative",
    zIndex: 2,
    display: "grid",
    width: "100%",
    maxWidth: "1380px",
    margin: "0 auto",
    boxSizing: "border-box",
    alignItems: "center",
  },

  brandPanel: {
    minWidth: 0,
  },

  brandBadge: {
    display: "inline-flex",
    padding: "10px 20px",
    border: "1px solid rgba(245,181,27,0.65)",
    borderRadius: "999px",
    color: "#f5b51b",
    fontSize: "13px",
    fontWeight: "900",
    letterSpacing: "2px",
  },

  mainHeading: {
    margin: "32px 0 22px",
    maxWidth: "850px",
    lineHeight: "0.94",
    letterSpacing: "-3px",
    fontWeight: "900",
  },

  introText: {
    maxWidth: "760px",
    margin: "0",
    color: "#c6d1e1",
    fontSize: "20px",
    lineHeight: "1.65",
  },

  featureGrid: {
    display: "grid",
    gap: "16px",
    marginTop: "34px",
  },

  featureCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    minWidth: 0,
    padding: "20px",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.055)",
    boxSizing: "border-box",
  },

  featureIcon: {
    flexShrink: 0,
    fontSize: "28px",
  },

  featureTitle: {
    display: "block",
    color: "#ffffff",
    fontSize: "17px",
    lineHeight: "1.3",
  },

  featureText: {
    margin: "8px 0 0",
    color: "#aebbd0",
    fontSize: "14px",
    lineHeight: "1.55",
  },

  sponsorHeading: {
    margin: "36px 0 14px",
    color: "#f5b51b",
    fontSize: "13px",
    fontWeight: "900",
    letterSpacing: "2px",
  },

  sponsorGrid: {
    display: "grid",
    gap: "18px",
  },

  sponsorCard: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    minWidth: 0,
    padding: "18px",
    border: "1px solid rgba(245,181,27,0.36)",
    borderRadius: "18px",
    background: "rgba(3,10,20,0.42)",
    boxSizing: "border-box",
  },

  sponsorLogo: {
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    width: "92px",
    height: "92px",
    overflow: "hidden",
    borderRadius: "18px",
    background: "linear-gradient(145deg, #f5b51b, #ffdd69)",
    boxShadow: "0 12px 30px rgba(245,181,27,0.2)",
  },

  sponsorImage: {
    width: "78px",
    height: "78px",
    objectFit: "contain",
    borderRadius: "12px",
  },

  sponsorName: {
    display: "block",
    color: "#ffffff",
    fontSize: "18px",
    lineHeight: "1.25",
  },

  sponsorText: {
    margin: "6px 0 0",
    color: "#9faec7",
    fontSize: "14px",
    lineHeight: "1.4",
  },

  loginPanel: {
    display: "flex",
    justifyContent: "center",
    minWidth: 0,
  },

  loginCard: {
    width: "100%",
    maxWidth: "470px",
    boxSizing: "border-box",
    border: "1px solid rgba(245,181,27,0.45)",
    borderRadius: "28px",
    background:
      "linear-gradient(165deg, rgba(15,35,66,0.98), rgba(5,16,32,0.98))",
    boxShadow: "0 30px 80px rgba(0,0,0,0.48)",
    backdropFilter: "blur(18px)",
  },

  logoCircle: {
    display: "grid",
    placeItems: "center",
    width: "82px",
    height: "82px",
    overflow: "hidden",
    borderRadius: "22px",
    background: "linear-gradient(145deg, #f5b51b, #ffdd69)",
    boxShadow: "0 12px 30px rgba(245,181,27,0.28)",
  },

  mainLogo: {
    width: "68px",
    height: "68px",
    objectFit: "contain",
    borderRadius: "12px",
  },

  eyebrow: {
    margin: "28px 0 12px",
    color: "#f5b51b",
    fontSize: "13px",
    fontWeight: "900",
    letterSpacing: "2px",
  },

  loginHeading: {
    margin: "0",
    color: "#ffffff",
    lineHeight: "1.05",
    letterSpacing: "-1.5px",
  },

  loginSubheading: {
    margin: "18px 0 0",
    color: "#aebbd1",
    fontSize: "18px",
    lineHeight: "1.55",
  },

  form: {
    display: "grid",
    gap: "20px",
    marginTop: "34px",
  },

  field: {
    display: "grid",
    gap: "9px",
  },

  label: {
    color: "#e7edf6",
    fontSize: "14px",
    fontWeight: "800",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "15px 16px",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "13px",
    outline: "none",
    background: "rgba(255,255,255,0.08)",
    color: "#ffffff",
    fontSize: "16px",
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
    padding: "16px 18px",
    border: "none",
    borderRadius: "13px",
    background: "linear-gradient(135deg, #f5b51b, #ffdd69)",
    color: "#071324",
    fontSize: "15px",
    fontWeight: "900",
    boxShadow: "0 12px 32px rgba(245,181,27,0.24)",
  },

  securityNotice: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    marginTop: "22px",
    padding: "14px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.045)",
    color: "#aebbd1",
    fontSize: "13px",
    lineHeight: "1.5",
  },

  supportText: {
    margin: "18px 0 0",
    color: "#8798b2",
    fontSize: "12px",
    textAlign: "center",
  },

  footer: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "78px",
    padding: "18px 24px",
    boxSizing: "border-box",
    borderTop: "3px solid #f5b51b",
    background: "rgba(3,10,20,0.94)",
    color: "#f5b51b",
    fontSize: "13px",
    fontWeight: "900",
    lineHeight: "1.8",
    letterSpacing: "1px",
    textAlign: "center",
  },
};