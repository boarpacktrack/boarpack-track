"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
const GDPR_VERSION = "1.0";

export default function GDPRPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [signedName, setSignedName] = useState("");
  const [requiredAccepted, setRequiredAccepted] = useState(false);
  const [photoConsent, setPhotoConsent] = useState(false);
  const [videoConsent, setVideoConsent] = useState(false);
  const [socialMediaConsent, setSocialMediaConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();

      if (error || !currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);
      setLoading(false);
    }

    loadUser();
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!user) {
      setErrorMessage("Your account could not be confirmed. Please sign in again.");
      return;
    }

    if (!requiredAccepted) {
      setErrorMessage(
        "You must accept the Privacy Policy, Terms of Use and Safeguarding Agreement."
      );
      return;
    }

    if (!signedName.trim()) {
      setErrorMessage("Please enter your full name as your electronic signature.");
      return;
    }

    setSaving(true);

    const acceptedAt = new Date().toISOString();

    const { error: consentError } = await supabase
      .from("user_consents")
      .insert({
        user_id: user.id,
        gdpr_version: GDPR_VERSION,
        accepted: true,
        accepted_at: acceptedAt,
        signed_name: signedName.trim(),
        photo_consent: photoConsent,
        video_consent: videoConsent,
        social_media_consent: socialMediaConsent,
        marketing_consent: marketingConsent,
      });

    if (consentError) {
      setSaving(false);
      setErrorMessage(consentError.message);
      return;
    }

    const { error: auditError } = await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "GDPR_ACCEPTED",
      table_name: "user_consents",
      record_id: null,
      description: `Accepted GDPR version ${GDPR_VERSION}`,
      ip_address: null,
      user_agent:
        typeof navigator !== "undefined" ? navigator.userAgent : null,
    });

    if (auditError) {
      console.error("Audit log error:", auditError.message);
    }

    router.replace("/dashboard");
router.refresh();
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.loadingCard}>Loading your consent form...</div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />

      <section style={styles.wrapper}>
        <header style={styles.header}>
          <div style={styles.logoBox}>
            <img
              src="/boarpack-logo.png"
              alt="Boar Pack Track"
              style={styles.logo}
            />
          </div>

          <div>
            <p style={styles.eyebrow}>BOAR PACK TRACK</p>
            <h1 style={styles.heading}>Privacy, consent and safeguarding</h1>
            <p style={styles.intro}>
              Before entering the platform, please review the information below
              and confirm how your data may be used.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} style={styles.form}>
          <section style={styles.card}>
            <h2 style={styles.cardHeading}>Required agreement</h2>

            <p style={styles.text}>
              Boar Pack Track stores account information and rugby-related
              records such as attendance, player development, match statistics,
              awards and safeguarding information.
            </p>

            <p style={styles.text}>
              Access is restricted to authorised users. You must only view or
              update information that relates to your permitted club, squad or
              child.
            </p>



             <div style={styles.policyGrid}>
  <Link
    href="/documents/privacy"
    style={{ textDecoration: "none", color: "inherit" }}
  >
    <div style={styles.policyItem}>
      <strong>Privacy Policy</strong>
      <span>How personal information is collected and used.</span>
    </div>
  </Link>

  <Link
    href="/documents/terms"
    style={{ textDecoration: "none", color: "inherit" }}
  >
    <div style={styles.policyItem}>
      <strong>Terms of Use</strong>
      <span>Rules for authorised and responsible use.</span>
    </div>
  </Link>

  <Link
    href="/documents/safeguarding"
    style={{ textDecoration: "none", color: "inherit" }}
  >
    <div style={styles.policyItem}>
      <strong>Safeguarding Agreement</strong>
      <span>Expectations when handling junior athlete data.</span>
    </div>
  </Link>

  <Link
    href="/documents/data-processing"
    style={{ textDecoration: "none", color: "inherit" }}
  >
    <div style={styles.policyItem}>
      <strong>Data Processing Notice</strong>
      <span>How records are stored, protected and retained.</span>
    </div>
  </Link>
</div>

            <label style={styles.requiredConsent}>
              <input
                type="checkbox"
                checked={requiredAccepted}
                onChange={(event) =>
                  setRequiredAccepted(event.target.checked)
                }
                style={styles.checkbox}
              />

              <span>
                I confirm that I have read and agree to the Privacy Policy,
                Terms of Use, Safeguarding Agreement and Data Processing Notice.
              </span>
            </label>
          </section>

          <section style={styles.card}>
            <h2 style={styles.cardHeading}>Optional permissions</h2>

            <p style={styles.text}>
              These permissions are optional and can be changed later by an
              authorised club administrator.
            </p>

            <div style={styles.consentList}>
              <ConsentRow
                title="Photo consent"
                description="Allow authorised photographs to be stored against player records."
                checked={photoConsent}
                onChange={setPhotoConsent}
              />

              <ConsentRow
                title="Video consent"
                description="Allow authorised coaching or match footage to be stored."
                checked={videoConsent}
                onChange={setVideoConsent}
              />

              <ConsentRow
                title="Social media consent"
                description="Allow approved images or achievements to be shared through official club channels."
                checked={socialMediaConsent}
                onChange={setSocialMediaConsent}
              />

              <ConsentRow
                title="Marketing consent"
                description="Receive occasional Boar Pack Track updates and product information."
                checked={marketingConsent}
                onChange={setMarketingConsent}
              />
            </div>
          </section>

          <section style={styles.card}>
            <h2 style={styles.cardHeading}>Electronic signature</h2>

            <p style={styles.text}>
              Enter your full name. This will be stored alongside the date,
              account ID and GDPR policy version.
            </p>

            <label style={styles.field}>
              <span style={styles.label}>Full name</span>

              <input
                type="text"
                value={signedName}
                onChange={(event) => setSignedName(event.target.value)}
                placeholder="Enter your full name"
                style={styles.input}
              />
            </label>

            <div style={styles.versionBox}>
              <span>Policy version</span>
              <strong>GDPR v{GDPR_VERSION}</strong>
            </div>
          </section>

          {errorMessage && (
            <div style={styles.errorBox}>{errorMessage}</div>
          )}

          <button
            type="submit"
            disabled={saving || !requiredAccepted || !signedName.trim()}
            style={{
              ...styles.button,
              opacity:
                saving || !requiredAccepted || !signedName.trim() ? 0.55 : 1,
              cursor:
                saving || !requiredAccepted || !signedName.trim()
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {saving ? "Saving consent..." : "I Agree & Continue"}
          </button>

          <p style={styles.footerNote}>
            Your consent record will be stored securely and added to the
            platform audit log.
          </p>
        </form>
      </section>
    </main>
  );
}

function ConsentRow({ title, description, checked, onChange }) {
  return (
    <label style={styles.consentRow}>
      <div>
        <strong style={styles.consentTitle}>{title}</strong>
        <p style={styles.consentDescription}>{description}</p>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        style={styles.checkbox}
      />
    </label>
  );
}

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    overflow: "hidden",
    padding: "36px 18px",
    boxSizing: "border-box",
    color: "#f7f8fb",
    background:
      "radial-gradient(circle at top left, #243425 0%, #0b203d 45%, #06162c 100%)",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  glowOne: {
    position: "absolute",
    width: "460px",
    height: "460px",
    top: "-220px",
    left: "-180px",
    borderRadius: "50%",
    background: "rgba(245,181,27,0.14)",
    filter: "blur(85px)",
  },

  glowTwo: {
    position: "absolute",
    width: "420px",
    height: "420px",
    right: "-170px",
    bottom: "-180px",
    borderRadius: "50%",
    background: "rgba(42,112,194,0.16)",
    filter: "blur(90px)",
  },

  wrapper: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    maxWidth: "960px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "22px",
    marginBottom: "28px",
  },

  logoBox: {
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    width: "86px",
    height: "86px",
    overflow: "hidden",
    borderRadius: "24px",
    background: "linear-gradient(145deg, #f5b51b, #ffdd69)",
    boxShadow: "0 12px 32px rgba(245,181,27,0.25)",
  },

  logo: {
    width: "70px",
    height: "70px",
    objectFit: "contain",
    borderRadius: "14px",
  },

  eyebrow: {
    margin: "0 0 8px",
    color: "#f5b51b",
    fontSize: "13px",
    fontWeight: "900",
    letterSpacing: "2px",
  },

  heading: {
    margin: "0",
    color: "#ffffff",
    fontSize: "clamp(34px, 6vw, 58px)",
    lineHeight: "1.02",
    letterSpacing: "-1.5px",
  },

  intro: {
    maxWidth: "720px",
    margin: "14px 0 0",
    color: "#b9c6d8",
    fontSize: "17px",
    lineHeight: "1.6",
  },

  form: {
    display: "grid",
    gap: "20px",
  },

  card: {
    padding: "26px",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "22px",
    background: "rgba(10,29,54,0.84)",
    boxShadow: "0 18px 55px rgba(0,0,0,0.25)",
    backdropFilter: "blur(14px)",
  },

  cardHeading: {
    margin: "0 0 14px",
    color: "#ffffff",
    fontSize: "24px",
  },

  text: {
    margin: "0 0 14px",
    color: "#b9c6d8",
    fontSize: "15px",
    lineHeight: "1.65",
  },

  policyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "12px",
    marginTop: "20px",
  },

  policyItem: {
    display: "grid",
    gap: "7px",
    padding: "16px",
    border: "1px solid rgba(245,181,27,0.26)",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.04)",
    color: "#ffffff",
    fontSize: "14px",
    lineHeight: "1.45",
  },

  requiredConsent: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    marginTop: "22px",
    padding: "17px",
    border: "1px solid rgba(245,181,27,0.42)",
    borderRadius: "14px",
    background: "rgba(245,181,27,0.08)",
    color: "#e8edf5",
    fontSize: "14px",
    lineHeight: "1.55",
  },

  consentList: {
    display: "grid",
    gap: "12px",
    marginTop: "18px",
  },

  consentRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "18px",
    padding: "17px",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.04)",
  },

  consentTitle: {
    display: "block",
    color: "#ffffff",
    fontSize: "15px",
  },

  consentDescription: {
    margin: "6px 0 0",
    color: "#aebbd0",
    fontSize: "13px",
    lineHeight: "1.5",
  },

  checkbox: {
    flexShrink: 0,
    width: "21px",
    height: "21px",
    accentColor: "#f5b51b",
  },

  field: {
    display: "grid",
    gap: "9px",
    marginTop: "18px",
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

  versionBox: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    marginTop: "18px",
    padding: "14px 16px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.045)",
    color: "#aebbd1",
    fontSize: "13px",
  },

  errorBox: {
    padding: "14px 16px",
    border: "1px solid rgba(255,100,100,0.5)",
    borderRadius: "12px",
    background: "rgba(150,20,20,0.22)",
    color: "#ffd6d6",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  button: {
    width: "100%",
    padding: "17px 20px",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #f5b51b, #ffdd69)",
    color: "#071324",
    fontSize: "16px",
    fontWeight: "900",
    boxShadow: "0 14px 36px rgba(245,181,27,0.24)",
  },

  footerNote: {
    margin: "0",
    color: "#8fa0b8",
    fontSize: "12px",
    lineHeight: "1.5",
    textAlign: "center",
  },

  loadingCard: {
    width: "100%",
    maxWidth: "520px",
    margin: "120px auto 0",
    padding: "28px",
    border: "1px solid rgba(245,181,27,0.4)",
    borderRadius: "20px",
    background: "rgba(10,29,54,0.9)",
    color: "#ffffff",
    fontSize: "17px",
    textAlign: "center",
  },
};