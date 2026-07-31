function getValue(source, possibleKeys, fallback = "Not recorded") {
  if (!source) return fallback;

  for (const key of possibleKeys) {
    const value = source[key];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return fallback;
}
function formatReportDate(value) {
  if (!value || value === "Not recorded") {
    return "Not recorded";
  }

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
function formatPlayerName(player) {
  const fullName = getValue(
    player,
    ["full_name", "player_name", "name", "Full_name", "Player_name"],
    ""
  );

  if (fullName) return fullName;

  const firstName = getValue(
    player,
    ["First_name", "first_name", "firstname", "FirstName"],
    ""
  );

  const lastName = getValue(
    player,
    ["Last_name", "last_name", "surname", "lastname", "LastName"],
    ""
  );

  const combinedName = `${firstName} ${lastName}`.trim();

  return combinedName || "Player name";
}

function countAchievements(achievements, searchTerms) {
  return achievements.filter((achievement) => {
    const type = String(
      getValue(
        achievement,
        ["achievement_type", "type", "title", "award_type"],
        ""
      )
    ).toLowerCase();

    return searchTerms.some((term) =>
      type.includes(term.toLowerCase())
    );
  }).length;
}

function normalisePercentage(value, fallback = 0) {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    value === "Not recorded"
  ) {
    return fallback;
  }

  const numericValue = Number(
    String(value).replace("%", "").trim()
  );

  if (Number.isNaN(numericValue)) {
    return fallback;
  }

  return Math.max(0, Math.min(100, numericValue));
}

function displayPercentage(value) {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    value === "Not recorded"
  ) {
    return "Not recorded";
  }

  const text = String(value);

  return text.includes("%") ? text : `${text}%`;
}

function DetailItem({ label, value }) {
  return (
    <div style={styles.detailItem}>
      <span style={styles.detailLabel}>{label}</span>
      <strong style={styles.detailValue}>{value}</strong>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div style={styles.statItem}>
      <strong style={styles.statNumber}>{value}</strong>
      <span style={styles.statName}>{label}</span>
    </div>
  );
}

function ProgressRing({
  label,
  value,
  displayValue,
  subtitle,
  accent = "#f5b800",
}) {
  const safeValue = normalisePercentage(value);
const ringColour =
  safeValue >= 85
    ? "#22c55e"
    : safeValue >= 70
      ? "#f5b800"
      : safeValue >= 50
        ? "#f97316"
        : "#ef4444";
  return (
    <div style={styles.progressCard}>
      <div
        style={{
          ...styles.progressRing,
          background: `conic-gradient(
            ${ringColour} ${safeValue * 3.6}deg,
            #dbe2ec ${safeValue * 3.6}deg
          )`,
        }}
      >
        <div style={styles.progressRingInner}>
          <strong style={styles.progressValue}>
            {displayValue}
          </strong>
        </div>
      </div>

      <span style={styles.progressLabel}>{label}</span>

      {subtitle ? (
        <span style={styles.progressSubtitle}>{subtitle}</span>
      ) : null}
    </div>
  );
}

function ClubBadge({ clubName, clubLogoUrl }) {
  if (clubLogoUrl) {
    return (
      <img
        src={clubLogoUrl}
        alt={`${clubName} logo`}
        style={styles.clubLogo}
      />
    );
  }

  const initials = String(clubName)
    .split(" ")
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <div style={styles.clubLogoPlaceholder}>
      <span>{initials || "CLUB"}</span>
    </div>
  );
}

export default function PrintableIPDP({
  player = {},
  plan = {},
  attendance = null,
  achievements = [],
  clubName = "Bradford Salem RUFC",
  clubLogoUrl = "",
  squadName = "",
  season = "2026/27",
  sponsors = [
  {
    name: "Boar Pack",
    logoUrl: "/sponsors/boar-pack-sponsor-logo.png",
  },
  {
    name: "IB Automotive",
    logoUrl: "/sponsors/ib-automotive-logo.jpg",
  },
],
}) {
  const playerName = formatPlayerName(player);

  const photoUrl = getValue(
    player,
    [
      "Profile_image",
      "profile_image",
      "photo_url",
      "player_photo",
      "image_url",
      "avatar_url",
    ],
    ""
  );

  const ptNumber = getValue(
    player,
    ["pt_number", "Pt_number", "player_number"],
    "Not assigned"
  );

  const primaryPosition = getValue(
    player,
    ["Primary_position", "primary_position", "position"],
    "Not recorded"
  );

  const secondaryPosition = getValue(
    player,
    ["Secondary_position", "secondary_position"],
    "Not recorded"
  );

  const coachName = getValue(
    plan,
    ["Coach_name", "coach_name", "coach"],
    getValue(
      player,
      ["Coach_name", "coach_name"],
      "Not assigned"
    )
  );

  const reviewPeriod = getValue(
    plan,
    ["review_period", "review_date", "Review_date"],
    "Not recorded"
  );

  const nextReview = getValue(
    plan,
    ["next_review_date", "Next_review_date"],
    "Not recorded"
  );

 const joinedClub = formatReportDate(
  getValue(
    player,
    [
      "join_date",
      "joined_date",
      "date_joined",
      "Joined_date",
      "club_join_date",
    ],
    "Not recorded"
  )
);

  const ageGroup =
    squadName ||
    getValue(
      player,
      ["squad_name", "squad", "age_group", "Age_group"],
      "Not assigned"
    );

  const caps = getValue(player, ["Caps", "caps"], 0);
  const tries = getValue(player, ["Tries", "tries"], 0);

  const tackles = getValue(
    player,
    ["Tackles", "tackles"],
    0
  );

  const overallRatingRaw = getValue(
    plan,
    ["overall_rating", "Overall_rating"],
    getValue(
      player,
      ["overall_rating", "Overall_rating"],
      0
    )
  );
console.log("PRINTABLE PLAYER DATA:", player);
 const potentialRaw = getValue(
  player,
  ["Potential", "potential", "potential_rating", "potential_score"],
  getValue(
    plan,
    ["Potential", "potential", "potential_rating", "potential_score"],
    0
  )
);

  const progressRaw = getValue(
    plan,
    [
      "focus_progress",
      "progress",
      "progress_percentage",
      "current_progress",
    ],
    0
  );

  const attendanceRaw =
    attendance !== null && attendance !== undefined
      ? attendance
      : getValue(
          player,
          ["attendance_percentage", "attendance"],
          "Not recorded"
        );

  const overallRating =
  Number(overallRatingRaw) <= 10
    ? Number(overallRatingRaw) * 10
    : normalisePercentage(overallRatingRaw);
  const potential = normalisePercentage(potentialRaw);
  const progress = normalisePercentage(progressRaw);
  const attendancePercentage =
    attendanceRaw === "Not recorded"
      ? 0
      : normalisePercentage(attendanceRaw);

  const currentFocus = getValue(
  plan,
  [
    "current_focus",
    "focus",
    "development_focus",
    "strengths",
    "development_areas"
  ],
  getValue(
    plan,
    [
      "current_focus",
      "primary_goal",
      "development_goal",
      "goal",
      "focus"
    ],
    "No current focus has been recorded."
  )
);

  const developmentStatus = getValue(
    plan,
    ["review_status", "status", "development_status"],
    "Not recorded"
  );

  const coachComments = getValue(
    plan,
    [
      "coach_comments",
      "coach_notes",
      "notes",
      "review_comments",
    ],
    "No coach comments have been recorded yet."
  );

  const playerOfMatch = countAchievements(achievements, [
    "player of the match",
    "player of match",
    "potm",
  ]);

  const coachesPlayer = countAchievements(achievements, [
    "coach",
  ]);

  const magicMoments = countAchievements(achievements, [
    "magic moment",
  ]);

  const mostImproved = countAchievements(achievements, [
    "most improved",
  ]);

  return (
    <article
      id="player-development-report"
      style={styles.report}
    >
      <header style={styles.header}>
        <div style={styles.bptBrand}>
          <img
  src="/boarpack-logo.png"
  alt="Boar Pack Track"
  style={styles.bptLogo}
/>

          <div>
            <div style={styles.bptName}>
              BOAR PACK TRACK
            </div>

            <div style={styles.documentName}>
              PLAYER DEVELOPMENT REPORT
            </div>
          </div>
        </div>

        <div style={styles.headerCentre}>
          <div style={styles.clubHeading}>{clubName}</div>
          <div style={styles.squadHeading}>{ageGroup}</div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.seasonBadge}>
            <span style={styles.seasonLabel}>Season</span>
            <strong style={styles.seasonValue}>{season}</strong>
          </div>

         <ClubBadge
  clubName={clubName}
  clubLogoUrl={clubLogoUrl || "/salem-logo.png"}
/>
        </div>
      </header>

      <section style={styles.identitySection}>
        <div style={styles.photoPanel}>
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={playerName}
              style={styles.photo}
            />
          ) : (
            <div style={styles.photoPlaceholder}>
              Player photo
            </div>
          )}

         <div style={styles.photoOverlay}>
  <div style={styles.playerName}>{playerName}</div>
</div>
        </div>

        <div style={styles.identityCard}>
          <div style={styles.identityHeader}>
            <div>
              <span style={styles.sectionEyebrow}>
                Player profile
              </span>

              <h2 style={styles.identityName}>{playerName}</h2>
              <div style={styles.playerSummary}>
  {ptNumber} • {ageGroup} • {primaryPosition}
</div>
            </div>

            <div style={styles.ptBadge}>
              <span style={styles.ptLabel}>PT Number</span>
              <strong style={styles.ptValue}>{ptNumber}</strong>
            </div>
          </div>

          <div style={styles.detailGrid}>
            <DetailItem label="Squad" value={ageGroup} />

            <DetailItem
              label="Primary position"
              value={primaryPosition}
            />

            <DetailItem
              label="Secondary position"
              value={secondaryPosition}
            />

            <DetailItem label="Coach" value={coachName} />

            <DetailItem
              label="Joined club"
              value={joinedClub}
            />

            <DetailItem
              value={formatReportDate(nextReview)}
              
            />
          </div>
        </div>
      </section>

      <section style={styles.snapshotSection}>
        <div style={styles.sectionTitleRow}>
          <div style={styles.sectionLine} />

          <h2 style={styles.sectionTitle}>
            Development Snapshot
          </h2>

          <div style={styles.sectionLine} />
        </div>

        <div style={styles.snapshotGrid}>
          <ProgressRing
            label="Overall rating"
            value={overallRating}
            displayValue={
              overallRatingRaw === "Not recorded"
                ? "—"
                : overallRating
            }
            subtitle="/100"
            accent="#f5b800"
          />

          <ProgressRing
            label="Potential"
            value={potential}
            displayValue={
              potentialRaw === "Not recorded"
                ? "—"
                : potential
            }
            subtitle="/100"
            accent="#3f9cff"
          />

          <ProgressRing
            label="Attendance"
            value={attendancePercentage}
            displayValue={
              attendanceRaw === "Not recorded"
                ? "—"
                : displayPercentage(attendanceRaw)
            }
            accent="#35b96f"
          />

          <ProgressRing
            label="Current progress"
            value={progress}
            displayValue={
              progressRaw === "Not recorded"
                ? "—"
                : `${progress}%`
            }
            accent="#f5b800"
          />

          <div style={styles.focusSnapshot}>
            <div style={styles.focusIcon}>◎</div>

            <span style={styles.progressLabel}>
              Current focus
            </span>

            <strong style={styles.focusSnapshotText}>
              {currentFocus}
            </strong>
          </div>
        </div>
      </section>

      <section style={styles.lowerGrid}>
        <div style={styles.statsPanel}>
          <div style={styles.panelHeading}>
            Performance Stats
          </div>

          <div style={styles.statsGrid}>
            <StatItem label="Caps" value={caps} />
            <StatItem label="Tries" value={tries} />
            <StatItem label="Tackles" value={tackles} />
            <StatItem label="POTM" value={playerOfMatch} />

            <StatItem
              label="Coaches' Player"
              value={coachesPlayer}
            />

            <StatItem
              label="Magic Moments"
              value={magicMoments}
            />

            <StatItem
              label="Most Improved"
              value={mostImproved}
            />
          </div>
        </div>

        <div style={styles.developmentPanel}>
          <div style={styles.developmentColumn}>
            <div style={styles.panelHeading}>
              Review Details
            </div>

            <div style={styles.reviewRows}>
              <DetailItem
                label="Review period"
                value={formatReportDate(reviewPeriod)}
              />

              <DetailItem
                label="Next review"
                value={formatReportDate(nextReview)}
              />

              <DetailItem
                label="Development status"
                value={developmentStatus}
              />
            </div>
          </div>

          <div style={styles.commentsColumn}>
            <div style={styles.panelHeading}>
              Coach Comments
            </div>

            <p style={styles.commentsText}>
              {coachComments}
            </p>
          </div>
        </div>
      </section>

     <footer style={styles.footer}>
  <div style={styles.footerBrand}>
    <span style={styles.footerSmall}>Powered by</span>

    <strong style={styles.footerBpt}>
      BOAR PACK TRACK
    </strong>

    <span style={styles.footerTagline}>
      Helping coaches develop better players.
    </span>
  </div>

  <div style={styles.footerVersionBox}>
    <span style={styles.footerVersionTitle}>
      Player Development Report
    </span>

    <span style={styles.footerVersion}>
      Version 1.0
    </span>
  </div>

  <div style={styles.sponsorArea}>
    <span style={styles.sponsorTitle}>
      Club Sponsors
    </span>

    <div style={styles.sponsorList}>
      {sponsors.length > 0 ? (
        sponsors.slice(0, 4).map((sponsor, index) => (
          <div
            key={`${sponsor.name || "sponsor"}-${index}`}
            style={styles.sponsorBox}
          >
            {sponsor.logoUrl ? (
              <img
                src={sponsor.logoUrl}
                alt={sponsor.name || "Club sponsor"}
                style={styles.sponsorLogo}
              />
            ) : (
              <span>
                {sponsor.name || "Sponsor"}
              </span>
            )}
          </div>
        ))
      ) : (
        <>
          <div style={styles.sponsorBox}>
            Sponsor logo
          </div>

          <div style={styles.sponsorBox}>
            Sponsor logo
          </div>

          <div style={styles.sponsorBox}>
            Sponsor logo
          </div>
        </>
      )}
    </div>
  </div>
</footer>
    </article>
  );
}

const styles = {
  report: {
    width: "1120px",
    maxWidth: "100%",
    margin: "0 auto",
    background: "#06152d",
    color: "#ffffff",
    border: "3px solid #f5b800",
    borderRadius: "18px",
    overflow: "hidden",
    fontFamily: "Arial, Helvetica, sans-serif",
    boxSizing: "border-box",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.28)",
  },

  header: {
    display: "grid",
    gridTemplateColumns:
      "minmax(300px, 1.2fr) minmax(240px, 1fr) minmax(210px, 0.8fr)",
    alignItems: "center",
    gap: "20px",
    minHeight: "132px",
    padding: "16px 28px",
    background:
      "linear-gradient(135deg, #040d1e 0%, #071c3c 48%, #0b2d59 100%)",
    borderBottom: "4px solid #f5b800",
    boxSizing: "border-box",
  },

  bptBrand: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

 bptLogo: {
  width: "84px",
  height: "84px",
  flexShrink: 0,
  objectFit: "contain",
  borderRadius: "14px",
},

  bptName: {
    color: "#ffffff",
    fontSize: "29px",
    lineHeight: "1",
    fontWeight: "1000",
    letterSpacing: "0.5px",
  },

  documentName: {
    marginTop: "8px",
    color: "#f5b800",
    fontSize: "18px",
    lineHeight: "1.1",
    fontWeight: "900",
    textTransform: "uppercase",
  },

  headerCentre: {
    textAlign: "center",
  },

  clubHeading: {
    color: "#ffffff",
    fontSize: "23px",
    fontWeight: "1000",
    textTransform: "uppercase",
  },
squadHeading: {
  marginTop: "3px",
  color: "#f5b800",
  fontSize: "17px",
  fontWeight: "900",
  textTransform: "uppercase",
},

  headerRight: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "14px",
  },

  seasonBadge: {
    minWidth: "108px",
    padding: "10px 13px",
    background: "#f5b800",
    color: "#06152d",
    borderRadius: "10px",
    textAlign: "center",
  },

  seasonLabel: {
    display: "block",
    fontSize: "10px",
    fontWeight: "900",
    textTransform: "uppercase",
  },

  seasonValue: {
    display: "block",
    marginTop: "3px",
    fontSize: "17px",
  },

clubLogo: {
  width: "102px",
  height: "112px",
  objectFit: "contain",
},

  clubLogoPlaceholder: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "82px",
    height: "92px",
    padding: "6px",
    border: "3px solid #f5b800",
    borderRadius: "10px",
    background: "#07152e",
    color: "#ffffff",
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "1000",
    boxSizing: "border-box",
  },

  identitySection: {
    display: "grid",
    gridTemplateColumns: "310px minmax(0, 1fr)",
    gap: "20px",
    padding: "22px",
    background:
      "linear-gradient(145deg, #06152d 0%, #09234a 100%)",
  },

  photoPanel: {
    position: "relative",
    height: "370px",
    overflow: "hidden",
    border: "3px solid #f5b800",
    borderRadius: "16px",
    background: "#dce3ec",
  },

  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  photoPlaceholder: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    color: "#657186",
    fontWeight: "900",
  },

  photoOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: "58px 18px 18px",
    background:
      "linear-gradient(transparent, rgba(3, 14, 32, 0.98))",
  },

  playerName: {
    fontSize: "30px",
    lineHeight: "1",
    fontWeight: "1000",
    textTransform: "uppercase",
  },

  photoPosition: {
    marginTop: "8px",
    color: "#f5b800",
    fontSize: "16px",
    fontWeight: "900",
    textTransform: "uppercase",
  },

  identityCard: {
    padding: "22px",
    background: "#ffffff",
    color: "#07152e",
    borderRadius: "16px",
    boxSizing: "border-box",
  },

  identityHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    paddingBottom: "18px",
    borderBottom: "2px solid #dfe4ec",
  },

  sectionEyebrow: {
    color: "#5f6c80",
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },

  identityName: {
    margin: "7px 0 0",
    color: "#06152d",
    fontSize: "31px",
    lineHeight: "1",
    textTransform: "uppercase",
  },
playerSummary: {
  marginTop: "9px",
  color: "#8a6500",
  fontSize: "14px",
  lineHeight: "1.3",
  fontWeight: "900",
  textTransform: "uppercase",
},
  ptBadge: {
    minWidth: "120px",
    padding: "12px 15px",
    background: "#06152d",
    color: "#ffffff",
    borderRadius: "11px",
    textAlign: "center",
  },

  ptLabel: {
    display: "block",
    color: "#f5b800",
    fontSize: "10px",
    fontWeight: "900",
    textTransform: "uppercase",
  },

  ptValue: {
    display: "block",
    marginTop: "5px",
    fontSize: "22px",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "11px",
    marginTop: "18px",
  },

  detailItem: {
    minHeight: "64px",
    padding: "11px 13px",
    background: "#f2f5f9",
    borderLeft: "5px solid #f5b800",
    borderRadius: "8px",
    boxSizing: "border-box",
  },

  detailLabel: {
    display: "block",
    marginBottom: "5px",
    color: "#667085",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },

  detailValue: {
    display: "block",
    color: "#07152e",
    fontSize: "14px",
    lineHeight: "1.25",
  },

  snapshotSection: {
    padding: "8px 22px 22px",
    background: "#06152d",
  },

  sectionTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "14px",
  },

  sectionLine: {
    height: "2px",
    flex: 1,
    background: "#f5b800",
  },

  sectionTitle: {
    margin: 0,
    color: "#f5b800",
    fontSize: "21px",
    fontWeight: "1000",
    textTransform: "uppercase",
  },

  snapshotGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr)) minmax(210px, 1.25fr)",
    gap: "12px",
    padding: "15px",
    background: "#ffffff",
    color: "#07152e",
    borderRadius: "15px",
  },

  progressCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "166px",
    padding: "8px",
    textAlign: "center",
    borderRight: "1px solid #dfe4ec",
  },

  progressRing: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "94px",
    height: "94px",
    borderRadius: "50%",
  },

  progressRingInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "72px",
    height: "72px",
    background: "#ffffff",
    borderRadius: "50%",
  },

  progressValue: {
    color: "#07152e",
    fontSize: "24px",
    lineHeight: "1",
  },

  progressLabel: {
    marginTop: "10px",
    color: "#07152e",
    fontSize: "11px",
    fontWeight: "1000",
    textTransform: "uppercase",
  },

  progressSubtitle: {
    marginTop: "2px",
    color: "#697386",
    fontSize: "10px",
    fontWeight: "800",
  },

  focusSnapshot: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "166px",
    padding: "12px",
    textAlign: "center",
  },

  focusIcon: {
    color: "#f5b800",
    fontSize: "52px",
    lineHeight: "0.9",
    fontWeight: "1000",
  },

  focusSnapshotText: {
    display: "-webkit-box",
    marginTop: "8px",
    overflow: "hidden",
    color: "#07152e",
    fontSize: "13px",
    lineHeight: "1.3",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
  },

  lowerGrid: {
    display: "grid",
    gridTemplateColumns: "0.9fr 1.1fr",
    gap: "16px",
    padding: "0 22px 22px",
    background: "#06152d",
  },

  statsPanel: {
    padding: "16px",
    background: "#ffffff",
    color: "#07152e",
    borderRadius: "15px",
  },

  panelHeading: {
    display: "inline-block",
    padding: "7px 12px",
    background: "#f5b800",
    color: "#07152e",
    borderRadius: "7px",
    fontSize: "14px",
    fontWeight: "1000",
    textTransform: "uppercase",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "8px",
    marginTop: "14px",
  },

  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "85px",
    padding: "8px",
    background: "#eef2f7",
    borderRadius: "9px",
    textAlign: "center",
  },

  statNumber: {
    color: "#07152e",
    fontSize: "25px",
    lineHeight: "1",
  },

  statName: {
    marginTop: "7px",
    color: "#9b7200",
    fontSize: "9px",
    lineHeight: "1.15",
    fontWeight: "1000",
    textTransform: "uppercase",
  },

  developmentPanel: {
    display: "grid",
    gridTemplateColumns: "0.9fr 1.1fr",
    gap: "14px",
    padding: "16px",
    background: "#ffffff",
    color: "#07152e",
    borderRadius: "15px",
  },

  developmentColumn: {
    paddingRight: "14px",
    borderRight: "1px solid #dfe4ec",
  },

  reviewRows: {
    display: "grid",
    gap: "9px",
    marginTop: "14px",
  },

  commentsColumn: {
    minWidth: 0,
  },

  commentsText: {
    margin: "15px 0 0",
    color: "#26364e",
    fontSize: "13px",
    lineHeight: "1.55",
  },

  footer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    alignItems: "center",
    gap: "20px",
    minHeight: "120px",
    padding: "18px 26px",
    background:
      "linear-gradient(135deg, #040d1e, #09234a)",
    borderTop: "4px solid #f5b800",
  },

  footerBrand: {
    display: "flex",
    flexDirection: "column",
  },

  footerSmall: {
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "900",
    textTransform: "uppercase",
  },

  footerBpt: {
    marginTop: "3px",
    color: "#f5b800",
    fontSize: "25px",
    lineHeight: "1",
  },

  footerTagline: {
    marginTop: "7px",
    color: "#ffffff",
    fontSize: "11px",
  },
  footerVersionBox: {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
},
footerVersionTitle: {
  color: "#ffffff",
  fontSize: "10px",
  fontWeight: "900",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
},
footerVersion: {
  marginTop: "5px",
  color: "#9eabc0",
  fontSize: "9px",
  fontWeight: "700",
  letterSpacing: "0.4px",
  textTransform: "uppercase",
},
  sponsorArea: {
    textAlign: "right",
  },

  sponsorTitle: {
    display: "block",
    marginBottom: "8px",
    color: "#f5b800",
    fontSize: "11px",
    fontWeight: "1000",
    textTransform: "uppercase",
  },

  sponsorList: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "9px",
  },

  sponsorBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "118px",
    height: "54px",
    padding: "6px",
    overflow: "hidden",
    background: "#ffffff",
    color: "#07152e",
    border: "2px solid #f5b800",
    borderRadius: "8px",
    fontSize: "10px",
    fontWeight: "900",
    textAlign: "center",
    boxSizing: "border-box",
  },

  sponsorLogo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
};