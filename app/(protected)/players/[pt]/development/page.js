import { supabase } from "@/lib/supabase";
import DevelopmentHistory from "@/app/components/DevelopmentHistory";
import PrintableIPDP from "@/app/components/PrintableIPDP";
async function getPlayer(pt) {
  const { data, error } = await supabase
    .from("Players")
    .select("*")
    .eq("Pt_number", pt)
    .single();

  if (error) {
    console.error("Player lookup error:", error);
    return null;
  }

  return data;
}

async function getDevelopmentPlans(playerId) {
  const { data, error } = await supabase
    .from("player_development_plans")
    .select("*")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Development plans error:", error);
    return [];
  }

  return data || [];
}
async function getAchievements(playerId) {
  if (!supabase || !playerId) return [];

  const { data, error } = await supabase
    .from("player_achievements")
    .select("*")
    .eq("player_id", playerId)
    .order("achievement_date", { ascending: false });

  if (error) {
    console.error("Achievement loading error:", error);
    return [];
  }

  return data || [];
}
async function getDevelopmentHistory(playerId) {
  const { data, error } = await supabase
    .from("player_development_history")
    .select("*")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Development history error:", error);
    return [];
  }

  return data || [];
}
function formatDate(dateValue) {
  if (!dateValue) return "No review date set";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateValue}T12:00:00`));
}

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

function getStatusStyle(status) {
  const normalisedStatus = status?.toLowerCase();

  if (normalisedStatus === "completed") {
    return {
      background: "rgba(34, 197, 94, 0.18)",
      border: "1px solid #22c55e",
      color: "#bbf7d0",
      label: "Completed",
      dot: "#22c55e",
    };
  }

  if (normalisedStatus === "on hold") {
    return {
      background: "rgba(249, 115, 22, 0.18)",
      border: "1px solid #f97316",
      color: "#fed7aa",
      label: "On Hold",
      dot: "#f97316",
    };
  }

  return {
    background: "rgba(59, 130, 246, 0.18)",
    border: "1px solid #3b82f6",
    color: "#bfdbfe",
    label: "Active",
    dot: "#3b82f6",
  };
}

function getCategoryIcon(category) {
  const categoryName = category?.toLowerCase() || "";

  if (categoryName.includes("fitness")) return "🏃";
  if (categoryName.includes("tackl")) return "🛡️";
  if (categoryName.includes("pass")) return "🏉";
  if (categoryName.includes("kick")) return "🥾";
  if (categoryName.includes("lead")) return "⭐";
  if (categoryName.includes("communicat")) return "📣";
  if (categoryName.includes("discipline")) return "🎯";
  if (categoryName.includes("defence")) return "🛡️";
  if (categoryName.includes("attack")) return "⚡";

  return "🎯";
}

export default async function PlayerDevelopmentPlan({ params }) {
  const { pt } = await params;

  const player = await getPlayer(pt);

  if (!player) {
    return (
      <main style={styles.page}>
        <section style={styles.notFoundCard}>
          <h1 style={styles.notFoundHeading}>Player not found</h1>

          <a href="/players" style={styles.backLink}>
            ← Return to players
          </a>
        </section>
      </main>
    );
  }

  const plans = await getDevelopmentPlans(player.id);
const history = await getDevelopmentHistory(player.id);
const achievements = await getAchievements(player.id);
  const activeCount = plans.filter(
    (plan) => plan.status?.toLowerCase() === "active"
  ).length;

  const completedCount = plans.filter(
    (plan) => plan.status?.toLowerCase() === "completed"
  ).length;

  const onHoldCount = plans.filter(
    (plan) => plan.status?.toLowerCase() === "on hold"
  ).length;

  return (
    <main style={styles.page}>
      <section style={styles.container}>
        <a
          href={`/players/${player.Pt_number}`}
          style={styles.backLink}
        >
          ← Back to {player.First_name}
        </a>

        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>BOAR PACK TRACK</p>

            <h1 style={styles.heading}>
              {player.First_name} {player.Last_name}
            </h1>

            <p style={styles.subheading}>
              Individual Player Development
            </p>
          </div>

          <a
            href={`/players/${player.Pt_number}/development/create`}
            style={styles.newPlanButton}
          >
            + New Development Plan
          </a>
        </header>
        <div style={{ marginTop: "24px", marginBottom: "24px" }}>
  <PrintableIPDP
    player={player}
    achievements={achievements}
    plan={plans[0] || {}}
   
    clubName="Bradford Salem RUFC"
    squadName="U14s"
    season="2026/27"
  />
</div>

        <section style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Total Plans</span>
            <strong style={styles.summaryNumber}>{plans.length}</strong>
          </div>

          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Active</span>
            <strong style={{ ...styles.summaryNumber, color: "#60a5fa" }}>
              {activeCount}
            </strong>
          </div>

          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Completed</span>
            <strong style={{ ...styles.summaryNumber, color: "#4ade80" }}>
              {completedCount}
            </strong>
          </div>

          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>On Hold</span>
            <strong style={{ ...styles.summaryNumber, color: "#fb923c" }}>
              {onHoldCount}
            </strong>
          </div>
        </section>

        <section style={styles.sectionHeadingRow}>
          <div>
            <p style={styles.eyebrow}>CURRENT OBJECTIVES</p>
            <h2 style={styles.sectionHeading}>Development Priorities</h2>
          </div>
        </section>

        {plans.length === 0 ? (
          <section style={styles.emptyCard}>
            <div style={styles.emptyIcon}>🎯</div>

            <h2 style={styles.emptyHeading}>
              No development plans yet
            </h2>

            <p style={styles.emptyText}>
              Create the first development priority for{" "}
              {player.First_name}.
            </p>

            <a
              href={`/players/${player.Pt_number}/development/create`}
              style={styles.newPlanButton}
            >
              + Create First Plan
            </a>
          </section>
        ) : (
          <section style={styles.planGrid}>
            {plans.map((plan, index) => {
              const statusStyle = getStatusStyle(plan.status);
              const progress = Math.min(
                100,
                Math.max(0, Number(plan.progress) || 0)
              );

              return (
                <article key={plan.id} style={styles.planCard}>
                  <div style={styles.planTopRow}>
                    <div style={styles.categoryArea}>
                      <span style={styles.categoryIcon}>
                        {getCategoryIcon(plan.category)}
                      </span>

                      <div>
                        <span style={styles.priorityNumber}>
                          PRIORITY {index + 1}
                        </span>

                        <h3 style={styles.categoryHeading}>
                          {plan.category || "Development"}
                        </h3>
                      </div>
                    </div>

                    <span
                      style={{
                        ...styles.statusBadge,
                        background: statusStyle.background,
                        border: statusStyle.border,
                        color: statusStyle.color,
                      }}
                    >
                      <span
                        style={{
                          ...styles.statusDot,
                          background: statusStyle.dot,
                        }}
                      />

                      {statusStyle.label}
                    </span>
                  </div>

                  <div style={styles.divider} />

                  <div style={styles.contentGrid}>
                    <div style={styles.targetSection}>
                      <span style={styles.smallLabel}>TARGET</span>

                      <p style={styles.targetText}>
                        {plan.target || "No target entered"}
                      </p>
                    </div>

                    <div style={styles.reviewSection}>
                      <span style={styles.smallLabel}>REVIEW DATE</span>

                      <p style={styles.reviewDate}>
                        📅 {formatDate(plan.review_date)}
                      </p>
                    </div>
                  </div>

                  <div style={styles.progressSection}>
                    <div style={styles.progressHeading}>
                      <span style={styles.smallLabel}>PROGRESS</span>

                      <strong style={styles.progressPercentage}>
                        {progress}%
                      </strong>
                    </div>

                    <div style={styles.progressTrack}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${progress}%`,
                        }}
                      />
                    </div>
                  </div>
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
    marginTop: "18px",
  }}
>
  <div
    style={{
      padding: "14px",
      borderRadius: "10px",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
    }}
  >
    <span style={styles.smallLabel}>COACH</span>
    <p style={{ margin: "7px 0 0", fontWeight: "800" }}>
      {plan.coach_name || "Not assigned"}
    </p>
  </div>

  <div
    style={{
      padding: "14px",
      borderRadius: "10px",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
    }}
  >
    <span style={styles.smallLabel}>CURRENT STATUS</span>
    <p style={{ margin: "7px 0 0", fontWeight: "800" }}>
      {statusStyle.label}
    </p>
  </div>
</div>
                  <div style={styles.coachNotesSection}>
                    <span style={styles.smallLabel}>
                      ACTIONS &amp; COACH NOTES
                    </span>

                    <p style={styles.coachNotes}>
                      {plan.coach_notes ||
                        "No coach actions have been entered."}
                    </p>
                  </div>

                  <div style={styles.cardFooter}>
                    <span style={styles.createdText}>
                      Created{" "}
                      {plan.created_at
                        ? new Intl.DateTimeFormat("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(plan.created_at))
                        : "date unavailable"}
                    </span>

                    <div style={styles.actionRow}>
                      <a
                        href={`/players/${player.Pt_number}/development/edit/${plan.id}`}
                        style={styles.secondaryButton}
                      >
                        Edit Plan
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
<DevelopmentHistory history={history} />
        <footer style={styles.footer}>
          <span>TEAMWORK</span>
          <span>•</span>
          <span>RESPECT</span>
          <span>•</span>
          <span>ENJOYMENT</span>
          <span>•</span>
          <span>DISCIPLINE</span>
          <span>•</span>
          <span>SPORTSMANSHIP</span>
        </footer>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "30px 16px 50px",
    background:
      "linear-gradient(135deg, #03152d 0%, #082a59 55%, #020b18 100%)",
    color: "#ffffff",
  },

  container: {
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
  },

  backLink: {
    display: "inline-block",
    marginBottom: "20px",
    color: "#f5b800",
    fontWeight: "800",
    textDecoration: "none",
  },

  header: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "24px",
    padding: "26px",
    border: "1px solid rgba(245, 184, 0, 0.45)",
    borderBottom: "4px solid #f5b800",
    borderRadius: "18px",
    background:
      "linear-gradient(100deg, rgba(245,184,0,0.14), rgba(5,25,52,0.95) 45%)",
    boxShadow: "0 18px 45px rgba(0,0,0,0.28)",
  },

  eyebrow: {
    margin: "0 0 6px",
    color: "#f5b800",
    fontSize: "13px",
    fontWeight: "900",
    letterSpacing: "1.8px",
  },

  heading: {
    margin: "0",
    fontSize: "clamp(30px, 6vw, 48px)",
    lineHeight: "1.05",
  },

  subheading: {
    margin: "9px 0 0",
    color: "#cbd5e1",
    fontSize: "17px",
    fontWeight: "700",
  },

  newPlanButton: {
    display: "inline-block",
    padding: "14px 20px",
    borderRadius: "11px",
    background: "#f5b800",
    color: "#071426",
    fontWeight: "900",
    textDecoration: "none",
    boxShadow: "0 8px 20px rgba(245,184,0,0.2)",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "14px",
    marginBottom: "34px",
  },

  summaryCard: {
    display: "grid",
    gap: "8px",
    padding: "18px",
    border: "1px solid rgba(148,163,184,0.24)",
    borderRadius: "14px",
    background: "rgba(4,20,42,0.88)",
  },

  summaryLabel: {
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },

  summaryNumber: {
    color: "#f5b800",
    fontSize: "32px",
    lineHeight: "1",
  },

  sectionHeadingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "end",
    marginBottom: "16px",
  },

  sectionHeading: {
    margin: "0",
    fontSize: "clamp(25px, 5vw, 36px)",
  },

  planGrid: {
    display: "grid",
    gap: "20px",
  },

  planCard: {
    padding: "24px",
    border: "1px solid rgba(245,184,0,0.4)",
    borderRadius: "16px",
    background:
      "linear-gradient(145deg, rgba(7,31,63,0.98), rgba(3,17,36,0.98))",
    boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
  },

  planTopRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
  },

  categoryArea: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  categoryIcon: {
    display: "grid",
    placeItems: "center",
    width: "48px",
    height: "48px",
    flexShrink: "0",
    borderRadius: "12px",
    background: "rgba(245,184,0,0.15)",
    fontSize: "24px",
  },

  priorityNumber: {
    display: "block",
    marginBottom: "3px",
    color: "#f5b800",
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "1.3px",
  },

  categoryHeading: {
    margin: "0",
    fontSize: "24px",
    textTransform: "uppercase",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "900",
  },

  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  },

  divider: {
    height: "1px",
    margin: "20px 0",
    background: "rgba(148,163,184,0.24)",
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "22px",
  },

  smallLabel: {
    display: "block",
    marginBottom: "8px",
    color: "#f5b800",
    fontSize: "12px",
    fontWeight: "900",
    letterSpacing: "1px",
  },

  targetText: {
    margin: "0",
    fontSize: "19px",
    fontWeight: "800",
    lineHeight: "1.45",
  },

  reviewDate: {
    margin: "0",
    color: "#e2e8f0",
    fontSize: "16px",
    fontWeight: "700",
  },

  progressSection: {
    marginTop: "24px",
  },

  progressHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  progressPercentage: {
    color: "#ffffff",
    fontSize: "20px",
  },

  progressTrack: {
    width: "100%",
    height: "14px",
    overflow: "hidden",
    borderRadius: "999px",
    background: "#d8dee7",
  },

  progressFill: {
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #f5b800, #ffd84d)",
  },

  coachNotesSection: {
    marginTop: "24px",
    padding: "18px",
    borderLeft: "4px solid #f5b800",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.055)",
  },

  coachNotes: {
    margin: "0",
    color: "#e2e8f0",
    fontSize: "16px",
    lineHeight: "1.65",
    whiteSpace: "pre-wrap",
  },

  cardFooter: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginTop: "22px",
    paddingTop: "18px",
    borderTop: "1px solid rgba(148,163,184,0.2)",
  },

  createdText: {
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: "700",
  },

  actionRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  secondaryButton: {
    display: "inline-block",
    padding: "10px 15px",
    border: "1px solid #f5b800",
    borderRadius: "9px",
    color: "#f5b800",
    fontSize: "14px",
    fontWeight: "900",
    textDecoration: "none",
  },

  emptyCard: {
    padding: "55px 25px",
    border: "1px dashed rgba(245,184,0,0.55)",
    borderRadius: "16px",
    background: "rgba(4,20,42,0.85)",
    textAlign: "center",
  },

  emptyIcon: {
    marginBottom: "10px",
    fontSize: "46px",
  },

  emptyHeading: {
    margin: "0 0 8px",
  },

  emptyText: {
    margin: "0 0 22px",
    color: "#cbd5e1",
  },

  notFoundCard: {
    width: "100%",
    maxWidth: "650px",
    margin: "50px auto",
    padding: "30px",
    borderRadius: "16px",
    background: "#071f3f",
    textAlign: "center",
  },

  notFoundHeading: {
    marginTop: "0",
  },

  footer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "10px",
    marginTop: "36px",
    padding: "17px",
    borderTop: "3px solid #f5b800",
    color: "#f5b800",
    fontSize: "12px",
    fontWeight: "900",
    letterSpacing: "0.7px",
  },
};