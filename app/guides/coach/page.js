"use client";

import { useRouter } from "next/navigation";

export default function CoachGuidePage() {
  const router = useRouter();

  const steps = [
    {
      number: "1",
      title: "Accept your invitation",
      text: "Open the Boar Pack Track invitation email and follow the secure link to create your password.",
    },
    {
      number: "2",
      title: "Log in",
      text: "Visit boarpacktrack.co.uk/login and enter your email address and password.",
    },
    {
      number: "3",
      title: "Complete the GDPR agreement",
      text: "Read and accept the platform agreement when prompted. This must be completed before entering the dashboard.",
    },
    {
      number: "4",
      title: "Open your assigned squad",
      text: "Your Coach Dashboard will automatically display the squad or squads assigned to you.",
    },
    {
      number: "5",
      title: "Review your players",
      text: "Select Players to view the registered players, PT numbers, positions, caps and player information for your squad.",
    },
    {
      number: "6",
      title: "Use the coaching tools",
      text: "Use Training, Team Selection and Match Day to manage the weekly coaching workflow for your squad.",
    },
  ];

  return (
    <main style={styles.page}>
      <section style={styles.container}>
        <button
          type="button"
          style={styles.backButton}
          onClick={() => router.push("/dashboard")}
        >
          ← Back to Dashboard
        </button>

        <header style={styles.hero}>
          <p style={styles.eyebrow}>BOAR PACK TRACK USER GUIDE</p>

          <h1 style={styles.title}>Coach Getting Started Guide</h1>

          <p style={styles.subtitle}>
            Everything a coach needs to access their squad and begin using
            Boar Pack Track.
          </p>
        </header>

        <section style={styles.notice}>
          <strong style={styles.noticeTitle}>Before you begin</strong>

          <p style={styles.noticeText}>
            Your Boar Pack Track administrator must create your account and
            assign you to the correct club and squad before you log in.
          </p>
        </section>

        <section style={styles.stepsGrid}>
          {steps.map((step) => (
            <article key={step.number} style={styles.stepCard}>
              <div style={styles.stepNumber}>{step.number}</div>

              <div>
                <h2 style={styles.stepTitle}>{step.title}</h2>
                <p style={styles.stepText}>{step.text}</p>
              </div>
            </article>
          ))}
        </section>

        <section style={styles.toolsSection}>
          <p style={styles.eyebrow}>YOUR COACHING TOOLS</p>
          <h2 style={styles.sectionTitle}>What each area does</h2>

          <div style={styles.toolsGrid}>
            <ToolCard
              icon="👥"
              title="Players"
              text="View your assigned squad and open player information."
            />

            <ToolCard
              icon="✅"
              title="Training"
              text="Access the Training Centre and the squad attendance workflow."
            />

            <ToolCard
              icon="📋"
              title="Team Selection"
              text="Select the match squad, captain, vice-captain and forwards leader."
            />

            <ToolCard
              icon="🏉"
              title="Match Day"
              text="Access selection, live-match tools and match reporting."
            />

            <ToolCard
              icon="📈"
              title="Development"
              text="Open the player list and select a player to review their development information."
            />

            <ToolCard
              icon="📊"
              title="Reports"
              text="Player and squad reporting features will continue to be added during Version 1 testing."
            />
          </div>
        </section>

        <section style={styles.helpCard}>
          <p style={styles.eyebrow}>IMPORTANT</p>
          <h2 style={styles.helpTitle}>Only use your assigned squad</h2>

          <p style={styles.helpText}>
            Coaches should only view and update information relating to the
            squad or squads they have been authorised to manage.
          </p>

          <p style={styles.helpText}>
            Speak to your club administrator if your squad is missing, the
            wrong squad appears or another coach needs access.
          </p>
        </section>

        <footer style={styles.footer}>
          <strong>Boar Pack Track</strong>
          <span>Building better people first. Better players second.</span>
        </footer>
      </section>
    </main>
  );
}

function ToolCard({ icon, title, text }) {
  return (
    <article style={styles.toolCard}>
      <div style={styles.toolIcon}>{icon}</div>

      <div>
        <h3 style={styles.toolTitle}>{title}</h3>
        <p style={styles.toolText}>{text}</p>
      </div>
    </article>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px 20px 80px",
    color: "#ffffff",
    background:
      "radial-gradient(circle at top right, rgba(31, 96, 190, 0.38), transparent 34%), linear-gradient(145deg, #061a3d, #0a2b61 52%, #071934)",
  },

  container: {
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",
  },

  backButton: {
    marginBottom: "22px",
    padding: "11px 15px",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "12px",
    color: "#ffffff",
    background: "rgba(255,255,255,0.07)",
    cursor: "pointer",
    fontWeight: "800",
  },

  hero: {
    padding: "30px",
    border: "1px solid rgba(245,184,0,0.32)",
    borderRadius: "24px",
    background:
      "linear-gradient(145deg, rgba(17,58,119,0.98), rgba(7,29,68,0.98))",
    boxShadow: "0 20px 50px rgba(0,0,0,0.28)",
  },

  eyebrow: {
    margin: "0 0 8px",
    color: "#f5b800",
    fontSize: "12px",
    fontWeight: "900",
    letterSpacing: "1.4px",
  },

  title: {
    margin: 0,
    fontSize: "clamp(34px, 6vw, 58px)",
    lineHeight: "1.05",
    fontWeight: "950",
  },

  subtitle: {
    maxWidth: "760px",
    margin: "15px 0 0",
    color: "#c7d6ec",
    fontSize: "17px",
    lineHeight: "1.6",
  },

  notice: {
    marginTop: "22px",
    padding: "20px 22px",
    borderLeft: "6px solid #f5b800",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.07)",
  },

  noticeTitle: {
    display: "block",
    marginBottom: "6px",
    color: "#ffffff",
    fontSize: "18px",
  },

  noticeText: {
    margin: 0,
    color: "#c7d6ec",
    lineHeight: "1.6",
  },

  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
    gap: "16px",
    marginTop: "24px",
  },

  stepCard: {
    display: "flex",
    gap: "16px",
    padding: "22px",
    border: "1px solid rgba(255,255,255,0.11)",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.06)",
  },

  stepNumber: {
    minWidth: "46px",
    height: "46px",
    display: "grid",
    placeItems: "center",
    borderRadius: "14px",
    color: "#071934",
    background: "#f5b800",
    fontSize: "19px",
    fontWeight: "950",
  },

  stepTitle: {
    margin: "2px 0 7px",
    fontSize: "18px",
  },

  stepText: {
    margin: 0,
    color: "#bfcfe6",
    lineHeight: "1.55",
  },

  toolsSection: {
    marginTop: "38px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "30px",
  },

  toolsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "16px",
    marginTop: "18px",
  },

  toolCard: {
    display: "flex",
    gap: "15px",
    padding: "20px",
    border: "1px solid rgba(255,255,255,0.11)",
    borderRadius: "18px",
    background:
      "linear-gradient(145deg, rgba(17,58,119,0.9), rgba(8,32,73,0.9))",
  },

  toolIcon: {
    minWidth: "48px",
    height: "48px",
    display: "grid",
    placeItems: "center",
    borderRadius: "14px",
    background: "rgba(245,184,0,0.14)",
    fontSize: "24px",
  },

  toolTitle: {
    margin: "1px 0 6px",
    fontSize: "18px",
  },

  toolText: {
    margin: 0,
    color: "#bfcfe6",
    lineHeight: "1.5",
  },

  helpCard: {
    marginTop: "26px",
    padding: "26px",
    border: "1px solid rgba(245,184,0,0.3)",
    borderRadius: "20px",
    background: "rgba(4,20,48,0.78)",
  },

  helpTitle: {
    margin: "0 0 10px",
    fontSize: "25px",
  },

  helpText: {
    margin: "8px 0 0",
    color: "#c7d6ec",
    lineHeight: "1.6",
  },

  footer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "28px",
    paddingTop: "20px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    color: "#aebfd8",
  },
};