"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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

export default function EditDevelopmentPlan() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const pt = params.pt;
  const id = params.id;

  const requestedPriority = Number(searchParams.get("priority") || 0);

  const [priorityIndex, setPriorityIndex] = useState(requestedPriority);
  const [allPriorities, setAllPriorities] = useState([]);

  const [category, setCategory] = useState("");
  const [target, setTarget] = useState("");
  const [smartGoal, setSmartGoal] = useState("");
  const [actions, setActions] = useState("");
  const [status, setStatus] = useState("Active");
  const [progress, setProgress] = useState(0);

  const [reviewDate, setReviewDate] = useState("");
  const [coachName, setCoachName] = useState("");

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

      if (player) {
        setPlayerName(
          `${player.First_name || ""} ${player.Last_name || ""}`.trim()
        );
      }

      const priorities = Array.isArray(plan.development_priorities)
        ? plan.development_priorities
        : [];

      if (priorities.length > 0) {
        const safeIndex =
          requestedPriority >= 0 && requestedPriority < priorities.length
            ? requestedPriority
            : 0;

        setPriorityIndex(safeIndex);
        setAllPriorities(priorities);

        const selectedPriority = priorities[safeIndex] || {};

        setCategory(selectedPriority.category || "");
        setTarget(selectedPriority.target || "");
        setSmartGoal(selectedPriority.smart_goal || "");
        setActions(selectedPriority.actions || "");
        setProgress(Number(selectedPriority.progress) || 0);
        setStatus(selectedPriority.status || "Active");
      } else {
        setPriorityIndex(0);
        setAllPriorities([]);

        setCategory(plan.category || "");
        setTarget(plan.target || "");
        setSmartGoal("");
        setActions(plan.coach_notes || "");
        setProgress(Number(plan.progress) || 0);
        setStatus(plan.status || "Active");
      }

      setReviewDate(plan.next_review_date || plan.review_date || "");
      setCoachName(plan.coach_name || "");
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

    try {
      setSaving(true);

      let updateData = {
        updated_at: new Date().toISOString(),
      };

      if (allPriorities.length > 0) {
        const updatedPriorities = allPriorities.map((priority, index) => {
          if (index !== priorityIndex) {
            return priority;
          }

          return {
            ...priority,
            order: priority.order ?? index + 1,
            category,
            target: target.trim(),
            smart_goal: smartGoal.trim(),
            actions: actions.trim(),
            progress: Number(progress),
            status,
          };
        });

        const firstPriority = updatedPriorities[0] || {};

        updateData = {
          ...updateData,

          development_priorities: updatedPriorities,

          // Keep old fields compatible with the first priority.
          category: firstPriority.category || null,
          target: firstPriority.target || null,
          coach_notes: firstPriority.actions || null,
          progress: Number(firstPriority.progress) || 0,
          status: firstPriority.status || "Active",

          summary:
            firstPriority.category && firstPriority.target
              ? `${firstPriority.category}: ${firstPriority.target}`
              : null,

          review_date: reviewDate || null,
          next_review_date: reviewDate || null,
          coach_name: coachName.trim() || null,
        };
      } else {
        updateData = {
          ...updateData,

          category,
          target: target.trim(),
          coach_notes: actions.trim() || null,
          status,
          review_date: reviewDate || null,
          next_review_date: reviewDate || null,
          progress: Number(progress),
          coach_name: coachName.trim() || null,
          summary: `${category}: ${target.trim()}`,
        };
      }

      const { error: updateError } = await supabase
        .from("player_development_plans")
        .update(updateData)
        .eq("id", id);

      if (updateError) {
        throw new Error(
          `Development plan could not be updated: ${updateError.message}`
        );
      }

      setMessage("Development priority updated successfully.");

      setTimeout(() => {
        router.push(`/players/${pt}/development`);
        router.refresh();
      }, 700);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the priority."
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
          <h1 style={styles.loadingHeading}>Loading Development Priority</h1>
          <p style={styles.loadingText}>
            Retrieving the latest IPDP information...
          </p>
        </section>
      </main>
    );
  }

  if (errorMessage && !category) {
    return (
      <main style={styles.page}>
        <section style={styles.loadingCard}>
          <h1 style={styles.loadingHeading}>Unable to Load Priority</h1>

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

            <h1 style={styles.heading}>
              Edit Development Priority
            </h1>

            <p style={styles.playerName}>
              {playerName || `Player ${pt}`}
            </p>

            {allPriorities.length > 0 && (
              <p style={styles.priorityLabel}>
                Priority {priorityIndex + 1} of {allPriorities.length}
              </p>
            )}
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

            <textarea
              id="target"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              rows={3}
              placeholder="What does the player need to develop?"
              style={styles.textarea}
              disabled={saving}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="smartGoal" style={styles.label}>
              SMART Goal
            </label>

            <textarea
              id="smartGoal"
              value={smartGoal}
              onChange={(event) => setSmartGoal(event.target.value)}
              rows={4}
              placeholder="Enter the specific SMART goal for this priority..."
              style={styles.textarea}
              disabled={saving}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="actions" style={styles.label}>
              Actions & Coaching Support
            </label>

            <textarea
              id="actions"
              value={actions}
              onChange={(event) => setActions(event.target.value)}
              rows={6}
              placeholder="What actions, practice or coaching support are required?"
              style={styles.textarea}
              disabled={saving}
            />
          </div>

          <div style={styles.twoColumnGrid}>
            <div style={styles.field}>
              <label htmlFor="status" style={styles.label}>
                Priority Status
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
                Next Review Date
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
            <label htmlFor="coachName" style={styles.label}>
              Coach
            </label>

            <input
              id="coachName"
              type="text"
              value={coachName}
              onChange={(event) => setCoachName(event.target.value)}
              placeholder="Coach name"
              style={styles.input}
              disabled={saving}
            />
          </div>

          <div style={styles.progressSection}>
            <div style={styles.progressHeading}>
              <div>
                <label htmlFor="progress" style={styles.label}>
                  Update Progress
                </label>

                <p style={styles.progressHelp}>
                  Update this individual development priority as the player
                  progresses.
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
              {saving ? "Saving Changes..." : "Save Priority Changes"}
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
    maxWidth: "950px",
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

  priorityLabel: {
    display: "inline-block",
    margin: "10px 0 0",
    padding: "5px 10px",
    border: "1px solid rgba(245,184,0,0.4)",
    borderRadius: "999px",
    color: "#f5b800",
    fontSize: "12px",
    fontWeight: "900",
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

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px",
    border: "1px solid #36506e",
    borderRadius: "10px",
    outline: "none",
    background: "#ffffff",
    color: "#071426",
    fontSize: "16px",
    lineHeight: "1.55",
    resize: "vertical",
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
    cursor: "pointer",
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