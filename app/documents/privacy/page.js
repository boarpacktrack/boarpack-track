export const metadata = {
  title: "Privacy Policy | Boar Pack Track",
};

export default function PrivacyPolicy() {
  return (
    <main
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "60px 20px",
        color: "#f5f5f5",
        lineHeight: 1.8,
      }}
    >
         <a
          href="/gdpr"
          style={{
            display: "inline-block",
            marginBottom: "26px",
            color: "#f5b51b",
            fontWeight: "800",
            textDecoration: "none",
          }}
        >
          ← Back to consent page
        </a>
      <h1>Privacy Policy</h1>

      <p>
        Version 1.0
      </p>

      <p>
        Last updated: July 2026
      </p>

      <hr />

      <h2>1. Introduction</h2>

      <p>
        Boar Pack Track is a secure player development and club management
        platform designed for sports clubs, coaches, parents and authorised
        administrators.
      </p>

      <p>
        We are committed to protecting personal information and processing all
        data in accordance with UK GDPR and the Data Protection Act 2018.
      </p>

      <h2>2. Information We Collect</h2>

      <ul>
        <li>Name</li>
        <li>Email address</li>
        <li>Club membership</li>
        <li>Attendance records</li>
        <li>Player development records</li>
        <li>Match statistics</li>
        <li>Awards and achievements</li>
        <li>Safeguarding information where authorised</li>
      </ul>

      <h2>3. Why We Collect It</h2>

      <ul>
        <li>Provide player development tools.</li>
        <li>Manage attendance.</li>
        <li>Record match information.</li>
        <li>Support safeguarding responsibilities.</li>
        <li>Provide secure access for authorised users.</li>
      </ul>

      <h2>4. Data Security</h2>

      <p>
        All information is stored securely using encrypted cloud services with
        restricted access based upon user permissions.
      </p>

      <h2>5. Your Rights</h2>

      <ul>
        <li>Access your data.</li>
        <li>Request corrections.</li>
        <li>Request deletion where legally appropriate.</li>
        <li>Withdraw optional consent at any time.</li>
      </ul>

      <h2>6. Contact</h2>

      <p>
        Questions regarding privacy or data protection should be directed to
        your club administrator or Boar Pack Track support.
      </p>
    </main>
  );
}