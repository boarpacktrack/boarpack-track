export const metadata = {
  title: "Safeguarding Agreement | Boar Pack Track",
};

export default function SafeguardingAgreement() {
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
          color: "#f5b51b",
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        ← Back to consent page
      </a>

      <h1 style={{ marginTop: 20 }}>
        Safeguarding Agreement
      </h1>

      <p>
        <strong>Version 1.0</strong><br />
        Effective: 28 July 2026
      </p>

      <hr />

      <h2>Our Commitment</h2>

      <p>
        Boar Pack Track supports clubs in creating a safe, respectful and
        inclusive environment for every participant, regardless of age,
        ability, gender or background.
      </p>

      <h2>Coaches & Volunteers agree to:</h2>

      <ul>
        <li>Put the welfare of players first.</li>
        <li>Follow the club safeguarding policy.</li>
        <li>Maintain professional boundaries.</li>
        <li>Use respectful and appropriate language.</li>
        <li>Record concerns promptly.</li>
        <li>Report safeguarding concerns immediately.</li>
        <li>Only access information they are authorised to view.</li>
      </ul>

      <h2>Parents & Guardians agree to:</h2>

      <ul>
        <li>Provide accurate emergency contact information.</li>
        <li>Keep medical information up to date.</li>
        <li>Support positive behaviour.</li>
        <li>Respect coaches, referees and volunteers.</li>
        <li>Report safeguarding concerns through the correct channels.</li>
      </ul>

      <h2>Players agree to:</h2>

      <ul>
        <li>Treat everyone with respect.</li>
        <li>Play fairly.</li>
        <li>Follow coach instructions.</li>
        <li>Report anything that makes them feel unsafe.</li>
      </ul>

      <h2>Photography & Video</h2>

      <p>
        Images and videos must only be used where appropriate consent has been
        recorded. Clubs are responsible for ensuring media is used safely and
        appropriately.
      </p>

      <h2>Reporting Concerns</h2>

      <p>
        Any safeguarding concern must be reported immediately to the club's
        Welfare Officer or Designated Safeguarding Lead in accordance with the
        club's safeguarding procedures.
      </p>

      <h2>Confidentiality</h2>

      <p>
        Safeguarding information must only be accessed by authorised personnel
        and handled in accordance with UK GDPR and club safeguarding policies.
      </p>

      <div
        style={{
          marginTop: 40,
          padding: 20,
          border: "1px solid rgba(245,181,27,.4)",
          borderRadius: 12,
          background: "rgba(245,181,27,.08)"
        }}
      >
        Every adult involved in sport shares responsibility for creating a safe
        environment where children and vulnerable adults can enjoy sport,
        develop and thrive.
      </div>

      <p
        style={{
          marginTop: 40,
          fontSize: 12,
          opacity: .75,
          textAlign: "center"
        }}
      >
        This document should be reviewed alongside your club's own
        safeguarding policy and the relevant National Governing Body guidance.
      </p>
    </main>
  );
}