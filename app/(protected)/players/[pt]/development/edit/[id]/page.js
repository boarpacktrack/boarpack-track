"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../../../../lib/supabase";

const categories = [
  "Fitness",
  "Tackling",
  "Passing",
  "Kicking",
  "Handling",
  "Attack",
  "Defence",
  "Game Management",
  "Communication",
  "Leadership",
  "Discipline",
  "Position-Specific",
  "Other",
];

export default function EditDevelopmentPlan() {
  const params = useParams();
  const router = useRouter();

  const pt = params.pt;
  const id = params.id;

  const [category, setCategory] = useState("");
  const [target, setTarget] = useState("");
  const [coachNotes, setCoachNotes] = useState("");
  const [status, setStatus] = useState("Active");
  const [reviewDate, setReviewDate] = useState("");
  const [progress, setProgress] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!id || !pt) return;

    loadPlan();
  }, [id, pt]);

  async function loadPlan() {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data: plan, error: planError } = await supabase
        .from("player_development_plans")
        .select("*")
        .eq("id", id)
        .single();

      if (planError) {
        throw new Error(
          `Development plan could not be loaded: ${planError.message}`
        );
      }

      if (!plan) {
        throw new Error("Development plan not found.");
      }

      const { data: player, error: playerError } = await supabase
        .from("Players")
        .select("id, Pt_number, First_name, Last_name")
        .eq("id", plan.player_id)
        .single();

      if (playerError) {
        throw new Error(
          `Player information could not be loaded: ${playerError.message}`
        );
      }

      if (player?.Pt_number !== pt) {
        throw new Error(
          "This development plan does not belong to the selected player."
        );
      }

      setCategory(plan.category || "");
      setTarget(plan.target || "");
      setCoachNotes(plan.coach_notes || "");
      setStatus(plan.status || "Active");
      setReviewDate(plan.review_date || "");
      setProgress(Number(plan.progress) || 0);

      if (player) {
        setPlayerName(
          `${player.First_name || ""} ${player.Last_name || ""}`.trim()
        );
      }
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while loading the development plan."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!category) {
      setErrorMessage("Please choose a development category.");
      return;
    }

    if (!target.trim()) {
      setErrorMessage("Please enter a development target.");
      return;
    }

    if (!reviewDate) {
      setErrorMessage("Please choose a review date.");
      return;
    }

    try {
      setSaving(true);

      const { error: updateError } = await supabase
        .from("player_development_plans")
        .update({
          category,
          target: target.trim(),
          coach_notes: coachNotes.trim() || null,
          status,
          review_date: reviewDate,
          progress: Number(progress),
          summary: `${category}: ${target.trim()}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        throw new Error(
          `Development plan could not be updated: ${updateError.message}`
        );
      }

      setMessage("Development plan updated successfully.");

      setTimeout(() => {
        router.push(`/players/${pt}/development`);
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the plan."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <section style={styles.loadingCard}>
          <div style={styles.loadingIcon}>🐗</div>
          <h1 style={styles.loadingHeading}>Loading Development Plan</h1>
          <p style={styles.loadingText}>
            Retrieving the latest player information...
          </p>
        </section>
      </main>
    );
  }

  if (errorMessage && !category) {
    return (
      <main style={styles.page}>
        <section style={styles.loadingCard}>
          <h1 style={styles.loadingHeading}>Unable to Load Plan</h1>

          <div style={styles.errorMessage}>{errorMessage}</div>

          <button
            type="button"
            onClick={() => router.push(`/players/${pt}/development`)}
            style={styles.saveButton}
          >
            Return to Development Hub
          </button>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>BOAR PACK TRACK</p>

            <h1 style={styles.heading}>Edit Development Plan</h1>

            <p style={styles.playerName}>
              {playerName || `Player ${pt}`}
            </p>
          </div>

          <div style={styles.headerProgress}>
            <span style={styles.headerProgressLabel}>CURRENT PROGRESS</span>
            <strong style={styles.headerProgressNumber}>
              {progress}%
            </strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="category" style={styles.label}>
              Development Category
            </label>

            <select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              style={styles.input}
              disabled={saving}
            >
              <option value="">Choose a category</option>

              {categories.map((categoryOption) => (
                <option key={categoryOption} value={categoryOption}>
                  {categoryOption}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label htmlFor="target" style={styles.label}>
              Development Target
            </label>

            <input
              id="target"
              type="text"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              placeholder="Enter the player's development target"
              style={styles.input}
              disabled={saving}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="coachNotes" style={styles.label}>
              Actions and Coach Notes
            </label>

            <textarea
              id="coachNotes"
              value={coachNotes}
              onChange={(event) => setCoachNotes(event.target.value)}
              rows={7}
              placeholder="Enter coaching actions, support and review notes..."
              style={{
                ...styles.input,
                minHeight: "160px",
                resize: "vertical",
                lineHeight: "1.55",
              }}
              disabled={saving}
            />
          </div>

          <div style={styles.twoColumnGrid}>
            <div style={styles.field}>
              <label htmlFor="status" style={styles.label}>
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={(event) => {
                  const newStatus = event.target.value;

                  setStatus(newStatus);

                  if (newStatus === "Completed") {
                    setProgress(100);
                  }
                }}
                style={styles.input}
                disabled={saving}
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div style={styles.field}>
              <label htmlFor="reviewDate" style={styles.label}>
                Review Date
              </label>

              <input
                id="reviewDate"
                type="date"
                value={reviewDate}
                onChange={(event) => setReviewDate(event.target.value)}
                style={styles.input}
                disabled={saving}
              />
            </div>
          </div>

          <div style={styles.progressSection}>
            <div style={styles.progressHeading}>
              <div>
                <label htmlFor="progress" style={styles.label}>
                  Update Progress
                </label>

                <p style={styles.progressHelp}>
                  Move the slider as the player works towards the target.
                </p>
              </div>

              <strong style={styles.progressValue}>{progress}%</strong>
            </div>

            <input
              id="progress"
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(event) => {
                const newProgress = Number(event.target.value);

                setProgress(newProgress);

                if (newProgress < 100 && status === "Completed") {
                  setStatus("Active");
                }

                if (newProgress === 100) {
                  setStatus("Completed");
                }
              }}
              style={styles.slider}
              disabled={saving}
            />

            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${progress}%`,
                }}
              />
            </div>

            <div style={styles.progressScale}>
              <span>0%</span>
              <span>Developing</span>
              <span>50%</span>
              <span>On Track</span>
              <span>100%</span>
            </div>
          </div>

          {errorMessage && (
            <div style={styles.errorMessage}>{errorMessage}</div>
          )}

          {message && (
            <div style={styles.successMessage}>{message}</div>
          )}

          <div style={styles.buttonRow}>
            <button
              type="button"
              onClick={() =>
                router.push(`/players/${pt}/development`)
              }
              style={styles.cancelButton}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                ...styles.saveButton,
                opacity: saving ? 0.7 : 1,
                cursor: saving ? "not-allowed" : "pointer",
              }}
              disabled={saving}
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px 16px 50px",
    background:
      "linear-gradient(135deg, #03152d 0%, #082a59 55%, #020b18 100%)",
    color: "#ffffff",
  },

  card: {
    width: "100%",
    maxWidth: "900px",
    margin: "0 auto",
    overflow: "hidden",
    border: "1px solid rgba(245, 184, 0, 0.48)",
    borderRadius: "18px",
    background: "rgba(4, 20, 42, 0.97)",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
  },

  header: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "28px",
    borderBottom: "4px solid #f5b800",
    background:
      "linear-gradient(100deg, rgba(245,184,0,0.16), rgba(4,20,42,0.2))",
  },

  eyebrow: {
    margin: "0 0 7px",
    color: "#f5b800",
    fontSize: "13px",
    fontWeight: "900",
    letterSpacing: "2px",
  },

  heading: {
    margin: "0",
    fontSize: "clamp(28px, 5vw, 42px)",
    lineHeight: "1.08",
  },

  playerName: {
    margin: "9px 0 0",
    color: "#cbd5e1",
    fontSize: "17px",
    fontWeight: "800",
  },

  headerProgress: {
    minWidth: "135px",
    padding: "14px 18px",
    border: "1px solid rgba(245,184,0,0.45)",
    borderRadius: "13px",
    background: "rgba(0,0,0,0.18)",
    textAlign: "center",
  },

  headerProgressLabel: {
    display: "block",
    marginBottom: "4px",
    color: "#f5b800",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "1px",
  },

  headerProgressNumber: {
    fontSize: "30px",
    lineHeight: "1",
  },

  form: {
    display: "grid",
    gap: "25px",
    padding: "28px",
  },

  field: {
    display: "grid",
    gap: "9px",
  },

  label: {
    color: "#f5b800",
    fontSize: "15px",
    fontWeight: "900",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px",
    border: "1px solid #36506e",
    borderRadius: "10px",
    outline: "none",
    background: "#ffffff",
    color: "#071426",
    fontSize: "16px",
  },

  twoColumnGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },

  progressSection: {
    padding: "20px",
    border: "1px solid rgba(148,163,184,0.25)",
    borderRadius: "13px",
    background: "rgba(255,255,255,0.035)",
  },

  progressHeading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    marginBottom: "14px",
  },

  progressHelp: {
    margin: "4px 0 0",
    color: "#94a3b8",
    fontSize: "13px",
  },

  progressValue: {
    color: "#ffffff",
    fontSize: "28px",
  },

  slider: {
    width: "100%",
    marginBottom: "12px",
    accentColor: "#f5b800",
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
    transition: "width 0.2s ease",
  },

  progressScale: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    marginTop: "8px",
    color: "#94a3b8",
    fontSize: "10px",
    fontWeight: "800",
  },

  errorMessage: {
    padding: "14px 16px",
    border: "1px solid #ef4444",
    borderRadius: "10px",
    background: "rgba(127,29,29,0.45)",
    color: "#fecaca",
    fontWeight: "800",
  },

  successMessage: {
    padding: "14px 16px",
    border: "1px solid #22c55e",
    borderRadius: "10px",
    background: "rgba(20,83,45,0.55)",
    color: "#bbf7d0",
    fontWeight: "800",
  },

  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: "12px",
    paddingTop: "4px",
  },

  cancelButton: {
    padding: "13px 21px",
    border: "1px solid #64748b",
    borderRadius: "10px",
    background: "transparent",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "900",
    cursor: "pointer",
  },

  saveButton: {
    padding: "13px 23px",
    border: "none",
    borderRadius: "10px",
    background: "#f5b800",
    color: "#071426",
    fontSize: "15px",
    fontWeight: "900",
  },

  loadingCard: {
    width: "100%",
    maxWidth: "650px",
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
    margin: "0 0 9px",
  },

  loadingText: {
    margin: "0",
    color: "#cbd5e1",
  },
};