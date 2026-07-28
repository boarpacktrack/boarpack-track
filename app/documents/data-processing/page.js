export const metadata = {
  title: "Data Processing Notice | Boar Pack Track",
  description: "How Boar Pack Track processes and protects personal information.",
};

export default function DataProcessingNotice() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top,#173c72 0%,#0b2344 45%,#06172e 100%)",
        color: "#f5f5f5",
        padding: "60px 20px",
        fontFamily: "Arial, Helvetica, sans-serif",
        lineHeight: 1.8,
      }}
    >
      <article
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <a
          href="/gdpr"
          style={{
            color: "#f5b51b",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          ← Back to consent page
        </a>

        <h1 style={{ marginTop: 20 }}>
          Data Processing Notice
        </h1>

        <p>
          <strong>Version 1.0</strong><br />
          Effective Date: 28 July 2026<br />
          Review Date: 28 July 2027
        </p>

        <hr />

        <h2>1. Purpose</h2>

        <p>
          This notice explains how Boar Pack Track processes personal
          information on behalf of sports clubs and authorised organisations.
        </p>

        <h2>2. Information Processed</h2>

        <ul>
          <li>Personal details</li>
          <li>Contact information</li>
          <li>Attendance records</li>
          <li>Development records</li>
          <li>Performance statistics</li>
          <li>Awards and achievements</li>
          <li>Medical and welfare information where authorised</li>
          <li>Consent records</li>
          <li>Audit logs</li>
        </ul>

        <h2>3. Why Information is Processed</h2>

        <ul>
          <li>Club administration</li>
          <li>Player and athlete development</li>
          <li>Fixture management</li>
          <li>Training management</li>
          <li>Attendance monitoring</li>
          <li>Safeguarding responsibilities</li>
          <li>Legal compliance</li>
        </ul>

        <h2>4. Security</h2>

        <p>
          Access to information is restricted through secure authentication,
          role-based permissions and encrypted cloud infrastructure.
        </p>

        <p>
          All significant actions are recorded within the platform audit log.
        </p>

        <h2>5. Data Retention</h2>

        <p>
          Information is retained only for as long as required by the club,
          legal obligations and safeguarding responsibilities.
        </p>

        <h2>6. Sharing Information</h2>

        <p>
          Personal information is only shared with authorised users,
          participating clubs and trusted service providers where necessary to
          operate the platform or comply with legal obligations.
        </p>

        <h2>7. Your Rights</h2>

        <ul>
          <li>Request access to your information.</li>
          <li>Request corrections.</li>
          <li>Request deletion where appropriate.</li>
          <li>Withdraw optional consent.</li>
          <li>Request a copy of your stored information.</li>
        </ul>

        <h2>8. Contact</h2>

        <p>
          Questions regarding data processing should be directed to your club
          administrator or Boar Pack Track support.
        </p>

        <div
          style={{
            marginTop: 40,
            padding: 20,
            borderRadius: 12,
            border: "1px solid rgba(245,181,27,.35)",
            background: "rgba(245,181,27,.08)",
          }}
        >
          Boar Pack Track is committed to processing personal information
          responsibly, securely and transparently while supporting sports clubs
          in delivering safe and effective environments for athletes,
          volunteers, parents and officials.
        </div>

        <p
          style={{
            marginTop: 40,
            textAlign: "center",
            fontSize: 12,
            opacity: .75,
          }}
        >
          This document forms part of the Boar Pack Track legal documentation
          suite and should be reviewed alongside your organisation's own data
          protection policies.
        </p>
      </article>
    </main>
  );
}