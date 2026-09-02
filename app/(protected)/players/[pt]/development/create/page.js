"use client";

import { useEffect, useMemo, useState } from "react";
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

const statusOptions = ["Active", "Completed", "On Hold"];

function splitLines(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function createPriority(number) {
  return {
    id: number,
    category: "",
    target: "",
    smartGoal: "",
    actions: "",
    progress: 0,
    status: "Active",
  };
}

export default function CreateDevelopmentPlan() {
  const params = useParams();
  const router = useRouter();
  const pt = params.pt;

  const [player, setPlayer] = useState(null);
  const [loadingPlayer, setLoadingPlayer] = useState(true);

  const [season, setSeason] = useState("2026/27");
  const [squad, setSquad] = useState("");
  const [reviewPeriodStart, setReviewPeriodStart] = useState("");
  const [reviewPeriodEnd, setReviewPeriodEnd] = useState("");
  const [nextReviewDate, setNextReviewDate] = useState("");

  const [coachName, setCoachName] = useState("");
  const [overallRating, setOverallRating] = useState(0);
  const [potentialRating, setPotentialRating] = useState(0);
  const [overallStatus, setOverallStatus] = useState("On Track");

  const [strengthsText, setStrengthsText] = useState("");
  const [priorities, setPriorities] = useState([
    createPriority(1),
    createPriority(2),
    createPriority(3),
  ]);

  const [profileSummary, setProfileSummary] = useState("");
  const [playerAmbition, setPlayerAmbition] = useState("");
  const [preferredPosition, setPreferredPosition] = useState("");
  const [secondaryPosition, setSecondaryPosition] = useState("");

  const [coachNotes, setCoachNotes] = useState("");
  const [coachReview, setCoachReview] = useState("");

  const [reflectionProudOf, setReflectionProudOf] = useState("");
  const [reflectionImprove, setReflectionImprove] = useState("");
  const [reflectionSupport, setReflectionSupport] = useState("");

  const [parentFeedback, setParentFeedback] = useState("");

  const [recentFormSummary, setRecentFormSummary] = useState("");
  const [recentFormTrend, setRecentFormTrend] = useState("Steady");
  const [recentFormNotes, setRecentFormNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadPlayer() {
      try {
        setLoadingPlayer(true);

        const { data, error } = await supabase
          .from("Players")
          .select("*")
          .eq("Pt_number", pt)
          .single();

        if (error) {
          throw new Error(`Player lookup failed: ${error.message}`);
        }

        if (!mounted) return;

        setPlayer(data);

        setSquad(
          data?.squad ||
            data?.Squad ||
            data?.age_group ||
            data?.Age_group ||
            ""
        );

        setPreferredPosition(
          data?.Primary_position || data?.primary_position || ""
        );

        setSecondaryPosition(
          data?.Secondary_position || data?.secondary_position || ""
        );

        const existingPotential =
          data?.Potential ??
          data?.potential ??
          data?.potential_rating ??
          data?.potential_score;

        if (
          existingPotential !== undefined &&
          existingPotential !== null &&
          existingPotential !== ""
        ) {
          setPotentialRating(
            Math.max(0, Math.min(100, Number(existingPotential) || 0))
          );
        }
      } catch (error) {
        console.error(error);

        if (mounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "The player could not be loaded."
          );
        }
      } finally {
        if (mounted) setLoadingPlayer(false);
      }
    }

    loadPlayer();

    return () => {
      mounted = false;
    };
  }, [pt]);

  const completedPriorityCount = useMemo(
    () =>
      priorities.filter(
        (priority) =>
          priority.category.trim() ||
          priority.target.trim() ||
          priority.smartGoal.trim() ||
          priority.actions.trim()
      ).length,
    [priorities]
  );

  function updatePriority(index, field, value) {
    setPriorities((current) =>
      current.map((priority, priorityIndex) =>
        priorityIndex === index
          ? {
              ...priority,
              [field]:
                field === "progress" ? Number(value) : value,
            }
          : priority
      )
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!player) {
      setErrorMessage("The player has not loaded yet.");
      return;
    }

    if (!season.trim()) {
      setErrorMessage("Please enter the season.");
      return;
    }

    if (!squad.trim()) {
      setErrorMessage("Please enter the squad.");
      return;
    }

    if (!reviewPeriodStart || !reviewPeriodEnd) {
      setErrorMessage("Please enter the full review period.");
      return;
    }

    if (reviewPeriodEnd < reviewPeriodStart) {
      setErrorMessage("The review period end date must be after the start date.");
      return;
    }

    if (!nextReviewDate) {
      setErrorMessage("Please choose the next review date.");
      return;
    }

    const strengthItems = splitLines(strengthsText);

    if (strengthItems.length === 0) {
      setErrorMessage("Please record at least one player strength.");
      return;
    }

    const priorityItems = priorities
      .filter(
        (priority) =>
          priority.category.trim() ||
          priority.target.trim() ||
          priority.smartGoal.trim() ||
          priority.actions.trim()
      )
      .map((priority, index) => ({
        order: index + 1,
        category: priority.category.trim() || "Development",
        target: priority.target.trim(),
        smart_goal: priority.smartGoal.trim(),
        actions: priority.actions.trim(),
        progress: Number(priority.progress) || 0,
        status: priority.status,
      }));

    if (priorityItems.length === 0) {
      setErrorMessage("Please enter at least one development priority.");
      return;
    }

    if (
      priorityItems.some(
        (priority) => !priority.target || !priority.smart_goal
      )
    ) {
      setErrorMessage(
        "Each development priority being used needs a target and SMART goal."
      );
      return;
    }

    const firstPriority = priorityItems[0];
    const averageProgress = Math.round(
      priorityItems.reduce(
        (total, priority) => total + Number(priority.progress || 0),
        0
      ) / priorityItems.length
    );

    try {
      setSaving(true);

      const payload = {
        player_id: player.id,

        category: firstPriority.category,
        target: firstPriority.target,
        coach_notes: coachNotes.trim() || null,
        coach_name: coachName.trim() || null,
        status:
          overallStatus === "Complete"
            ? "Completed"
            : overallStatus === "Paused"
              ? "On Hold"
              : "Active",
        review_date: nextReviewDate,
        progress: averageProgress,
        summary: `${firstPriority.category}: ${firstPriority.target}`,
        overall_rating: Number(overallRating),
        potential_rating: Number(potentialRating),
        updated_at: new Date().toISOString(),

        season: season.trim(),
        squad: squad.trim(),
        review_period_start: reviewPeriodStart,
        review_period_end: reviewPeriodEnd,
        next_review_date: nextReviewDate,

        strengths: strengthItems,

        development_priorities: priorityItems,

        player_profile: {
          summary: profileSummary.trim() || null,
          ambition: playerAmbition.trim() || null,
          preferred_position: preferredPosition.trim() || null,
          secondary_position: secondaryPosition.trim() || null,
        },

        coach_review: coachReview.trim() || null,

        player_reflection: {
          proud_of: reflectionProudOf.trim() || null,
          improve_next: reflectionImprove.trim() || null,
          support_needed: reflectionSupport.trim() || null,
        },

        parent_feedback: parentFeedback.trim() || null,

        overall_status: overallStatus,

        recent_form: {
          summary: recentFormSummary.trim() || null,
          trend: recentFormTrend,
          notes: recentFormNotes.trim() || null,
        },
      };

      const { error: insertError } = await supabase
        .from("player_development_plans")
        .insert(payload);

      if (insertError) {
        throw new Error(
          `Development plan could not be saved: ${insertError.message}`
        );
      }

      setMessage(
        `Full IPDP saved for ${player.First_name} ${player.Last_name}.`
      );

      setTimeout(() => {
        router.push(`/players/${pt}/development`);
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the development plan."
      );
    } finally {
      setSaving(false);
    }
  }

  const playerName = player
    ? `${player.First_name || ""} ${player.Last_name || ""}`.trim()
    : `Player ${pt}`;
      return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.header}>
          <p style={styles.eyebrow}>BOAR PACK TRACK</p>
          <h1 style={styles.heading}>Create Full Player IPDP</h1>
          <p style={styles.playerNumber}>
            {loadingPlayer ? "Loading player..." : `${playerName} • ${pt}`}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <section style={styles.formSection}>
            <SectionHeading
              number="1"
              title="Plan Details"
              subtitle="Season, squad and review dates"
            />

            <div style={styles.twoColumnGrid}>
              <Field label="Season">
                <input
                  type="text"
                  value={season}
                  onChange={(event) => setSeason(event.target.value)}
                  placeholder="2026/27"
                  style={styles.input}
                  disabled={saving}
                />
              </Field>

              <Field label="Squad">
                <input
                  type="text"
                  value={squad}
                  onChange={(event) => setSquad(event.target.value)}
                  placeholder="U14s"
                  style={styles.input}
                  disabled={saving}
                />
              </Field>
            </div>

            <div style={styles.threeColumnGrid}>
              <Field label="Review Period Start">
                <input
                  type="date"
                  value={reviewPeriodStart}
                  onChange={(event) =>
                    setReviewPeriodStart(event.target.value)
                  }
                  style={styles.input}
                  disabled={saving}
                />
              </Field>

              <Field label="Review Period End">
                <input
                  type="date"
                  value={reviewPeriodEnd}
                  onChange={(event) =>
                    setReviewPeriodEnd(event.target.value)
                  }
                  style={styles.input}
                  disabled={saving}
                />
              </Field>

              <Field label="Next Review Date">
                <input
                  type="date"
                  value={nextReviewDate}
                  onChange={(event) =>
                    setNextReviewDate(event.target.value)
                  }
                  style={styles.input}
                  disabled={saving}
                />
              </Field>
            </div>

            <Field label="Coach Name">
              <input
                type="text"
                value={coachName}
                onChange={(event) => setCoachName(event.target.value)}
                placeholder="Enter coach name"
                style={styles.input}
                disabled={saving}
              />
            </Field>
          </section>

          <section style={styles.formSection}>
            <SectionHeading
              number="2"
              title="Development Snapshot"
              subtitle="Overall rating, potential and current status"
            />

            <div style={styles.threeColumnGrid}>
              <RatingSlider
                label="Overall Rating"
                value={overallRating}
                onChange={setOverallRating}
                disabled={saving}
              />

              <RatingSlider
                label="Potential Rating"
                value={potentialRating}
                onChange={setPotentialRating}
                disabled={saving}
              />

              <Field label="Overall Status">
                <select
                  value={overallStatus}
                  onChange={(event) =>
                    setOverallStatus(event.target.value)
                  }
                  style={styles.input}
                  disabled={saving}
                >
                  <option value="On Track">On Track</option>
                  <option value="Ahead of Plan">Ahead of Plan</option>
                  <option value="Needs Support">Needs Support</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Paused">Paused</option>
                  <option value="Complete">Complete</option>
                </select>
              </Field>
            </div>
          </section>

          <section style={styles.formSection}>
            <SectionHeading
              number="3"
              title="Player Profile"
              subtitle="A concise development profile for this review period"
            />

            <Field label="Profile Summary">
              <textarea
                value={profileSummary}
                onChange={(event) =>
                  setProfileSummary(event.target.value)
                }
                rows={4}
                placeholder="Briefly describe the player, their current stage of development and the main focus for this period."
                style={styles.textarea}
                disabled={saving}
              />
            </Field>

            <div style={styles.twoColumnGrid}>
              <Field label="Preferred Position">
                <input
                  type="text"
                  value={preferredPosition}
                  onChange={(event) =>
                    setPreferredPosition(event.target.value)
                  }
                  style={styles.input}
                  disabled={saving}
                />
              </Field>

              <Field label="Secondary Position">
                <input
                  type="text"
                  value={secondaryPosition}
                  onChange={(event) =>
                    setSecondaryPosition(event.target.value)
                  }
                  style={styles.input}
                  disabled={saving}
                />
              </Field>
            </div>

            <Field label="Player Ambition">
              <textarea
                value={playerAmbition}
                onChange={(event) =>
                  setPlayerAmbition(event.target.value)
                }
                rows={3}
                placeholder="What does the player want to achieve?"
                style={styles.textarea}
                disabled={saving}
              />
            </Field>
          </section>

          <section style={styles.formSection}>
            <SectionHeading
              number="4"
              title="Strengths"
              subtitle="One strength per line"
            />

            <Field label="Current Strengths">
              <textarea
                value={strengthsText}
                onChange={(event) =>
                  setStrengthsText(event.target.value)
                }
                rows={6}
                placeholder={
                  "Leadership\nPassing under pressure\nGame awareness"
                }
                style={styles.textarea}
                disabled={saving}
              />
            </Field>
          </section>

          <section style={styles.formSection}>
            <SectionHeading
              number="5"
              title="Development Priorities & SMART Goals"
              subtitle={`Complete up to 3 priorities • ${completedPriorityCount} currently in use`}
            />

            <div style={styles.priorityStack}>
              {priorities.map((priority, index) => (
                <div key={priority.id} style={styles.priorityCard}>
                  <div style={styles.priorityTitleRow}>
                    <strong style={styles.priorityTitle}>
                      Priority {index + 1}
                    </strong>

                    <span style={styles.priorityProgress}>
                      {priority.progress}%
                    </span>
                  </div>

                  <div style={styles.twoColumnGrid}>
                    <Field label="Category">
                      <select
                        value={priority.category}
                        onChange={(event) =>
                          updatePriority(
                            index,
                            "category",
                            event.target.value
                          )
                        }
                        style={styles.input}
                        disabled={saving}
                      >
                        <option value="">Choose a category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Priority Status">
                      <select
                        value={priority.status}
                        onChange={(event) =>
                          updatePriority(
                            index,
                            "status",
                            event.target.value
                          )
                        }
                        style={styles.input}
                        disabled={saving}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                                    <Field label="Development Target">
                    <input
                      type="text"
                      value={priority.target}
                      onChange={(event) =>
                        updatePriority(
                          index,
                          "target",
                          event.target.value
                        )
                      }
                      placeholder="What area are we developing?"
                      style={styles.input}
                      disabled={saving}
                    />
                  </Field>

                  <Field label="SMART Goal / Measure of Success">
                    <textarea
                      value={priority.smartGoal}
                      onChange={(event) =>
                        updatePriority(
                          index,
                          "smartGoal",
                          event.target.value
                        )
                      }
                      rows={3}
                      placeholder="Specific, measurable target with a clear outcome."
                      style={styles.textarea}
                      disabled={saving}
                    />
                  </Field>

                  <Field label="Coach Actions / Support">
                    <textarea
                      value={priority.actions}
                      onChange={(event) =>
                        updatePriority(
                          index,
                          "actions",
                          event.target.value
                        )
                      }
                      rows={3}
                      placeholder="What will the coach/player do to achieve this?"
                      style={styles.textarea}
                      disabled={saving}
                    />
                  </Field>

                  <div style={styles.field}>
                    <div style={styles.progressHeading}>
                      <label style={styles.label}>
                        Current Progress
                      </label>
                      <strong style={styles.progressValue}>
                        {priority.progress}%
                      </strong>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={priority.progress}
                      onChange={(event) =>
                        updatePriority(
                          index,
                          "progress",
                          event.target.value
                        )
                      }
                      style={styles.slider}
                      disabled={saving}
                    />

                    <div style={styles.progressBar}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${priority.progress}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={styles.formSection}>
            <SectionHeading
              number="6"
              title="Coach Review"
              subtitle="Actions, observations and formal review"
            />

            <Field label="Actions & Coach Notes">
              <textarea
                value={coachNotes}
                onChange={(event) =>
                  setCoachNotes(event.target.value)
                }
                rows={5}
                placeholder="Coaching points, support, agreed actions and session focus..."
                style={styles.textarea}
                disabled={saving}
              />
            </Field>

            <Field label="Coach Review">
              <textarea
                value={coachReview}
                onChange={(event) =>
                  setCoachReview(event.target.value)
                }
                rows={6}
                placeholder="Coach review of progress during this review period..."
                style={styles.textarea}
                disabled={saving}
              />
            </Field>
          </section>

          <section style={styles.formSection}>
            <SectionHeading
              number="7"
              title="Player Reflection"
              subtitle="The player's own voice"
            />

            <Field label="What are you most proud of?">
              <textarea
                value={reflectionProudOf}
                onChange={(event) =>
                  setReflectionProudOf(event.target.value)
                }
                rows={3}
                style={styles.textarea}
                disabled={saving}
              />
            </Field>

            <Field label="What do you want to improve next?">
              <textarea
                value={reflectionImprove}
                onChange={(event) =>
                  setReflectionImprove(event.target.value)
                }
                rows={3}
                style={styles.textarea}
                disabled={saving}
              />
            </Field>

            <Field label="What support would help you?">
              <textarea
                value={reflectionSupport}
                onChange={(event) =>
                  setReflectionSupport(event.target.value)
                }
                rows={3}
                style={styles.textarea}
                disabled={saving}
              />
            </Field>
          </section>

          <section style={styles.formSection}>
            <SectionHeading
              number="8"
              title="Recent Form"
              subtitle="Current trend and recent performance context"
            />

            <div style={styles.twoColumnGrid}>
              <Field label="Form Trend">
                <select
                  value={recentFormTrend}
                  onChange={(event) =>
                    setRecentFormTrend(event.target.value)
                  }
                  style={styles.input}
                  disabled={saving}
                >
                  <option value="Improving">Improving</option>
                  <option value="Steady">Steady</option>
                  <option value="Mixed">Mixed</option>
                  <option value="Needs Support">Needs Support</option>
                  <option value="Returning">Returning</option>
                </select>
              </Field>

              <Field label="Recent Form Summary">
                <input
                  type="text"
                  value={recentFormSummary}
                  onChange={(event) =>
                    setRecentFormSummary(event.target.value)
                  }
                  placeholder="e.g. Strong last 3 matches"
                  style={styles.input}
                  disabled={saving}
                />
              </Field>
            </div>

            <Field label="Recent Form Notes">
              <textarea
                value={recentFormNotes}
                onChange={(event) =>
                  setRecentFormNotes(event.target.value)
                }
                rows={4}
                placeholder="Recent match/training observations..."
                style={styles.textarea}
                disabled={saving}
              />
            </Field>
          </section>
                    <section style={styles.formSection}>
            <SectionHeading
              number="9"
              title="Parent Feedback"
              subtitle="Optional"
            />

            <Field label="Parent / Guardian Feedback">
              <textarea
                value={parentFeedback}
                onChange={(event) =>
                  setParentFeedback(event.target.value)
                }
                rows={4}
                placeholder="Optional feedback from parent or guardian..."
                style={styles.textarea}
                disabled={saving}
              />
            </Field>
          </section>

          {errorMessage && (
            <div style={styles.errorMessage}>{errorMessage}</div>
          )}

          {message && (
            <div style={styles.successMessage}>{message}</div>
          )}

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
                opacity: saving || loadingPlayer ? 0.7 : 1,
                cursor:
                  saving || loadingPlayer ? "not-allowed" : "pointer",
              }}
              disabled={saving || loadingPlayer}
            >
              {saving ? "Saving IPDP..." : "Save Full IPDP"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

function SectionHeading({ number, title, subtitle }) {
  return (
    <div style={styles.sectionHeading}>
      <div style={styles.sectionNumber}>{number}</div>

      <div>
        <h2 style={styles.sectionTitle}>{title}</h2>
        <p style={styles.sectionSubtitle}>{subtitle}</p>
      </div>
    </div>
  );
}

function RatingSlider({ label, value, onChange, disabled }) {
  return (
    <div style={styles.ratingCard}>
      <div style={styles.progressHeading}>
        <label style={styles.label}>{label}</label>
        <strong style={styles.ratingValue}>{value}</strong>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={styles.slider}
        disabled={disabled}
      />

      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px 16px 60px",
    background:
      "linear-gradient(135deg, #03152d 0%, #071f3f 55%, #020b18 100%)",
    color: "#ffffff",
  },

  card: {
    width: "100%",
    maxWidth: "1050px",
    margin: "0 auto",
    border: "1px solid rgba(255, 190, 0, 0.45)",
    borderRadius: "18px",
    overflow: "hidden",
    background: "rgba(4, 20, 42, 0.97)",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
  },

  header: {
    padding: "30px",
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
    fontSize: "clamp(28px, 5vw, 42px)",
    lineHeight: "1.1",
  },

  playerNumber: {
    margin: "10px 0 0",
    color: "#cbd5e1",
    fontWeight: "700",
  },

  form: {
    display: "grid",
    gap: "22px",
    padding: "28px",
  },

  formSection: {
    display: "grid",
    gap: "20px",
    padding: "22px",
    border: "1px solid rgba(148, 163, 184, 0.24)",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.035)",
  },

  sectionHeading: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    paddingBottom: "14px",
    borderBottom: "1px solid rgba(148, 163, 184, 0.22)",
  },

  sectionNumber: {
    display: "grid",
    placeItems: "center",
    width: "38px",
    height: "38px",
    flexShrink: 0,
    borderRadius: "10px",
    background: "#f5b800",
    color: "#071426",
    fontWeight: "1000",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "20px",
  },

  sectionSubtitle: {
    margin: "4px 0 0",
    color: "#9fb0c7",
    fontSize: "13px",
    fontWeight: "700",
  },
    field: {
    display: "grid",
    gap: "9px",
  },

  label: {
    color: "#f5b800",
    fontSize: "14px",
    fontWeight: "800",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    border: "1px solid #36506e",
    borderRadius: "10px",
    outline: "none",
    background: "#ffffff",
    color: "#071426",
    fontSize: "15px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    border: "1px solid #36506e",
    borderRadius: "10px",
    outline: "none",
    background: "#ffffff",
    color: "#071426",
    fontSize: "15px",
    lineHeight: "1.5",
    resize: "vertical",
  },

  twoColumnGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
  },

  threeColumnGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "18px",
  },

  ratingCard: {
    display: "grid",
    alignContent: "start",
    gap: "10px",
    padding: "14px",
    border: "1px solid rgba(245,184,0,0.25)",
    borderRadius: "11px",
    background: "rgba(0,0,0,0.15)",
  },

  ratingValue: {
    color: "#ffffff",
    fontSize: "25px",
  },

  priorityStack: {
    display: "grid",
    gap: "18px",
  },

  priorityCard: {
    display: "grid",
    gap: "16px",
    padding: "18px",
    border: "1px solid rgba(245,184,0,0.38)",
    borderRadius: "12px",
    background: "rgba(3, 21, 45, 0.92)",
  },

  priorityTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },

  priorityTitle: {
    color: "#ffffff",
    fontSize: "18px",
  },

  priorityProgress: {
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(245,184,0,0.16)",
    color: "#f5b800",
    fontWeight: "900",
  },

  progressHeading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
  },

  progressValue: {
    color: "#ffffff",
    fontSize: "18px",
  },

  slider: {
    width: "100%",
    accentColor: "#f5b800",
  },

  progressBar: {
    width: "100%",
    height: "11px",
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
    paddingTop: "4px",
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