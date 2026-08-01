"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [checkingInvite, setCheckingInvite] = useState(true);
  const [inviteValid, setInviteValid] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function prepareInvitationSession() {
      setCheckingInvite(true);
      setErrorMessage("");

      try {
        const currentUrl = new URL(window.location.href);
        const authCode = currentUrl.searchParams.get("code");

        /*
         * Supabase may return an Auth Code when using PKCE.
         * Exchange it for a session before allowing a password change.
         */
        if (authCode) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(authCode);

          if (exchangeError) {
            throw exchangeError;
          }

          /*
           * Remove the one-time code from the visible URL after it has
           * successfully been exchanged.
           */
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!mounted) {
          return;
        }

        if (!session?.user) {
          setInviteValid(false);
          setErrorMessage(
            "This invitation link is invalid, has expired, or has already been used."
          );
          setCheckingInvite(false);
          return;
        }

        setInviteValid(true);
        setCheckingInvite(false);
      } catch (error) {
        console.error("Invitation session error:", error);

        if (!mounted) {
          return;
        }

        setInviteValid(false);
        setCheckingInvite(false);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "The invitation link could not be verified."
        );
      }
    }

    prepareInvitationSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) {
        return;
      }

      if (
        event === "SIGNED_IN" ||
        event === "PASSWORD_RECOVERY" ||
        event === "INITIAL_SESSION"
      ) {
        if (session?.user) {
          setInviteValid(true);
          setCheckingInvite(false);
          setErrorMessage("");
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  function validatePassword() {
    if (!password) {
      return "Please enter a password.";
    }

    if (password.length < 8) {
      return "Your password must contain at least 8 characters.";
    }

    if (!/[A-Z]/.test(password)) {
      return "Your password must include at least one capital letter.";
    }

    if (!/[a-z]/.test(password)) {
      return "Your password must include at least one lowercase letter.";
    }

    if (!/[0-9]/.test(password)) {
      return "Your password must include at least one number.";
    }

    if (password !== confirmPassword) {
      return "The passwords do not match.";
    }

    return "";
  }

  async function handleSetPassword(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validatePassword();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSavingPassword(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        throw new Error(
          "Your invitation session has expired. Please request a new invitation."
        );
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccessMessage(
        "Your password has been created successfully. Taking you to the GDPR agreement..."
      );

      setPassword("");
      setConfirmPassword("");

      window.setTimeout(() => {
        router.replace("/gdpr");
        router.refresh();
      }, 1400);
    } catch (error) {
      console.error("Set password error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Your password could not be saved."
      );
    } finally {
      setSavingPassword(false);
    }
  }

  if (checkingInvite) {
    return (
      <main style={styles.page}>
        <section style={styles.loadingCard}>
          <div style={styles.loadingIcon}>🔐</div>

          <p style={styles.eyebrow}>BOAR PACK TRACK</p>

          <h1 style={styles.loadingTitle}>
            Checking your invitation
          </h1>

          <p style={styles.loadingText}>
            Please wait while we securely verify your account.
          </p>
        </section>
      </main>
    );
  }

  if (!inviteValid) {
    return (
      <main style={styles.page}>
        <section style={styles.errorCard}>
          <div style={styles.errorIcon}>⚠️</div>

          <p style={styles.eyebrow}>BOAR PACK TRACK</p>

          <h1 style={styles.errorTitle}>
            Invitation link unavailable
          </h1>

          <p style={styles.errorText}>
            {errorMessage ||
              "This invitation link is invalid, expired or has already been used."}
          </p>

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => router.replace("/login")}
          >
            Go to Login
          </button>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.container}>
        <div style={styles.brandPanel}>
          <div style={styles.brandMark}>🐗</div>

          <p style={styles.eyebrow}>BOAR PACK TRACK</p>

          <h1 style={styles.brandTitle}>
            Welcome to the pack
          </h1>

          <p style={styles.brandText}>
            Your account invitation has been accepted. Create your
            secure password to finish setting up your access.
          </p>

          <div style={styles.featureList}>
            <Feature
              icon="🔒"
              title="Secure account"
              text="Your password is processed securely through Supabase Authentication."
            />

            <Feature
              icon="🛡️"
              title="Role-based access"
              text="You will only see the clubs, squads and players assigned to you."
            />

            <Feature
              icon="📄"
              title="GDPR agreement"
              text="After creating your password, you will complete the required consent step."
            />
          </div>
        </div>

        <form
          style={styles.formCard}
          onSubmit={handleSetPassword}
        >
          <div style={styles.formHeader}>
            <span style={styles.lockIcon}>🔐</span>

            <div>
              <p style={styles.formEyebrow}>ACCOUNT SETUP</p>

              <h2 style={styles.formTitle}>
                Create your password
              </h2>
            </div>
          </div>

          <p style={styles.formIntro}>
            Use at least 8 characters, including a capital letter,
            lowercase letter and number.
          </p>

          <label style={styles.fieldGroup}>
            <span style={styles.label}>New password</span>

            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              placeholder="Enter your new password"
              style={styles.input}
              autoComplete="new-password"
              disabled={savingPassword}
            />
          </label>

          <label style={styles.fieldGroup}>
            <span style={styles.label}>Confirm password</span>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              placeholder="Enter the password again"
              style={styles.input}
              autoComplete="new-password"
              disabled={savingPassword}
            />
          </label>

          <div style={styles.requirements}>
            <Requirement
              met={password.length >= 8}
              text="At least 8 characters"
            />

            <Requirement
              met={/[A-Z]/.test(password)}
              text="One capital letter"
            />

            <Requirement
              met={/[a-z]/.test(password)}
              text="One lowercase letter"
            />

            <Requirement
              met={/[0-9]/.test(password)}
              text="One number"
            />

            <Requirement
              met={
                password.length > 0 &&
                password === confirmPassword
              }
              text="Passwords match"
            />
          </div>

          {errorMessage && (
            <div style={styles.errorBanner}>
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div style={styles.successBanner}>
              <span>✅</span>

              <div>
                <strong style={styles.successTitle}>
                  Password created
                </strong>

                <p style={styles.successText}>
                  {successMessage}
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            style={{
              ...styles.submitButton,
              ...(savingPassword
                ? styles.submitButtonDisabled
                : {}),
            }}
            disabled={savingPassword}
          >
            {savingPassword
              ? "Saving your password..."
              : "Create Password & Continue"}
          </button>

          <p style={styles.securityNote}>
            🔒 Boar Pack Track will never ask you to send your
            password by email or message.
          </p>
        </form>
      </section>
    </main>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div style={styles.feature}>
      <span style={styles.featureIcon}>{icon}</span>

      <div>
        <strong style={styles.featureTitle}>{title}</strong>
        <p style={styles.featureText}>{text}</p>
      </div>
    </div>
  );
}

function Requirement({ met, text }) {
  return (
    <div style={styles.requirement}>
      <span
        style={{
          ...styles.requirementIcon,
          ...(met
            ? styles.requirementIconMet
            : styles.requirementIconWaiting),
        }}
      >
        {met ? "✓" : "•"}
      </span>

      <span
        style={{
          ...styles.requirementText,
          ...(met ? styles.requirementTextMet : {}),
        }}
      >
        {text}
      </span>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "34px 22px",
    display: "grid",
    placeItems: "center",
    background:
      "radial-gradient(circle at top right, rgba(35,102,210,0.42), transparent 36%), linear-gradient(145deg, #061225 0%, #0b2857 54%, #061225 100%)",
    color: "#ffffff",
  },

  container: {
    width: "100%",
    maxWidth: "1050px",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(min(100%, 350px), 1fr))",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "28px",
    background: "rgba(5,22,52,0.96)",
    boxShadow: "0 30px 80px rgba(0,0,0,0.42)",
  },

  brandPanel: {
    padding: "48px 42px",
    background:
      "linear-gradient(155deg, rgba(24,73,145,0.98), rgba(7,30,70,0.99))",
  },

  brandMark: {
    width: "68px",
    height: "68px",
    display: "grid",
    placeItems: "center",
    marginBottom: "22px",
    border: "2px solid rgba(245,184,0,0.55)",
    borderRadius: "21px",
    background: "rgba(245,184,0,0.13)",
    fontSize: "34px",
  },

  eyebrow: {
    margin: "0 0 9px",
    color: "#f5b800",
    fontSize: "12px",
    fontWeight: "900",
    letterSpacing: "2px",
  },

  brandTitle: {
    margin: 0,
    fontSize: "clamp(35px, 6vw, 54px)",
    lineHeight: "1.02",
  },

  brandText: {
    margin: "18px 0 30px",
    color: "#c4d2e6",
    fontSize: "15px",
    lineHeight: "1.65",
  },

  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "17px",
  },

  feature: {
    display: "flex",
    alignItems: "flex-start",
    gap: "13px",
  },

  featureIcon: {
    width: "38px",
    height: "38px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    borderRadius: "12px",
    background: "rgba(245,184,0,0.12)",
    fontSize: "18px",
  },

  featureTitle: {
    color: "#ffffff",
    fontSize: "14px",
  },

  featureText: {
    margin: "4px 0 0",
    color: "#aebed5",
    fontSize: "12px",
    lineHeight: "1.5",
  },

  formCard: {
    padding: "48px 42px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background:
      "linear-gradient(160deg, rgba(10,38,83,0.99), rgba(5,21,50,0.99))",
  },

  formHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "15px",
  },

  lockIcon: {
    width: "48px",
    height: "48px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    borderRadius: "15px",
    background: "rgba(245,184,0,0.13)",
    fontSize: "23px",
  },

  formEyebrow: {
    margin: "0 0 4px",
    color: "#f5b800",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "1.5px",
  },

  formTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "26px",
  },

  formIntro: {
    margin: "0 0 24px",
    color: "#aebed4",
    fontSize: "13px",
    lineHeight: "1.55",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "17px",
  },

  label: {
    color: "#e9eff8",
    fontSize: "13px",
    fontWeight: "800",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "13px",
    outline: "none",
    background: "rgba(1,13,33,0.62)",
    color: "#ffffff",
    fontSize: "15px",
  },

  requirements: {
    margin: "2px 0 19px",
    padding: "14px",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "9px",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.035)",
  },

  requirement: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  requirementIcon: {
    width: "20px",
    height: "20px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    borderRadius: "50%",
    fontSize: "11px",
    fontWeight: "900",
  },

  requirementIconMet: {
    background: "rgba(67,211,135,0.18)",
    color: "#6ee2a6",
  },

  requirementIconWaiting: {
    background: "rgba(255,255,255,0.08)",
    color: "#71839d",
  },

  requirementText: {
    color: "#8396b1",
    fontSize: "11px",
  },

  requirementTextMet: {
    color: "#bfead2",
  },

  errorBanner: {
    marginBottom: "17px",
    padding: "13px 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "1px solid rgba(255,104,104,0.32)",
    borderRadius: "13px",
    background: "rgba(148,28,48,0.2)",
    color: "#ffd1d1",
    fontSize: "12px",
    fontWeight: "700",
  },

  successBanner: {
    marginBottom: "17px",
    padding: "14px",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    border: "1px solid rgba(70,220,143,0.31)",
    borderRadius: "13px",
    background: "rgba(21,126,77,0.2)",
  },

  successTitle: {
    color: "#75e3aa",
    fontSize: "13px",
  },

  successText: {
    margin: "4px 0 0",
    color: "#d0f5e0",
    fontSize: "11px",
    lineHeight: "1.45",
  },

  submitButton: {
    width: "100%",
    padding: "15px 20px",
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg, #f5b800 0%, #ffd85d 100%)",
    color: "#071326",
    fontSize: "14px",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow: "0 13px 28px rgba(245,184,0,0.22)",
  },

  submitButtonDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
  },

  securityNote: {
    margin: "17px 0 0",
    color: "#8194af",
    fontSize: "10px",
    lineHeight: "1.5",
    textAlign: "center",
  },

  loadingCard: {
    width: "min(500px, 100%)",
    padding: "40px 30px",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "25px",
    background: "rgba(7,28,64,0.96)",
    textAlign: "center",
    boxShadow: "0 25px 65px rgba(0,0,0,0.38)",
  },

  loadingIcon: {
    width: "66px",
    height: "66px",
    display: "grid",
    placeItems: "center",
    margin: "0 auto 20px",
    borderRadius: "20px",
    background: "rgba(245,184,0,0.13)",
    fontSize: "31px",
  },

  loadingTitle: {
    margin: "0 0 10px",
    fontSize: "27px",
  },

  loadingText: {
    margin: 0,
    color: "#adbed5",
    lineHeight: "1.5",
  },

  errorCard: {
    width: "min(560px, 100%)",
    padding: "42px 30px",
    border: "1px solid rgba(255,112,112,0.29)",
    borderRadius: "25px",
    background: "rgba(65,15,29,0.93)",
    textAlign: "center",
    boxShadow: "0 25px 65px rgba(0,0,0,0.38)",
  },

  errorIcon: {
    marginBottom: "17px",
    fontSize: "39px",
  },

  errorTitle: {
    margin: "0 0 12px",
    fontSize: "29px",
  },

  errorText: {
    margin: "0 0 23px",
    color: "#f0c1c1",
    lineHeight: "1.6",
  },

  secondaryButton: {
    padding: "13px 20px",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "13px",
    background: "rgba(255,255,255,0.08)",
    color: "#ffffff",
    fontWeight: "900",
    cursor: "pointer",
  },
};