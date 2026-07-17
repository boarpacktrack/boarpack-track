"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../../../lib/supabase";

export default function DeleteAchievementPage() {
  const params = useParams();
  const router = useRouter();

  const pt = params?.pt;
  const id = params?.id;

  const [player, setPlayer] = useState(null);
  const [achievement, setAchievement] = useState(null);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadPage() {
      if (!pt || !id) return;

      setLoading(true);
      setErrorMessage("");

      const { data: playerData, error: playerError } =
        await supabase
          .from("Players")
          .select("*")
          .eq("Pt_number", pt)
          .single();

      if (playerError || !playerData) {
        console.error("Player lookup error:", playerError);
        setErrorMessage("Player could not be loaded.");
        setLoading(false);
        return;
      }

      const { data: achievementData, error: achievementError } =
        await supabase
          .from("player_achievements")
          .select("*")
          .eq("id", id)
          .eq("player_id", playerData.id)
          .single();

      if (achievementError || !achievementData) {
        console.error(
          "Achievement lookup error:",
          achievementError
        );

        setErrorMessage("Achievement could not be loaded.");
        setLoading(false);
        return;
      }

      setPlayer(playerData);
      setAchievement(achievementData);
      setLoading(false);
    }

    loadPage();
  }, [pt, id]);

  async function handleDelete() {
    if (!player || !achievement) return;

    setDeleting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("player_achievements")
      .delete()
      .eq("id", achievement.id)
      .eq("player_id", player.id);

    if (error) {
      console.error("Achievement delete error:", error);

      setErrorMessage(
        `Achievement could not be deleted: ${error.message}`
      );

      setDeleting(false);
      return;
    }

    setSuccessMessage("Achievement deleted successfully.");

    setTimeout(() => {
      router.push(`/players/${player.Pt_number}`);
      router.refresh();
    }, 900);
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <section style={styles.messageCard}>
          <div style={styles.largeIcon}>⏳</div>

          <h2 style={styles.messageHeading}>
            Loading achievement
          </h2>

          <p style={styles.mutedText}>
            Please wait while the achievement is loaded.
          </p>
        </section>
      </main>
    );
  }

  if (!player || !achievement) {
    return (
      <main style={styles.page}>
        <section style={styles.messageCard}>
          <div style={styles.largeIcon}>⚠️</div>

          <h2 style={styles.messageHeading}>
            Achievement not found
          </h2>

          <p style={styles.errorText}>{errorMessage}</p>

          <a href={`/players/${pt}`} style={styles.primaryButton}>
            Return to player
          </a>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <a
          href={`/players/${player.Pt_number}`}
          style={styles.backLink}
        >
          ← Back to {player.First_name}
        </a>

        <section style={styles.warningCard}>
          <div style={styles.warningIcon}>🗑️</div>

          <p style={styles.eyebrow}>BOAR PACK TRACK</p>

          <h1 style={styles.mainHeading}>
            Delete Achievement?
          </h1>

          <p style={styles.warningText}>
            This will permanently remove the achievement from{" "}
            <strong>
              {player.First_name} {player.Last_name}
            </strong>
            ’s profile.
          </p>

          <p style={styles.permanentWarning}>
            This action cannot be undone.
          </p>
        </section>

        <section style={styles.achievementCard}>
          <div style={styles.achievementTopRow}>
            <div>
              <p style={styles.achievementType}>
                {achievement.achievement_type ||
                  "Achievement"}
              </p>

              <h2 style={styles.achievementTitle}>
                {achievement.icon || "🏆"}{" "}
                {achievement.title}
              </h2>
            </div>

            {achievement.is_featured && (
              <span style={styles.featuredBadge}>
                FEATURED
              </span>
            )}
          </div>

          {achievement.details && (
            <p style={styles.details}>
              {achievement.details}
            </p>
          )}

          <div style={styles.informationGrid}>
            <div style={styles.informationBox}>
              <span style={styles.informationLabel}>Player</span>

              <strong>
                {player.First_name} {player.Last_name}
              </strong>
            </div>

            <div style={styles.informationBox}>
              <span style={styles.informationLabel}>Date</span>

              <strong>
                {formatDate(achievement.achievement_date)}
              </strong>
            </div>

            <div style={styles.informationBox}>
              <span style={styles.informationLabel}>Season</span>

              <strong>
                {achievement.season || "Not recorded"}
              </strong>
            </div>
          </div>
        </section>

        {errorMessage && (
          <div style={styles.errorBox}>{errorMessage}</div>
        )}

        {successMessage && (
          <div style={styles.successBox}>
            {successMessage}
          </div>
        )}

        <div style={styles.actionRow}>
          <button
            type="button"
            onClick={() =>
              router.push(`/players/${player.Pt_number}`)
            }
            style={styles.cancelButton}
            disabled={deleting}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            style={{
              ...styles.deleteButton,
              opacity: deleting ? 0.65 : 1,
              cursor: deleting ? "not-allowed" : "pointer",
            }}
            disabled={deleting}
          >
            {deleting
              ? "Deleting..."
              : "Yes, Delete Achievement"}
          </button>
        </div>

        <footer style={styles.footer}>
          TEAMWORK&nbsp;&nbsp;•&nbsp;&nbsp;RESPECT&nbsp;&nbsp;•&nbsp;&nbsp;
          ENJOYMENT&nbsp;&nbsp;•&nbsp;&nbsp;DISCIPLINE&nbsp;&nbsp;•&nbsp;&nbsp;
          SPORTSMANSHIP
        </footer>
      </div>
    </main>
  );
}

function formatDate(dateValue) {
  if (!dateValue) return "Not recorded";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateValue}T12:00:00`));
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
    maxWidth: "850px",
    margin: "0 auto",
  },

  backLink: {
    display: "inline-block",
    marginBottom: "20px",
    color: "#f5b800",
    fontSize: "17px",
    fontWeight: "900",
    textDecoration: "none",
  },

  warningCard: {
    padding: "30px",
    marginBottom: "22px",
    border: "2px solid #ef4444",
    borderRadius: "18px",
    background: "rgba(69,10,10,0.72)",
    textAlign: "center",
    boxShadow: "0 0 25px rgba(239,68,68,0.18)",
  },

  warningIcon: {
    marginBottom: "10px",
    fontSize: "52px",
  },

  eyebrow: {
    margin: "0 0 8px",
    color: "#f5b800",
    fontWeight: "900",
    letterSpacing: "1.4px",
  },

  mainHeading: {
    margin: 0,
    fontSize: "clamp(34px, 7vw, 54px)",
    lineHeight: "1",
  },

  warningText: {
    margin: "20px auto 8px",
    maxWidth: "620px",
    color: "#f8fafc",
    fontSize: "17px",
    lineHeight: "1.55",
  },

  permanentWarning: {
    margin: "12px 0 0",
    color: "#fecaca",
    fontWeight: "900",
  },

  achievementCard: {
    padding: "25px",
    border: "1px solid rgba(245,184,0,0.45)",
    borderRadius: "16px",
    background: "rgba(7,18,37,0.95)",
  },

  achievementTopRow: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
  },

  achievementType: {
    margin: "0 0 7px",
    color: "#f5b800",
    fontSize: "13px",
    fontWeight: "900",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
  },

  achievementTitle: {
    margin: 0,
    fontSize: "27px",
  },

  featuredBadge: {
    padding: "7px 11px",
    borderRadius: "999px",
    background: "#f5b800",
    color: "#163d75",
    fontSize: "11px",
    fontWeight: "900",
  },

  details: {
    margin: "18px 0",
    color: "#e2e8f0",
    fontSize: "16px",
    lineHeight: "1.55",
  },

  informationGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "12px",
    marginTop: "20px",
  },

  informationBox: {
    padding: "14px",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.035)",
  },

  informationLabel: {
    display: "block",
    marginBottom: "5px",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "900",
    textTransform: "uppercase",
  },

  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "24px",
  },

  cancelButton: {
    padding: "13px 20px",
    border: "1px solid #94a3b8",
    borderRadius: "10px",
    background: "transparent",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "800",
    cursor: "pointer",
  },

  deleteButton: {
    padding: "13px 20px",
    border: "1px solid #ef4444",
    borderRadius: "10px",
    background: "#dc2626",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "900",
  },

  errorBox: {
    marginTop: "20px",
    padding: "14px",
    border: "1px solid #ef4444",
    borderRadius: "10px",
    background: "rgba(127,29,29,0.4)",
    color: "#fecaca",
    fontWeight: "700",
  },

  successBox: {
    marginTop: "20px",
    padding: "14px",
    border: "1px solid #22c55e",
    borderRadius: "10px",
    background: "rgba(20,83,45,0.45)",
    color: "#bbf7d0",
    fontWeight: "700",
  },

  messageCard: {
    width: "100%",
    maxWidth: "620px",
    boxSizing: "border-box",
    margin: "70px auto",
    padding: "38px",
    border: "1px solid rgba(245,184,0,0.45)",
    borderRadius: "17px",
    background: "rgba(4,20,42,0.96)",
    textAlign: "center",
  },

  messageHeading: {
    margin: "0 0 10px",
  },

  largeIcon: {
    marginBottom: "10px",
    fontSize: "44px",
  },

  mutedText: {
    color: "#cbd5e1",
  },

  errorText: {
    marginBottom: "22px",
    color: "#fecaca",
  },

  primaryButton: {
    display: "inline-block",
    padding: "12px 20px",
    borderRadius: "10px",
    background: "#f5b800",
    color: "#163d75",
    fontWeight: "900",
    textDecoration: "none",
  },

  footer: {
    marginTop: "35px",
    paddingTop: "17px",
    borderTop: "3px solid #f5b800",
    color: "#f5b800",
    fontSize: "12px",
    fontWeight: "900",
    letterSpacing: "0.7px",
    textAlign: "center",
  },
};