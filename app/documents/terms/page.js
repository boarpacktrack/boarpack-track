export const metadata = {
  title: "Terms of Use | Boar Pack Track",
  description: "Terms governing use of the Boar Pack Track sports club platform.",
};

const sectionStyle = {
  marginTop: "34px",
};

const headingStyle = {
  marginBottom: "12px",
  color: "#ffffff",
  fontSize: "24px",
};

const paragraphStyle = {
  margin: "0 0 14px",
  color: "#d2dbea",
};

const listStyle = {
  margin: "0",
  paddingLeft: "24px",
  color: "#d2dbea",
};

export default function TermsOfUsePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "60px 20px",
        background:
          "radial-gradient(circle at top, #173c72 0%, #0b2344 48%, #06172e 100%)",
        color: "#ffffff",
        fontFamily: "Arial, Helvetica, sans-serif",
        lineHeight: 1.75,
      }}
    >
      <article
        style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
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

        <p
          style={{
            margin: "0 0 8px",
            color: "#f5b51b",
            fontSize: "13px",
            fontWeight: "900",
            letterSpacing: "2px",
          }}
        >
          BOAR PACK TRACK
        </p>

        <h1
          style={{
            margin: "0",
            color: "#ffffff",
            fontSize: "clamp(38px, 7vw, 62px)",
            lineHeight: "1.05",
          }}
        >
          Terms of Use
        </h1>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px 24px",
            marginTop: "18px",
            color: "#b8c5d8",
            fontSize: "14px",
          }}
        >
          <span>Version 1.0</span>
          <span>Effective date: 28 July 2026</span>
          <span>Review date: 28 July 2027</span>
        </div>

        <hr
          style={{
            margin: "28px 0",
            border: "none",
            borderTop: "1px solid rgba(255,255,255,0.25)",
          }}
        />

        <p style={paragraphStyle}>
          These Terms of Use govern access to and use of Boar Pack Track, a
          sports club management platform for clubs, teams, coaches, parents,
          guardians, athletes, volunteers and authorised officials.
        </p>

        <p style={paragraphStyle}>
          By accessing the platform, you agree to use it lawfully, responsibly
          and only for purposes authorised by your club or organisation.
        </p>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>1. Authorised access</h2>

          <p style={paragraphStyle}>
            Access is limited to users who have been approved by an authorised
            club administrator or Boar Pack Track administrator.
          </p>

          <ul style={listStyle}>
            <li>Use only the account issued or approved for you.</li>
            <li>Do not share passwords or allow another person to use your account.</li>
            <li>
              Access only clubs, squads, athletes and records that you are
              authorised to view.
            </li>
            <li>
              Notify your club administrator if your access is incorrect or no
              longer required.
            </li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>2. User responsibilities</h2>

          <p style={paragraphStyle}>Users must:</p>

          <ul style={listStyle}>
            <li>Provide accurate and current information.</li>
            <li>Respect the privacy and dignity of all platform users.</li>
            <li>Keep personal information confidential.</li>
            <li>Follow club safeguarding and data-protection procedures.</li>
            <li>
              Use messaging, attendance and availability features appropriately.
            </li>
            <li>
              Report suspected misuse, unauthorised access or data breaches
              promptly.
            </li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>3. Coaches and club officials</h2>

          <p style={paragraphStyle}>
            Coaches, administrators and club officials must only view or update
            records connected to their authorised role.
          </p>

          <ul style={listStyle}>
            <li>
              Development notes must be factual, respectful and relevant to the
              athlete&apos;s sporting development.
            </li>
            <li>
              Injury, welfare and safeguarding information must be handled with
              additional care.
            </li>
            <li>
              Information must not be copied, downloaded or shared without a
              proper club purpose.
            </li>
            <li>
              Access must not be used for personal, commercial or unrelated
              purposes.
            </li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>4. Parents and guardians</h2>

          <p style={paragraphStyle}>
            Parents and guardians may only access information relating to
            children or athletes properly linked to their account.
          </p>

          <ul style={listStyle}>
            <li>
              Attendance and availability responses should be accurate and
              updated when circumstances change.
            </li>
            <li>
              Account access must not be shared with unauthorised individuals.
            </li>
            <li>
              Concerns about records should be raised with the relevant club
              administrator.
            </li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>5. Children and young people</h2>

          <p style={paragraphStyle}>
            Where access is provided to a child or young person, the platform
            must be used in an age-appropriate and responsible way.
          </p>

          <p style={paragraphStyle}>
            Clubs remain responsible for deciding whether direct access is
            appropriate and for applying suitable safeguarding controls.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>6. Messaging and communications</h2>

          <p style={paragraphStyle}>
            Platform communication tools must be used for legitimate club,
            training, fixture, event and welfare purposes.
          </p>

          <ul style={listStyle}>
            <li>No abusive, threatening, discriminatory or inappropriate content.</li>
            <li>No unauthorised advertising, spam or promotional messages.</li>
            <li>
              Communication involving junior athletes must follow the club&apos;s
              safeguarding procedures.
            </li>
            <li>
              Private adult-to-child communication may be restricted, monitored
              or disabled.
            </li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>7. Photos, videos and media</h2>

          <p style={paragraphStyle}>
            Photos, videos and performance footage may only be uploaded, stored
            or shared where the club has an appropriate purpose and the required
            permissions.
          </p>

          <p style={paragraphStyle}>
            Users must respect recorded photo, video and social-media consent
            choices.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>8. Prohibited use</h2>

          <p style={paragraphStyle}>You must not:</p>

          <ul style={listStyle}>
            <li>Attempt to access another user&apos;s account.</li>
            <li>Bypass or interfere with platform security.</li>
            <li>Upload malicious, unlawful or inappropriate material.</li>
            <li>Misuse athlete, parent, medical or safeguarding information.</li>
            <li>Use the platform to harass, intimidate or discriminate.</li>
            <li>
              Copy or reproduce platform content or software without permission.
            </li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>9. Platform availability</h2>

          <p style={paragraphStyle}>
            We aim to provide a reliable service, but uninterrupted access cannot
            be guaranteed. Maintenance, security work, provider outages or
            technical issues may occasionally affect availability.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>10. Suspension and removal of access</h2>

          <p style={paragraphStyle}>
            Access may be restricted, suspended or removed where there is
            suspected misuse, a safeguarding concern, a security risk, a breach
            of these terms or where club membership or responsibilities end.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>11. Responsibility of clubs</h2>

          <p style={paragraphStyle}>
            Each club or organisation is responsible for managing its users,
            permissions, membership records, safeguarding procedures and the
            accuracy of information entered by its authorised representatives.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>12. Changes to these terms</h2>

          <p style={paragraphStyle}>
            These terms may be updated when the platform, law or club-management
            requirements change. Where a significant update is made, users may
            be required to review and accept a new version before continuing.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>13. Contact</h2>

          <p style={paragraphStyle}>
            Questions about these terms should be directed to your club
            administrator or Boar Pack Track support.
          </p>
        </section>

        <div
          style={{
            marginTop: "44px",
            padding: "22px",
            border: "1px solid rgba(245,181,27,0.35)",
            borderRadius: "16px",
            background: "rgba(245,181,27,0.07)",
            color: "#e5ebf4",
          }}
        >
          Boar Pack Track is designed to support the safe development of
          athletes while protecting the privacy, dignity and personal
          information of every athlete, parent, coach, volunteer and club
          official.
        </div>

        <p
          style={{
            margin: "28px 0 0",
            color: "#93a4bc",
            fontSize: "12px",
            textAlign: "center",
          }}
        >
          This document is a working platform policy and should receive
          professional legal review before commercial launch.
        </p>
      </article>
    </main>
  );
}