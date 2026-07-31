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

function StatBox({ label, value }) {
  return (
    <div style={styles.statBox}>
      <span style={styles.statLabel}>{label}</span>
      <strong style={styles.statValue}>{value}</strong>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={styles.detailRow}>
      <span style={styles.detailLabel}>{label}</span>
      <strong style={styles.detailValue}>{value}</strong>
    </div>
  );
}

export default function PrintableIPDP({
  player = {},
  plan = {},
  attendance = null,
  achievements = [],
  clubName = "Bradford Salem RUFC",
  squadName = "",
  season = "2026/27",
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
    ["pt_number", "player_number"],
    ""
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
    ["review_period", "review_date"],
    "Not recorded"
  );

  const nextReview = getValue(
    plan,
    ["next_review_date"],
    "Not recorded"
  );

  const caps = getValue(player, ["Caps", "caps"], 0);
const tries = getValue(player, ["Tries", "tries"], 0);

  const playerOfMatch = achievements.filter((achievement) => {
    const type = String(
      getValue(
        achievement,
        ["achievement_type", "type", "title"],
        ""
      )
    ).toLowerCase();

    return (
      type.includes("player of the match") ||
      type.includes("player of match") ||
      type.includes("potm")
    );
  }).length;

  const coachesPlayer = achievements.filter((achievement) => {
    const type = String(
      getValue(
        achievement,
        ["achievement_type", "type", "title"],
        ""
      )
    ).toLowerCase();

    return type.includes("coach");
  }).length;

  const attendanceValue =
    attendance !== null && attendance !== undefined
      ? `${attendance}%`
      : getValue(
          player,
          ["attendance_percentage", "attendance"],
          "Not recorded"
        );

  return (
    <article id="player-development-report" style={styles.report}>
      <header style={styles.header}>
        <div>
          <div style={styles.clubName}>{clubName}</div>
          <h1 style={styles.title}>
           Boar Pack Player Development Report
          </h1>
        </div>

        <div style={styles.season}>
          Season {season}
        </div>
      </header>

      <section style={styles.playerSection}>
        <div style={styles.photoColumn}>
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

          <div style={styles.namePanel}>
            <div style={styles.playerName}>{playerName}</div>

            {ptNumber ? (
              <div style={styles.ptNumber}>{ptNumber}</div>
            ) : null}
          </div>
        </div>

        <div style={styles.detailsColumn}>
          <DetailRow
            label="Squad"
            value={
              squadName ||
              getValue(
                player,
                ["squad_name", "squad", "age_group"],
                "Not assigned"
              )
            }
          />

          <DetailRow
            label="Primary position"
            value={primaryPosition}
          />

          <DetailRow
            label="Secondary position"
            value={secondaryPosition}
          />

          <DetailRow
            label="Coach"
            value={coachName}
          />

          <DetailRow
            label="Review period"
            value={reviewPeriod}
          />

          <DetailRow
            label="Next review"
            value={nextReview}
          />
        </div>

        <div style={styles.statsColumn}>
          <div style={styles.statsGrid}>
            <StatBox label="Caps" value={caps} />
            <StatBox label="POTM" value={playerOfMatch} />
            <StatBox
              label="Coaches' Player"
              value={coachesPlayer}
            />
            <StatBox label="Tries" value={tries} />
          </div>

          <div style={styles.attendanceBox}>
            <span style={styles.attendanceLabel}>
              Attendance
            </span>

            <strong style={styles.attendanceValue}>
              {attendanceValue}
            </strong>
          </div>
        </div>
      </section>
    </article>
  );
}

const styles = {
  report: {
    width: "100%",
    maxWidth: "1120px",
    margin: "0 auto",
    background: "#f5f5f2",
    color: "#081a38",
    border: "3px solid #f5b800",
    borderRadius: "18px",
    overflow: "hidden",
    fontFamily: "Arial, Helvetica, sans-serif",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "24px",
    padding: "22px 28px",
    background:
      "linear-gradient(135deg, #06162f 0%, #0b2d59 100%)",
    color: "#ffffff",
  },

  clubName: {
    color: "#f5b800",
    fontSize: "20px",
    fontWeight: "900",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
  },

  title: {
    margin: "5px 0 0",
    fontSize: "30px",
    lineHeight: "1.1",
    textTransform: "uppercase",
  },

  season: {
    flexShrink: 0,
    padding: "10px 16px",
    background: "#f5b800",
    color: "#081a38",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "900",
    textTransform: "uppercase",
  },

  playerSection: {
    display: "grid",
    gridTemplateColumns: "250px minmax(240px, 1fr) minmax(340px, 1.35fr)",
    gap: "18px",
    padding: "20px",
    alignItems: "stretch",
  },

  photoColumn: {
    position: "relative",
    minHeight: "350px",
    background: "#d9dee7",
    borderRadius: "12px",
    overflow: "hidden",
  },

  photo: {
    width: "100%",
    height: "100%",
    minHeight: "350px",
    objectFit: "cover",
    display: "block",
  },

  photoPlaceholder: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    minHeight: "350px",
    color: "#657186",
    fontSize: "16px",
    fontWeight: "800",
  },

  namePanel: {
    position: "absolute",
    left: "0",
    right: "0",
    bottom: "0",
    padding: "42px 16px 16px",
    color: "#ffffff",
    background:
      "linear-gradient(transparent, rgba(4, 19, 43, 0.96))",
  },

  playerName: {
    fontSize: "26px",
    lineHeight: "1",
    fontWeight: "900",
    textTransform: "uppercase",
  },

  ptNumber: {
    marginTop: "7px",
    color: "#f5b800",
    fontSize: "14px",
    fontWeight: "900",
  },

  detailsColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
    padding: "12px",
    background: "#ffffff",
    border: "1px solid #d7dce3",
    borderRadius: "12px",
  },

  detailRow: {
    padding: "11px 12px",
    background: "#f4f6f9",
    borderLeft: "5px solid #f5b800",
    borderRadius: "7px",
  },

  detailLabel: {
    display: "block",
    marginBottom: "4px",
    color: "#667085",
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },

  detailValue: {
    display: "block",
    color: "#081a38",
    fontSize: "15px",
  },

  statsColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "10px",
  },

  statBox: {
    minHeight: "104px",
    padding: "14px",
    background:
      "linear-gradient(145deg, #06162f, #0b2d59)",
    color: "#ffffff",
    borderRadius: "10px",
    textAlign: "center",
    boxSizing: "border-box",
  },

  statLabel: {
    display: "block",
    minHeight: "34px",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: "900",
    textTransform: "uppercase",
  },

  statValue: {
    display: "block",
    marginTop: "5px",
    color: "#f5b800",
    fontSize: "32px",
    lineHeight: "1",
  },

  attendanceBox: {
    flex: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "20px",
    background: "#ffffff",
    border: "8px solid #f5b800",
    borderRadius: "14px",
  },

  attendanceLabel: {
    fontSize: "16px",
    fontWeight: "900",
    textTransform: "uppercase",
  },

  attendanceValue: {
    color: "#081a38",
    fontSize: "34px",
  },
};