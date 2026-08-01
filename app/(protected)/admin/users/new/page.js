"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ROLE_OPTIONS = [
  {
    value: "super_admin",
    label: "Super Admin",
    icon: "👑",
    description: "Full access across the entire Boar Pack Track platform.",
  },
  {
    value: "club_admin",
    label: "Club Admin",
    icon: "🏛️",
    description: "Manages users, squads and settings for their own club.",
  },
  {
    value: "chairman",
    label: "Chairman",
    icon: "🤝",
    description: "Senior club administrator with access across their club.",
  },
  {
    value: "coaching_coordinator",
    label: "Coaching Coordinator",
    icon: "📋",
    description: "Oversees coaches, squads and player development.",
  },
  {
    value: "safeguarding_officer",
    label: "Safeguarding Officer",
    icon: "🛡️",
    description: "Manages safeguarding access and welfare information.",
  },
  {
    value: "head_coach",
    label: "Head Coach",
    icon: "🧢",
    description: "Leads an assigned squad and manages its players.",
  },
  {
    value: "assistant_coach",
    label: "Assistant Coach",
    icon: "🏉",
    description: "Supports the Head Coach within an assigned squad.",
  },
  {
    value: "parent",
    label: "Parent",
    icon: "👨‍👩‍👦",
    description: "Views only the children linked to their account.",
  },
];

const COACH_ROLES = ["head_coach", "assistant_coach"];

const INITIAL_FORM = {
  full_name: "",
  email: "",
  phone: "",
  role: "",
  club_id: "",
  squad_id: "",
};

export default function AddUserPage() {
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [squads, setSquads] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSquads, setLoadingSquads] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedRole = useMemo(
    () => ROLE_OPTIONS.find((option) => option.value === form.role),
    [form.role]
  );

  const isSuperAdmin = profile?.role === "super_admin";
  const isCoachRole = COACH_ROLES.includes(form.role);

  useEffect(() => {
    async function loadPage() {
      setLoadingPage(true);
      setPageError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("id, full_name, role, club_id, is_active")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profileData) {
        console.error("Add User profile error:", profileError);
        setPageError("Your account profile could not be loaded.");
        setLoadingPage(false);
        return;
      }

      if (profileData.is_active === false) {
        setPageError("Your account is inactive.");
        setLoadingPage(false);
        return;
      }

      const allowedCreators = ["super_admin", "club_admin", "chairman"];

      if (!allowedCreators.includes(profileData.role)) {
        router.replace("/dashboard");
        return;
      }

      setProfile(profileData);

      if (profileData.role === "super_admin") {
        const { data: clubData, error: clubError } = await supabase
          .from("clubs")
          .select(
            "id, Name, short_name, logo_url, primary_colour, secondary_colour, is_active, is_active, demo_club"
          )
          .order("Name", { ascending: true });

        if (clubError) {
          console.error("Club loading error:", clubError);
          setPageError("The club list could not be loaded.");
          setLoadingPage(false);
          return;
        }

        const is_activeClubs = (clubData || []).filter(
          (club) => club.is_active !== false && club.is_active !== false
        );

        setClubs(is_activeClubs);
      } else {
        if (!profileData.club_id) {
          setPageError("Your account is not assigned to a club.");
          setLoadingPage(false);
          return;
        }

        const { data: clubData, error: clubError } = await supabase
          .from("clubs")
          .select(
            "id, Name, short_name, logo_url, primary_colour, secondary_colour, is_active, is_active, demo_club"
          )
          .eq("id", profileData.club_id)
          .maybeSingle();

        if (clubError || !clubData) {
          console.error("Assigned club loading error:", clubError);
          setPageError("Your assigned club could not be loaded.");
          setLoadingPage(false);
          return;
        }

        setClubs([clubData]);

        setForm((current) => ({
          ...current,
          club_id: String(profileData.club_id),
        }));
      }

      setLoadingPage(false);
    }

    loadPage();
  }, [router]);

  useEffect(() => {
    async function loadSquads() {
      if (!form.club_id || !isCoachRole) {
        setSquads([]);
        return;
      }

      setLoadingSquads(true);
      setFormError("");

      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("club_id", Number(form.club_id))
        .order("id", { ascending: true });

      if (error) {
        console.error("Squad loading error:", error);
        setSquads([]);
        setFormError(
          "The squads for this club could not be loaded. Please check the teams table."
        );
        setLoadingSquads(false);
        return;
      }

      setSquads(data || []);
      setLoadingSquads(false);
    }

    loadSquads();
  }, [form.club_id, isCoachRole]);

  function updateField(event) {
    const { name, value } = event.target;

    setFormError("");
    setSuccessMessage("");

    setForm((current) => {
      const updated = {
        ...current,
        [name]: value,
      };

      if (name === "role" && !COACH_ROLES.includes(value)) {
        updated.squad_id = "";
      }

      if (name === "club_id") {
        updated.squad_id = "";
      }

      if (name === "role" && value === "super_admin") {
        updated.club_id = "";
        updated.squad_id = "";
      }

      return updated;
    });
  }

  function getSquadName(squad) {
    return (
      squad.name ||
      squad.Name ||
      squad.squad_name ||
      squad.team_name ||
      squad.age_group ||
      `Squad ${squad.id}`
    );
  }

  function validateForm() {
    if (!form.full_name.trim()) {
      return "Please enter the user's full name.";
    }

    if (!form.email.trim() || !form.email.includes("@")) {
      return "Please enter a valid email address.";
    }

    if (!form.role) {
      return "Please select a role.";
    }

    if (form.role !== "super_admin" && !form.club_id) {
      return "Please select a club.";
    }

    if (isCoachRole && !form.squad_id) {
      return "Please assign this coach to a squad.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error(
          "Your login session has expired. Please log in again."
        );
      }

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          role: form.role,
          club_id:
            form.role === "super_admin"
              ? null
              : Number(form.club_id),
          squad_id: isCoachRole
            ? Number(form.squad_id)
            : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "The user could not be created."
        );
      }

      setSuccessMessage(
        result.message ||
          "User created successfully and invitation email sent."
      );

      setForm((current) => ({
        ...INITIAL_FORM,
        club_id: isSuperAdmin ? "" : current.club_id,
      }));

      setSquads([]);
    } catch (error) {
      console.error("Create user form error:", error);

      setFormError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingPage) {
    return (
      <main style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingSpinner}>🏉</div>
          <h2 style={styles.loadingTitle}>Preparing Add User</h2>
          <p style={styles.loadingText}>
            Loading clubs, roles and permissions...
          </p>
        </div>
      </main>
    );
  }

  if (pageError) {
    return (
      <main style={styles.page}>
        <div style={styles.errorPageCard}>
          <span style={styles.errorPageIcon}>⚠️</span>
          <h1 style={styles.errorPageTitle}>Unable to open Add User</h1>
          <p style={styles.errorPageText}>{pageError}</p>

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => router.push("/dashboard")}
          >
            ← Return to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.container}>
        <header style={styles.header}>
          <button
            type="button"
            style={styles.backButton}
            onClick={() => router.push("/dashboard")}
          >
            ← Dashboard
          </button>

          <div style={styles.headerContent}>
            <div>
              <p style={styles.eyebrow}>BOAR PACK TRACK</p>
              <h1 style={styles.title}>Add User</h1>
              <p style={styles.subtitle}>
                Create a secure account and assign the correct club,
                role and squad access.
              </p>
            </div>

            <div style={styles.creatorBadge}>
              <span style={styles.creatorBadgeIcon}>👤</span>

              <span style={styles.creatorBadgeText}>
                <strong>{profile?.full_name || "Administrator"}</strong>
                <span>
                  {(profile?.role || "")
                    .replaceAll("_", " ")
                    .toUpperCase()}
                </span>
              </span>
            </div>
          </div>
        </header>

        <section style={styles.contentGrid}>
          <form style={styles.formCard} onSubmit={handleSubmit}>
            <div style={styles.sectionHeading}>
              <span style={styles.sectionNumber}>1</span>

              <div>
                <h2 style={styles.sectionTitle}>Account details</h2>
                <p style={styles.sectionText}>
                  Enter the user's personal and contact information.
                </p>
              </div>
            </div>

            <div style={styles.twoColumnGrid}>
              <label style={styles.fieldGroup}>
                <span style={styles.label}>
                  Full name <strong style={styles.required}>*</strong>
                </span>

                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={updateField}
                  placeholder="Example: David Smith"
                  style={styles.input}
                  autoComplete="name"
                  disabled={submitting}
                />
              </label>

              <label style={styles.fieldGroup}>
                <span style={styles.label}>
                  Email address <strong style={styles.required}>*</strong>
                </span>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={updateField}
                  placeholder="name@example.com"
                  style={styles.input}
                  autoComplete="email"
                  disabled={submitting}
                />
              </label>
            </div>

            <label style={styles.fieldGroup}>
              <span style={styles.label}>Phone number</span>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={updateField}
                placeholder="Optional"
                style={styles.input}
                autoComplete="tel"
                disabled={submitting}
              />
            </label>

            <div style={styles.divider} />

            <div style={styles.sectionHeading}>
              <span style={styles.sectionNumber}>2</span>

              <div>
                <h2 style={styles.sectionTitle}>Role and access</h2>
                <p style={styles.sectionText}>
                  Choose what this person is allowed to access.
                </p>
              </div>
            </div>

            <label style={styles.fieldGroup}>
              <span style={styles.label}>
                User role <strong style={styles.required}>*</strong>
              </span>

              <select
                name="role"
                value={form.role}
                onChange={updateField}
                style={styles.select}
                disabled={submitting}
              >
                <option value="">Select a role...</option>

                {ROLE_OPTIONS.map((roleOption) => (
                  <option
                    key={roleOption.value}
                    value={roleOption.value}
                  >
                    {roleOption.label}
                  </option>
                ))}
              </select>
            </label>

            {selectedRole && (
              <div style={styles.rolePreview}>
                <span style={styles.rolePreviewIcon}>
                  {selectedRole.icon}
                </span>

                <div style={styles.rolePreviewContent}>
                  <strong style={styles.rolePreviewTitle}>
                    {selectedRole.label}
                  </strong>

                  <span style={styles.rolePreviewText}>
                    {selectedRole.description}
                  </span>
                </div>
              </div>
            )}
                        {form.role !== "super_admin" && (
              <label style={styles.fieldGroup}>
                <span style={styles.label}>
                  Club <strong style={styles.required}>*</strong>
                </span>

                <select
                  name="club_id"
                  value={form.club_id}
                  onChange={updateField}
                  style={styles.select}
                  disabled={submitting || !isSuperAdmin}
                >
                  <option value="">Select a club...</option>

                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.Name || club.short_name || `Club ${club.id}`}
                      {club.demo_club ? " — Demo Club" : ""}
                    </option>
                  ))}
                </select>

                {!isSuperAdmin && (
                  <span style={styles.fieldHelp}>
                    Your account can only create users for its assigned club.
                  </span>
                )}
              </label>
            )}

            {isCoachRole && (
              <label style={styles.fieldGroup}>
                <span style={styles.label}>
                  Assigned squad <strong style={styles.required}>*</strong>
                </span>

                <select
                  name="squad_id"
                  value={form.squad_id}
                  onChange={updateField}
                  style={styles.select}
                  disabled={
                    submitting ||
                    !form.club_id ||
                    loadingSquads
                  }
                >
                  <option value="">
                    {loadingSquads
                      ? "Loading squads..."
                      : "Select a squad..."}
                  </option>

                  {squads.map((squad) => (
                    <option key={squad.id} value={squad.id}>
                      {getSquadName(squad)}
                    </option>
                  ))}
                </select>

                {!loadingSquads &&
                  form.club_id &&
                  squads.length === 0 && (
                    <span style={styles.warningHelp}>
                      No squads were found for this club.
                    </span>
                  )}
              </label>
            )}

            {form.role === "parent" && (
              <div style={styles.parentNotice}>
                <span style={styles.parentNoticeIcon}>👨‍👩‍👦</span>

                <div>
                  <strong style={styles.parentNoticeTitle}>
                    Child linking comes next
                  </strong>

                  <p style={styles.parentNoticeText}>
                    This step creates the parent account. We will then link
                    the parent securely to one or more children.
                  </p>
                </div>
              </div>
            )}

            {formError && (
              <div style={styles.errorBanner}>
                <span style={styles.bannerIcon}>⚠️</span>
                <span>{formError}</span>
              </div>
            )}

            {successMessage && (
              <div style={styles.successBanner}>
                <span style={styles.bannerIcon}>✅</span>

                <div>
                  <strong style={styles.successTitle}>
                    User created successfully
                  </strong>

                  <p style={styles.successText}>{successMessage}</p>
                </div>
              </div>
            )}

            <div style={styles.formActions}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={() => router.push("/dashboard")}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={{
                  ...styles.submitButton,
                  ...(submitting ? styles.submitButtonDisabled : {}),
                }}
                disabled={submitting}
              >
                <span style={styles.submitButtonIcon}>
                  {submitting ? "⏳" : "✉️"}
                </span>

                {submitting
                  ? "Creating account..."
                  : "Create User & Send Invitation"}
              </button>
            </div>
          </form>

          <aside style={styles.sideColumn}>
            <section style={styles.summaryCard}>
              <div style={styles.summaryHeader}>
                <span style={styles.summaryIcon}>🔐</span>

                <div>
                  <p style={styles.summaryEyebrow}>SECURE ONBOARDING</p>
                  <h2 style={styles.summaryTitle}>Account summary</h2>
                </div>
              </div>

              <div style={styles.summaryList}>
                <SummaryRow
                  label="Name"
                  value={form.full_name || "Not entered"}
                />

                <SummaryRow
                  label="Email"
                  value={form.email || "Not entered"}
                />

                <SummaryRow
                  label="Role"
                  value={selectedRole?.label || "Not selected"}
                />

                <SummaryRow
                  label="Club"
                  value={
                    form.role === "super_admin"
                      ? "Platform-wide access"
                      : clubs.find(
                            (club) =>
                              String(club.id) ===
                              String(form.club_id)
                          )?.Name || "Not selected"
                  }
                />

                {isCoachRole && (
                  <SummaryRow
                    label="Squad"
                    value={
                      squads.find(
                        (squad) =>
                          String(squad.id) ===
                          String(form.squad_id)
                      )
                        ? getSquadName(
                            squads.find(
                              (squad) =>
                                String(squad.id) ===
                                String(form.squad_id)
                            )
                          )
                        : "Not selected"
                    }
                  />
                )}
              </div>
            </section>

            <section style={styles.processCard}>
              <p style={styles.processEyebrow}>WHAT HAPPENS NEXT?</p>

              <div style={styles.processStep}>
                <span style={styles.processNumber}>1</span>

                <div>
                  <strong style={styles.processTitle}>
                    Secure account created
                  </strong>

                  <p style={styles.processText}>
                    The account is created through the protected server API.
                  </p>
                </div>
              </div>

              <div style={styles.processStep}>
                <span style={styles.processNumber}>2</span>

                <div>
                  <strong style={styles.processTitle}>
                    Invitation email sent
                  </strong>

                  <p style={styles.processText}>
                    The new user receives a secure password setup link.
                  </p>
                </div>
              </div>

              <div style={styles.processStep}>
                <span style={styles.processNumber}>3</span>

                <div>
                  <strong style={styles.processTitle}>
                    GDPR checked at login
                  </strong>

                  <p style={styles.processText}>
                    Users who have not consented are sent through the GDPR
                    agreement before entering their dashboard.
                  </p>
                </div>
              </div>
            </section>

            <section style={styles.securityCard}>
              <span style={styles.securityIcon}>🛡️</span>

              <div>
                <strong style={styles.securityTitle}>
                  Service key protected
                </strong>

                <p style={styles.securityText}>
                  The Supabase service-role key stays on the server and is
                  never exposed to the browser.
                </p>
              </div>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div style={styles.summaryRow}>
      <span style={styles.summaryLabel}>{label}</span>
      <strong style={styles.summaryValue}>{value}</strong>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "34px 22px 110px",
    background:
      "radial-gradient(circle at top right, rgba(32,91,180,0.38), transparent 34%), linear-gradient(145deg, #061225 0%, #0b2857 52%, #061225 100%)",
    color: "#ffffff",
  },

  container: {
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",
  },

  loadingCard: {
    width: "min(500px, 100%)",
    margin: "110px auto",
    padding: "38px 28px",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "24px",
    background: "rgba(8,30,68,0.92)",
    textAlign: "center",
    boxShadow: "0 24px 60px rgba(0,0,0,0.34)",
  },

  loadingSpinner: {
    width: "66px",
    height: "66px",
    display: "grid",
    placeItems: "center",
    margin: "0 auto 18px",
    border: "2px solid rgba(245,184,0,0.5)",
    borderRadius: "50%",
    background: "rgba(245,184,0,0.12)",
    fontSize: "30px",
  },

  loadingTitle: {
    margin: "0 0 8px",
    color: "#ffffff",
    fontSize: "25px",
  },

  loadingText: {
    margin: 0,
    color: "#afbed3",
    lineHeight: "1.5",
  },

  errorPageCard: {
    width: "min(560px, 100%)",
    margin: "90px auto",
    padding: "38px 30px",
    border: "1px solid rgba(255,120,120,0.3)",
    borderRadius: "24px",
    background: "rgba(65,15,28,0.88)",
    textAlign: "center",
    boxShadow: "0 24px 60px rgba(0,0,0,0.34)",
  },

  errorPageIcon: {
    display: "block",
    marginBottom: "14px",
    fontSize: "38px",
  },

  errorPageTitle: {
    margin: "0 0 10px",
    fontSize: "27px",
  },

  errorPageText: {
    margin: "0 0 24px",
    color: "#f3c3c3",
    lineHeight: "1.6",
  },

  header: {
    marginBottom: "26px",
  },

  backButton: {
    marginBottom: "20px",
    padding: "10px 15px",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.06)",
    color: "#dbe6f5",
    fontWeight: "800",
    cursor: "pointer",
  },

  headerContent: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "22px",
  },

  eyebrow: {
    margin: "0 0 8px",
    color: "#f5b800",
    fontSize: "13px",
    fontWeight: "900",
    letterSpacing: "2px",
  },

  title: {
    margin: 0,
    fontSize: "clamp(38px, 6vw, 58px)",
    lineHeight: "1",
  },

  subtitle: {
    maxWidth: "700px",
    margin: "14px 0 0",
    color: "#bdcbe0",
    fontSize: "16px",
    lineHeight: "1.6",
  },

  creatorBadge: {
    minWidth: "230px",
    padding: "11px 14px",
    display: "flex",
    alignItems: "center",
    gap: "11px",
    border: "1px solid rgba(245,184,0,0.36)",
    borderRadius: "16px",
    background:
      "linear-gradient(145deg, rgba(20,62,125,0.95), rgba(7,28,65,0.96))",
    boxShadow: "0 14px 30px rgba(0,0,0,0.22)",
  },

  creatorBadgeIcon: {
    width: "42px",
    height: "42px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    borderRadius: "13px",
    background: "rgba(245,184,0,0.14)",
    fontSize: "20px",
  },

  creatorBadgeText: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    color: "#ffffff",
    fontSize: "13px",
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.65fr) minmax(280px, 0.85fr)",
    gap: "22px",
    alignItems: "start",
  },

  formCard: {
    padding: "28px",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "24px",
    background:
      "linear-gradient(155deg, rgba(16,49,101,0.97), rgba(6,24,57,0.98))",
    boxShadow: "0 22px 55px rgba(0,0,0,0.29)",
  },

  sectionHeading: {
    display: "flex",
    alignItems: "flex-start",
    gap: "13px",
    marginBottom: "20px",
  },

  sectionNumber: {
    width: "36px",
    height: "36px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    borderRadius: "12px",
    background: "#f5b800",
    color: "#071326",
    fontSize: "15px",
    fontWeight: "900",
  },

  sectionTitle: {
    margin: "0 0 4px",
    color: "#ffffff",
    fontSize: "21px",
  },

  sectionText: {
    margin: 0,
    color: "#aebed4",
    fontSize: "13px",
    lineHeight: "1.45",
  },

  twoColumnGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "16px",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "17px",
  },

  label: {
    color: "#e8eef7",
    fontSize: "13px",
    fontWeight: "800",
  },

  required: {
    color: "#f5b800",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "13px",
    outline: "none",
    background: "rgba(1,13,33,0.56)",
    color: "#ffffff",
    fontSize: "15px",
  },

  select: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "13px",
    outline: "none",
    background: "#0a234d",
    color: "#ffffff",
    fontSize: "15px",
    cursor: "pointer",
  },

  fieldHelp: {
    color: "#91a5c2",
    fontSize: "11px",
    lineHeight: "1.4",
  },

  warningHelp: {
    color: "#ffc86b",
    fontSize: "11px",
    fontWeight: "700",
    lineHeight: "1.4",
  },

  divider: {
    height: "1px",
    margin: "12px 0 25px",
    background: "rgba(255,255,255,0.1)",
  },

  rolePreview: {
    marginBottom: "18px",
    padding: "15px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    border: "1px solid rgba(245,184,0,0.25)",
    borderRadius: "15px",
    background: "rgba(245,184,0,0.08)",
  },

  rolePreviewIcon: {
    width: "44px",
    height: "44px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    borderRadius: "13px",
    background: "rgba(245,184,0,0.13)",
    fontSize: "21px",
  },

  rolePreviewContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  rolePreviewTitle: {
    color: "#f5b800",
    fontSize: "15px",
  },

  rolePreviewText: {
    color: "#c7d3e4",
    fontSize: "12px",
    lineHeight: "1.45",
  },

  parentNotice: {
    marginBottom: "18px",
    padding: "15px",
    display: "flex",
    alignItems: "flex-start",
    gap: "13px",
    border: "1px solid rgba(74,163,255,0.28)",
    borderRadius: "15px",
    background: "rgba(54,129,219,0.1)",
  },

  parentNoticeIcon: {
    fontSize: "23px",
  },

  parentNoticeTitle: {
    color: "#9dcaff",
    fontSize: "14px",
  },

  parentNoticeText: {
    margin: "5px 0 0",
    color: "#c6d5e8",
    fontSize: "12px",
    lineHeight: "1.5",
  },

  errorBanner: {
    marginTop: "8px",
    padding: "14px 15px",
    display: "flex",
    alignItems: "center",
    gap: "11px",
    border: "1px solid rgba(255,105,105,0.34)",
    borderRadius: "14px",
    background: "rgba(147,31,50,0.22)",
    color: "#ffd0d0",
    fontSize: "13px",
    fontWeight: "700",
  },

  successBanner: {
    marginTop: "8px",
    padding: "15px",
    display: "flex",
    alignItems: "flex-start",
    gap: "11px",
    border: "1px solid rgba(77,220,145,0.32)",
    borderRadius: "14px",
    background: "rgba(23,127,78,0.2)",
    color: "#d5ffea",
  },

  bannerIcon: {
    fontSize: "19px",
  },

  successTitle: {
    color: "#77e5ad",
    fontSize: "14px",
  },

  successText: {
    margin: "4px 0 0",
    color: "#d4f7e3",
    fontSize: "12px",
    lineHeight: "1.45",
  },

  formActions: {
    marginTop: "24px",
    display: "flex",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: "12px",
  },

  cancelButton: {
    padding: "13px 19px",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "13px",
    background: "rgba(255,255,255,0.06)",
    color: "#dce6f4",
    fontWeight: "900",
    cursor: "pointer",
  },

  secondaryButton: {
    padding: "13px 19px",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "13px",
    background: "rgba(255,255,255,0.08)",
    color: "#ffffff",
    fontWeight: "900",
    cursor: "pointer",
  },

  submitButton: {
    padding: "13px 20px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    border: "none",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #f5b800 0%, #ffd553 100%)",
    color: "#071326",
    fontSize: "14px",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow: "0 12px 26px rgba(245,184,0,0.22)",
  },

  submitButtonDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
  },

  submitButtonIcon: {
    fontSize: "17px",
  },

  sideColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "17px",
  },

  summaryCard: {
    padding: "21px",
    border: "1px solid rgba(245,184,0,0.24)",
    borderRadius: "21px",
    background:
      "linear-gradient(150deg, rgba(18,55,111,0.97), rgba(7,27,63,0.98))",
    boxShadow: "0 18px 42px rgba(0,0,0,0.24)",
  },

  summaryHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
  },

  summaryIcon: {
    width: "44px",
    height: "44px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    borderRadius: "13px",
    background: "rgba(245,184,0,0.13)",
    fontSize: "20px",
  },

  summaryEyebrow: {
    margin: "0 0 3px",
    color: "#f5b800",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "1.2px",
  },

  summaryTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "18px",
  },

  summaryList: {
    display: "flex",
    flexDirection: "column",
  },

  summaryRow: {
    padding: "12px 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "14px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },

  summaryLabel: {
    color: "#91a5c1",
    fontSize: "12px",
  },

  summaryValue: {
    maxWidth: "62%",
    overflowWrap: "anywhere",
    color: "#e9f0f8",
    fontSize: "12px",
    textAlign: "right",
  },

  processCard: {
    padding: "21px",
    border: "1px solid rgba(255,255,255,0.11)",
    borderRadius: "21px",
    background: "rgba(8,29,67,0.88)",
  },

  processEyebrow: {
    margin: "0 0 17px",
    color: "#f5b800",
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "1.2px",
  },

  processStep: {
    display: "flex",
    alignItems: "flex-start",
    gap: "11px",
    marginBottom: "16px",
  },

  processNumber: {
    width: "28px",
    height: "28px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    borderRadius: "9px",
    background: "rgba(245,184,0,0.14)",
    color: "#f5b800",
    fontSize: "12px",
    fontWeight: "900",
  },

  processTitle: {
    color: "#ffffff",
    fontSize: "13px",
  },

  processText: {
    margin: "4px 0 0",
    color: "#aabbd1",
    fontSize: "11px",
    lineHeight: "1.45",
  },

  securityCard: {
    padding: "18px",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    border: "1px solid rgba(77,220,145,0.23)",
    borderRadius: "18px",
    background: "rgba(22,117,74,0.12)",
  },

  securityIcon: {
    fontSize: "23px",
  },

  securityTitle: {
    color: "#7be3ae",
    fontSize: "13px",
  },

  securityText: {
    margin: "5px 0 0",
    color: "#c4ddcf",
    fontSize: "11px",
    lineHeight: "1.5",
  },
};