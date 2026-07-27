"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

export default function CreateDevelopmentPlan() {
  const params = useParams();
  const router = useRouter();

  const pt = params.pt;

  const [category, setCategory] = useState("");
  const [target, setTarget] = useState("");
  const [coachNotes, setCoachNotes] = useState("");
  const [coachName, setCoachName] = useState("");
  const [status, setStatus] = useState("Active");
  const [reviewDate, setReviewDate] = useState("");
  const [progress, setProgress] = useState(0);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

      // Find the player's UUID using their PT number.
      const { data: player, error: playerError } = await supabase
        .from("Players")
        .select("id, Pt_number, First_name, Last_name")
        .eq("Pt_number", pt)
        .single();

      if (playerError) {
        throw new Error(
          `Player lookup failed: ${playerError.message}`
        );
      }

      if (!player) {
        throw new Error(`No player was found with PT number ${pt}.`);
      }

      // Save the new development plan.
      const { error: insertError } = await supabase
        .from("player_development_plans")
        .insert({
          player_id: player.id,
          category,
          target: target.trim(),
          coach_notes: coachNotes.trim() || null,
          coach_name: coachName.trim() || null,
          status,
          review_date: reviewDate,
          progress: Number(progress),
          summary: `${category}: ${target.trim()}`,
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        throw new Error(
          `Development plan could not be saved: ${insertError.message}`
        );
      }

      setMessage(
        `Development plan saved for ${player.First_name} ${player.Last_name}.`
      );

      setCategory("");
      setTarget("");
      setCoachNotes("");
      setStatus("Active");
      setReviewDate("");
      setProgress(0);

      setTimeout(() => {
        router.push(`/players/${pt}/development`);
        router.refresh();
      }, 1200);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the plan."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.header}>
          <p style={styles.eyebrow}>BOAR PACK TRACK</p>
          <h1 style={styles.heading}>Create Development Plan</h1>
          <p style={styles.playerNumber}>Player: {pt}</p>
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
              placeholder="e.g. Improve tackle completion to 80%"
              style={styles.input}
              disabled={saving}
            />
          </div>
<div style={styles.field}>
  <label htmlFor="coachName" style={styles.label}>
    Coach Name
  </label>

  <input
    id="coachName"
    type="text"
    value={coachName}
    onChange={(event) => setCoachName(event.target.value)}
    placeholder="Enter coach name"
    style={styles.input}
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
              rows={6}
              placeholder="Enter the actions, coaching points and support needed..."
              style={{
                ...styles.input,
                resize: "vertical",
                minHeight: "140px",
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
                onChange={(event) => setStatus(event.target.value)}
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

          <div style={styles.field}>
            <div style={styles.progressHeading}>
              <label htmlFor="progress" style={styles.label}>
                Current Progress
              </label>

              <strong style={styles.progressValue}>{progress}%</strong>
            </div>

            <input
              id="progress"
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(event) => setProgress(event.target.value)}
              style={styles.slider}
              disabled={saving}
            />

            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>

          {errorMessage && (
            <div style={styles.errorMessage}>{errorMessage}</div>
          )}

          {message && <div style={styles.successMessage}>{message}</div>}

          <div style={styles.buttonRow}>
            <button
              type="button"
              onClick={() => router.back()}
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
              {saving ? "Saving Plan..." : "Save Development Plan"}
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
    padding: "32px 16px",
    background:
      "linear-gradient(135deg, #03152d 0%, #071f3f 55%, #020b18 100%)",
    color: "#ffffff",
  },

  card: {
    width: "100%",
    maxWidth: "850px",
    margin: "0 auto",
    border: "1px solid rgba(255, 190, 0, 0.45)",
    borderRadius: "18px",
    overflow: "hidden",
    background: "rgba(4, 20, 42, 0.96)",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
  },

  header: {
    padding: "28px",
    borderBottom: "4px solid #f5b800",
    background:
      "linear-gradient(90deg, rgba(245,184,0,0.18), rgba(4,20,42,0))",
  },

  eyebrow: {
    margin: "0 0 6px",
    color: "#f5b800",
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "2px",
  },

  heading: {
    margin: "0",
    fontSize: "clamp(26px, 5vw, 40px)",
    lineHeight: "1.1",
  },

  playerNumber: {
    margin: "10px 0 0",
    color: "#cbd5e1",
    fontWeight: "700",
  },

  form: {
    display: "grid",
    gap: "24px",
    padding: "28px",
  },

  field: {
    display: "grid",
    gap: "9px",
  },

  label: {
    color: "#f5b800",
    fontSize: "15px",
    fontWeight: "800",
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

  progressHeading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
  },

  progressValue: {
    color: "#ffffff",
    fontSize: "20px",
  },

  slider: {
    width: "100%",
    accentColor: "#f5b800",
  },

  progressBar: {
    width: "100%",
    height: "12px",
    overflow: "hidden",
    borderRadius: "999px",
    background: "#d1d5db",
  },

  progressFill: {
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #f5b800, #ffd84d)",
    transition: "width 0.2s ease",
  },

  errorMessage: {
    padding: "13px 15px",
    border: "1px solid #ef4444",
    borderRadius: "10px",
    background: "rgba(127, 29, 29, 0.45)",
    color: "#fecaca",
    fontWeight: "700",
  },

  successMessage: {
    padding: "13px 15px",
    border: "1px solid #22c55e",
    borderRadius: "10px",
    background: "rgba(20, 83, 45, 0.55)",
    color: "#bbf7d0",
    fontWeight: "700",
  },

  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: "12px",
    paddingTop: "6px",
  },

  cancelButton: {
    padding: "13px 20px",
    border: "1px solid #64748b",
    borderRadius: "10px",
    background: "transparent",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "800",
    cursor: "pointer",
  },

  saveButton: {
    padding: "13px 22px",
    border: "none",
    borderRadius: "10px",
    background: "#f5b800",
    color: "#071426",
    fontSize: "15px",
    fontWeight: "900",
  },
};