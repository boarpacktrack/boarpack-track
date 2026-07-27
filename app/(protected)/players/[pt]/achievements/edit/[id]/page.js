"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";

const achievementOptions = [
  { type: "Player of the Match", icon: "⭐" },
  { type: "Coaches Player", icon: "💪" },
  { type: "Magic Moment", icon: "✨" },
  { type: "Most Improved", icon: "📈" },
  { type: "Captain Appointed", icon: "👑" },
  { type: "First Match", icon: "🏉" },
  { type: "First Try", icon: "🔥" },
  { type: "25 Caps", icon: "🏅" },
  { type: "50 Caps", icon: "🏅" },
  { type: "75 Caps", icon: "🏅" },
  { type: "100 Caps", icon: "💯" },
  { type: "Training Milestone", icon: "🎯" },
  { type: "Other Achievement", icon: "🏆" },
];

export default function EditAchievementPage() {
  const params = useParams();
  const router = useRouter();

  const pt = params?.pt;
  const id = params?.id;

  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [achievementType, setAchievementType] = useState("");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [achievementDate, setAchievementDate] = useState("");
  const [season, setSeason] = useState("");
  const [icon, setIcon] = useState("🏆");
  const [isFeatured, setIsFeatured] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadPage() {
      if (!pt || !id) return;

      setLoading(true);
      setErrorMessage("");

      const { data: playerData, error: playerError } = await supabase
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
      setAchievementType(
        achievementData.achievement_type || ""
      );
      setTitle(achievementData.title || "");
      setDetails(achievementData.details || "");
      setAchievementDate(
        achievementData.achievement_date || ""
      );
      setSeason(achievementData.season || "");
      setIcon(achievementData.icon || "🏆");
      setIsFeatured(Boolean(achievementData.is_featured));

      setLoading(false);
    }

    loadPage();
  }, [pt, id]);

  function handleAchievementChange(event) {
    const selectedType = event.target.value;

    setAchievementType(selectedType);

    const selectedAchievement = achievementOptions.find(
      (option) => option.type === selectedType
    );

    if (selectedAchievement) {
      setIcon(selectedAchievement.icon);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!achievementType) {
      setErrorMessage("Please choose an achievement type.");
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Please enter an achievement title.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("player_achievements")
      .update({
        achievement_type: achievementType,
        title: title.trim(),
        details: details.trim() || null,
        achievement_date: achievementDate,
        season: season.trim() || null,
        icon,
        is_featured: isFeatured,
      })
      .eq("id", id)
      .eq("player_id", player.id);

    if (error) {
      console.error("Achievement update error:", error);
      setErrorMessage(
        `Achievement could not be updated: ${error.message}`
      );
      setSaving(false);
      return;
    }

    setMessage("Achievement updated successfully.");

    setTimeout(() => {
      router.push(`/players/${player.Pt_number}`);
      router.refresh();
    }, 800);
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <section style={styles.messageCard}>
          <div style={styles.largeIcon}>⏳</div>
          <h2>Loading achievement</h2>
          <p style={styles.mutedText}>
            Please wait while the achievement is loaded.
          </p>
        </section>
      </main>
    );
  }

  if (!player || errorMessage.includes("loaded")) {
    return (
      <main style={styles.page}>
        <section style={styles.messageCard}>
          <div style={styles.largeIcon}>⚠️</div>
          <h2>Achievement not found</h2>

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

        <section style={styles.headerCard}>
          <div>
            <p style={styles.eyebrow}>BOAR PACK TRACK</p>

            <h1 style={styles.mainHeading}>Edit Achievement</h1>

            <h2 style={styles.playerName}>
              {player.First_name} {player.Last_name}
            </h2>
          </div>

          <div style={styles.headerIcon}>{icon}</div>
        </section>

        <form onSubmit={handleSubmit} style={styles.formCard}>
          <label style={styles.label}>
            Achievement Type
          </label>

          <select
            value={achievementType}
            onChange={handleAchievementChange}
            style={styles.input}
            required
          >
            <option value="">Choose an achievement</option>

            {achievementOptions.map((option) => (
              <option key={option.type} value={option.type}>
                {option.icon} {option.type}
              </option>
            ))}
          </select>

          <label style={styles.label}>Achievement Title</label>

          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            style={styles.input}
            placeholder="e.g. Player of the Match vs Cleckheaton"
            required
          />

          <label style={styles.label}>
            Achievement Details
          </label>

          <textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            style={styles.textarea}
            placeholder="Add details about the performance or milestone..."
          />

          <div style={styles.twoColumnGrid}>
            <div>
              <label style={styles.label}>
                Achievement Date
              </label>

              <input
                type="date"
                value={achievementDate}
                onChange={(event) =>
                  setAchievementDate(event.target.value)
                }
                style={styles.input}
                required
              />
            </div>

            <div>
              <label style={styles.label}>Season</label>

              <input
                type="text"
                value={season}
                onChange={(event) =>
                  setSeason(event.target.value)
                }
                style={styles.input}
                placeholder="2026/27"
              />
            </div>
          </div>

          <label style={styles.featuredRow}>
            <div>
              <strong style={styles.featuredHeading}>
                Featured Achievement
              </strong>

              <p style={styles.featuredDescription}>
                Featured achievements are highlighted on the
                player profile.
              </p>
            </div>

            <div style={styles.checkboxArea}>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(event) =>
                  setIsFeatured(event.target.checked)
                }
                style={styles.checkbox}
              />

              <strong style={styles.goldText}>Featured</strong>
            </div>
          </label>

          {errorMessage && (
            <div style={styles.errorBox}>{errorMessage}</div>
          )}

          {message && (
            <div style={styles.successBox}>{message}</div>
          )}

          <div style={styles.actionRow}>
            <button
              type="button"
              onClick={() =>
                router.push(`/players/${player.Pt_number}`)
              }
              style={styles.cancelButton}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={styles.primaryButton}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        <footer style={styles.footer}>
          TEAMWORK&nbsp;&nbsp;•&nbsp;&nbsp;RESPECT&nbsp;&nbsp;•&nbsp;&nbsp;
          ENJOYMENT&nbsp;&nbsp;•&nbsp;&nbsp;DISCIPLINE&nbsp;&nbsp;•&nbsp;&nbsp;
          SPORTSMANSHIP
        </footer>
      </div>
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
    maxWidth: "950px",
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

  headerCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    padding: "30px",
    marginBottom: "22px",
    border: "1px solid rgba(245,184,0,0.45)",
    borderBottom: "5px solid #f5b800",
    borderRadius: "18px",
    background: "rgba(7,18,37,0.94)",
  },

  eyebrow: {
    margin: "0 0 8px",
    color: "#f5b800",
    fontWeight: "900",
    letterSpacing: "1.4px",
  },

  mainHeading: {
    margin: 0,
    fontSize: "clamp(36px, 7vw, 58px)",
    lineHeight: "1",
  },

  playerName: {
    margin: "12px 0 0",
    color: "#d8e0eb",
    fontSize: "21px",
  },

  headerIcon: {
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    width: "105px",
    height: "105px",
    border: "1px solid rgba(245,184,0,0.4)",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.03)",
    fontSize: "48px",
  },

  formCard: {
    padding: "30px",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "18px",
    background: "rgba(7,18,37,0.94)",
  },

  label: {
    display: "block",
    margin: "0 0 9px",
    color: "#f5b800",
    fontSize: "15px",
    fontWeight: "900",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    marginBottom: "22px",
    padding: "14px 16px",
    border: "1px solid #94a3b8",
    borderRadius: "11px",
    background: "#f8fafc",
    color: "#172033",
    fontSize: "16px",
  },

  textarea: {
    width: "100%",
    minHeight: "135px",
    resize: "vertical",
    boxSizing: "border-box",
    marginBottom: "22px",
    padding: "14px 16px",
    border: "1px solid #94a3b8",
    borderRadius: "11px",
    background: "#f8fafc",
    color: "#172033",
    fontSize: "16px",
  },

  twoColumnGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "15px",
  },

  featuredRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
    marginTop: "4px",
    padding: "17px",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "12px",
    cursor: "pointer",
  },

  featuredHeading: {
    display: "block",
    marginBottom: "4px",
  },

  featuredDescription: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "13px",
  },

  checkboxArea: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },

  checkbox: {
    width: "20px",
    height: "20px",
    cursor: "pointer",
  },

  goldText: {
    color: "#f5b800",
  },

  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "24px",
  },

  primaryButton: {
    display: "inline-block",
    padding: "12px 20px",
    border: "none",
    borderRadius: "10px",
    background: "#f5b800",
    color: "#163d75",
    fontSize: "15px",
    fontWeight: "900",
    textDecoration: "none",
    cursor: "pointer",
  },

  cancelButton: {
    padding: "12px 20px",
    border: "1px solid #94a3b8",
    borderRadius: "10px",
    background: "transparent",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "800",
    cursor: "pointer",
  },

  errorBox: {
    marginTop: "20px",
    padding: "13px",
    border: "1px solid #ef4444",
    borderRadius: "10px",
    background: "rgba(127,29,29,0.35)",
    color: "#fecaca",
    fontWeight: "700",
  },

  successBox: {
    marginTop: "20px",
    padding: "13px",
    border: "1px solid #22c55e",
    borderRadius: "10px",
    background: "rgba(20,83,45,0.4)",
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