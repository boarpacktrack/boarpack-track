"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const achievementOptions = [
  {
    type: "Player of the Match",
    icon: "⭐",
  },
  {
    type: "Coaches Player",
    icon: "💪",
  },
  {
    type: "Magic Moment",
    icon: "✨",
  },
  {
    type: "Most Improved",
    icon: "📈",
  },
  {
    type: "Captain Appointed",
    icon: "👑",
  },
  {
    type: "First Match",
    icon: "🏉",
  },
  {
    type: "First Try",
    icon: "🔥",
  },
  {
    type: "25 Caps",
    icon: "🎖️",
  },
  {
    type: "50 Caps",
    icon: "🎖️",
  },
  {
    type: "75 Caps",
    icon: "🎖️",
  },
  {
    type: "100 Caps",
    icon: "💯",
  },
  {
    type: "Training Milestone",
    icon: "🎯",
  },
  {
    type: "Other Achievement",
    icon: "🏆",
  },
];

export default function CreateAchievementPage() {
  const params = useParams();
  const router = useRouter();

  const pt = params?.pt;

  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [achievementType, setAchievementType] = useState("");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [achievementDate, setAchievementDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [season, setSeason] = useState("2026/27");
  const [icon, setIcon] = useState("🏆");
  const [isFeatured, setIsFeatured] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadPlayer() {
      if (!pt) return;

      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("Players")
        .select("*")
        .eq("Pt_number", pt)
        .single();

      if (error) {
        console.error("Player lookup error:", error);
        setErrorMessage("Player could not be loaded.");
        setLoading(false);
        return;
      }

      setPlayer(data);
      setLoading(false);
    }

    loadPlayer();
  }, [pt]);

  function handleAchievementChange(event) {
    const selectedType = event.target.value;

    setAchievementType(selectedType);

    const selectedAchievement = achievementOptions.find(
      (option) => option.type === selectedType
    );

    if (selectedAchievement) {
      setIcon(selectedAchievement.icon);

      if (!title.trim()) {
        setTitle(selectedAchievement.type);
      }
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!player) {
      setErrorMessage("Player details have not loaded.");
      return;
    }

    if (!achievementType) {
      setErrorMessage("Please choose an achievement type.");
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Please enter an achievement title.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("player_achievements").insert({
      player_id: player.id,
      achievement_type: achievementType,
      title: title.trim(),
      details: details.trim() || null,
      achievement_date: achievementDate,
      season: season.trim() || null,
      icon,
      is_featured: isFeatured,
    });

    if (error) {
      console.error("Achievement save error:", error);
      setErrorMessage(`Achievement could not be saved: ${error.message}`);
      setSaving(false);
      return;
    }

    setMessage("Achievement added successfully.");

    setTimeout(() => {
      router.push(`/players/${player.Pt_number}`);
      router.refresh();
    }, 800);
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <section style={styles.loadingCard}>
          <div style={styles.loadingIcon}>🏆</div>
          <h1 style={styles.loadingHeading}>Loading player...</h1>
        </section>
      </main>
    );
  }

  if (!player) {
    return (
      <main style={styles.page}>
        <section style={styles.loadingCard}>
          <div style={styles.loadingIcon}>⚠️</div>
          <h1 style={styles.loadingHeading}>Player not found</h1>

          <a href="/players" style={styles.backButton}>
            Return to players
          </a>
        </section>
      </main>
    );
  }

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

            <h1 style={styles.heading}>Add Achievement</h1>

            <p style={styles.playerName}>
              {player.First_name} {player.Last_name}
            </p>
          </div>

          <div style={styles.trophyBox}>
            <span style={styles.trophyIcon}>{icon}</span>
          </div>
        </header>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
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

              {achievementOptions.map((achievement) => (
                <option
                  key={achievement.type}
                  value={achievement.type}
                >
                  {achievement.icon} {achievement.type}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Achievement Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Player of the Match vs Cleckheaton"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Achievement Details
            </label>

            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="Add details about the achievement, performance or milestone..."
              rows="6"
              style={{
                ...styles.input,
                resize: "vertical",
                minHeight: "145px",
              }}
            />
          </div>

          <div style={styles.twoColumnGrid}>
            <div style={styles.field}>
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

            <div style={styles.field}>
              <label style={styles.label}>Season</label>

              <input
                type="text"
                value={season}
                onChange={(event) => setSeason(event.target.value)}
                placeholder="e.g. 2026/27"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.featuredBox}>
            <div>
              <p style={styles.featuredHeading}>
                Featured Achievement
              </p>

              <p style={styles.featuredText}>
                Featured achievements can later be highlighted on
                the player profile.
              </p>
            </div>

            <label style={styles.switchLabel}>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(event) =>
                  setIsFeatured(event.target.checked)
                }
                style={styles.checkbox}
              />

              <span>
                {isFeatured ? "Featured" : "Standard"}
              </span>
            </label>
          </div>

          {errorMessage && (
            <div style={styles.errorMessage}>
              {errorMessage}
            </div>
          )}

          {message && (
            <div style={styles.successMessage}>
              {message}
            </div>
          )}

          <div style={styles.buttonRow}>
            <button
              type="button"
              onClick={() =>
                router.push(`/players/${player.Pt_number}`)
              }
              style={styles.cancelButton}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.saveButton,
                opacity: saving ? 0.65 : 1,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving..." : "Add Achievement"}
            </button>
          </div>
        </form>

        <footer style={styles.footer}>
          TEAMWORK • RESPECT • ENJOYMENT • DISCIPLINE • SPORTSMANSHIP
        </footer>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "30px 16px 50px",
    color: "#ffffff",
    background:
      "linear-gradient(135deg, #03152d 0%, #082a59 55%, #020b18 100%)",
  },

  container: {
    width: "100%",
    maxWidth: "900px",
    margin: "0 auto",
  },

  backLink: {
    display: "inline-block",
    marginBottom: "18px",
    color: "#f5b800",
    fontWeight: "900",
    textDecoration: "none",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "22px",
    padding: "28px",
    border: "1px solid rgba(245,184,0,0.45)",
    borderBottom: "4px solid #f5b800",
    borderRadius: "18px",
    background:
      "linear-gradient(145deg, rgba(9,31,61,0.98), rgba(4,18,38,0.98))",
  },

  eyebrow: {
    margin: "0 0 7px",
    color: "#f5b800",
    fontSize: "13px",
    fontWeight: "900",
    letterSpacing: "1.5px",
  },

  heading: {
    margin: "0",
    fontSize: "clamp(34px, 6vw, 52px)",
    lineHeight: "1",
  },

  playerName: {
    margin: "10px 0 0",
    color: "#cbd5e1",
    fontSize: "18px",
    fontWeight: "800",
  },

  trophyBox: {
    display: "grid",
    placeItems: "center",
    minWidth: "105px",
    height: "95px",
    border: "1px solid rgba(245,184,0,0.45)",
    borderRadius: "15px",
    background: "rgba(255,255,255,0.04)",
  },

  trophyIcon: {
    fontSize: "48px",
  },

  form: {
    marginTop: "24px",
    padding: "28px",
    border: "1px solid rgba(245,184,0,0.35)",
    borderRadius: "18px",
    background: "rgba(4,20,42,0.96)",
    boxShadow: "0 20px 45px rgba(0,0,0,0.3)",
  },

  field: {
    marginBottom: "22px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    color: "#f5b800",
    fontSize: "14px",
    fontWeight: "900",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    border: "1px solid rgba(148,163,184,0.6)",
    borderRadius: "10px",
    background: "#f8fafc",
    color: "#0f172a",
    fontSize: "16px",
    outline: "none",
  },

  twoColumnGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "18px",
  },

  featuredBox: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
    marginTop: "4px",
    padding: "18px",
    border: "1px solid rgba(245,184,0,0.3)",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.04)",
  },

  featuredHeading: {
    margin: "0",
    color: "#ffffff",
    fontWeight: "900",
  },

  featuredText: {
    margin: "5px 0 0",
    color: "#94a3b8",
    fontSize: "13px",
  },

  switchLabel: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    color: "#f5b800",
    fontWeight: "900",
    cursor: "pointer",
  },

  checkbox: {
    width: "20px",
    height: "20px",
    cursor: "pointer",
  },

  errorMessage: {
    marginTop: "20px",
    padding: "14px",
    border: "1px solid #ef4444",
    borderRadius: "10px",
    background: "rgba(127,29,29,0.55)",
    color: "#fee2e2",
    fontWeight: "800",
  },

  successMessage: {
    marginTop: "20px",
    padding: "14px",
    border: "1px solid #22c55e",
    borderRadius: "10px",
    background: "rgba(20,83,45,0.55)",
    color: "#dcfce7",
    fontWeight: "800",
  },

  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "25px",
  },

  cancelButton: {
    padding: "13px 20px",
    border: "1px solid rgba(148,163,184,0.7)",
    borderRadius: "10px",
    background: "transparent",
    color: "#ffffff",
    fontWeight: "900",
    cursor: "pointer",
  },

  saveButton: {
    padding: "13px 22px",
    border: "none",
    borderRadius: "10px",
    background:
      "linear-gradient(135deg, #f5b800, #ffcc33)",
    color: "#08203f",
    fontWeight: "900",
  },

  loadingCard: {
    width: "100%",
    maxWidth: "600px",
    margin: "70px auto",
    padding: "38px",
    border: "1px solid rgba(245,184,0,0.45)",
    borderRadius: "17px",
    background: "rgba(4,20,42,0.96)",
    textAlign: "center",
  },

  loadingIcon: {
    marginBottom: "10px",
    fontSize: "44px",
  },

  loadingHeading: {
    margin: "0 0 20px",
  },

  backButton: {
    display: "inline-block",
    padding: "12px 18px",
    borderRadius: "10px",
    background: "#f5b800",
    color: "#08203f",
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