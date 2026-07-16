function formatDateTime(dateValue) {
  if (!dateValue) return "Date unavailable";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateValue));
}

function getHistoryIcon(eventType) {
  const event = eventType?.toLowerCase() || "";

  if (event.includes("created")) return "🎯";
  if (event.includes("completed")) return "✅";
  if (event.includes("progress")) return "📈";
  if (event.includes("status")) return "🔄";
  if (event.includes("review")) return "📅";
  if (event.includes("notes")) return "📝";

  return "🏉";
}

export default function DevelopmentHistory({ history = [] }) {
  return (
    <section style={styles.section}>
      <div style={styles.headingArea}>
        <p style={styles.eyebrow}>PLAYER JOURNEY</p>

        <h2 style={styles.heading}>Development History</h2>

        <p style={styles.intro}>
          A permanent record of progress updates, reviews and completed
          objectives.
        </p>
      </div>

      {history.length === 0 ? (
        <div style={styles.empty}>
          No development history has been recorded yet.
        </div>
      ) : (
        <div style={styles.timeline}>
          {history.map((entry, index) => {
            const progressChanged =
              entry.old_progress !== null &&
              entry.new_progress !== null &&
              Number(entry.old_progress) !== Number(entry.new_progress);

            const statusChanged =
              entry.old_status &&
              entry.new_status &&
              entry.old_status !== entry.new_status;

            return (
              <article key={entry.id} style={styles.item}>
                <div style={styles.markerArea}>
                  <div style={styles.icon}>
                    {getHistoryIcon(entry.event_type)}
                  </div>

                  {index < history.length - 1 && (
                    <div style={styles.line} />
                  )}
                </div>

                <div style={styles.content}>
                  <div style={styles.topRow}>
                    <h3 style={styles.title}>
                      {entry.event_type || "Plan updated"}
                    </h3>

                    <time style={styles.date}>
                      {formatDateTime(entry.created_at)}
                    </time>
                  </div>

                  {progressChanged && (
                    <div style={styles.change}>
                      <strong>{entry.old_progress}%</strong>

                      <span style={styles.arrow}>→</span>

                      <strong style={styles.newValue}>
                        {entry.new_progress}%
                      </strong>
                    </div>
                  )}

                  {statusChanged && (
                    <div style={styles.change}>
                      <span>{entry.old_status}</span>

                      <span style={styles.arrow}>→</span>

                      <strong style={styles.newValue}>
                        {entry.new_status}
                      </strong>
                    </div>
                  )}

                  {entry.notes && (
                    <p style={styles.notes}>{entry.notes}</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

const styles = {
  section: {
    marginTop: "38px",
    padding: "26px",
    border: "1px solid rgba(245,184,0,0.4)",
    borderRadius: "16px",
    background:
      "linear-gradient(145deg, rgba(7,31,63,0.98), rgba(3,17,36,0.98))",
    boxShadow: "0 16px 40px rgba(0,0,0,0.28)",
  },

  headingArea: {
    marginBottom: "25px",
  },

  eyebrow: {
    margin: "0 0 7px",
    color: "#f5b800",
    fontSize: "12px",
    fontWeight: "900",
    letterSpacing: "1.5px",
  },

  heading: {
    margin: "0",
    color: "#ffffff",
    fontSize: "clamp(25px, 4vw, 34px)",
    lineHeight: "1.1",
  },

  intro: {
    margin: "9px 0 0",
    color: "#cbd5e1",
    lineHeight: "1.5",
  },

  empty: {
    padding: "25px",
    border: "1px dashed rgba(245,184,0,0.45)",
    borderRadius: "12px",
    color: "#cbd5e1",
    textAlign: "center",
  },

  timeline: {
    display: "grid",
  },

  item: {
    display: "grid",
    gridTemplateColumns: "52px minmax(0, 1fr)",
    gap: "14px",
  },

  markerArea: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  icon: {
    position: "relative",
    zIndex: "2",
    display: "grid",
    placeItems: "center",
    width: "42px",
    height: "42px",
    flexShrink: "0",
    border: "2px solid #f5b800",
    borderRadius: "50%",
    background: "#071f3f",
    fontSize: "19px",
  },

  line: {
    width: "3px",
    minHeight: "70px",
    flex: "1",
    background:
      "linear-gradient(#f5b800, rgba(245,184,0,0.18))",
  },

  content: {
    marginBottom: "18px",
    padding: "17px 18px",
    border: "1px solid rgba(148,163,184,0.22)",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.045)",
  },

  topRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },

  title: {
    margin: "0",
    color: "#ffffff",
    fontSize: "18px",
  },

  date: {
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "700",
  },

  change: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "10px",
    marginTop: "12px",
    color: "#e2e8f0",
    fontSize: "17px",
  },

  arrow: {
    color: "#94a3b8",
  },

  newValue: {
    color: "#f5b800",
  },

  notes: {
    margin: "12px 0 0",
    color: "#cbd5e1",
    lineHeight: "1.55",
  },
};