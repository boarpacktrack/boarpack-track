"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const profileMenuRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [linkedPlayer, setLinkedPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
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
        .select("full_name, role, club_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profileData) {
        console.error("Dashboard profile error:", profileError);
        setLoading(false);
        return;
      }

      setProfile(profileData);
const { data: assignmentData, error: assignmentError } = await supabase
  .from("user_assignments")
  .select(`
    id,
    role,
    club_id,
    squad_id,
    teams (
      id,
      team_name,
      age_group,
      season
    )
  `)
  .eq("user_id", user.id);

if (assignmentError) {
  console.error("Dashboard assignments error:", assignmentError);
  setAssignments([]);
} else {
  setAssignments(assignmentData || []);
}
      if (profileData.role === "parent") {
        const { data: linkData, error: linkError } = await supabase
          .from("parent_player_links")
          .select(`
            player_id,
            player:"Players" (
              id,
              "Pt_number",
              "First_name",
              "Last_name",
              "Photo",
              "Profile_image",
              "Primary_position",
              "Secondary_position",
              "Caps",
              "Overall",
              "Potential",
              "Attendance",
              "Current_focus",
              "Focus_progress"
            )
          `)
          .eq("parent_user_id", user.id)
          .limit(1)
          .maybeSingle();

        if (linkError) {
          console.error("Linked player error:", linkError);
        } else {
          setLinkedPlayer(linkData?.player || null);
        }
      }

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    }

    function handleEscapeKey(event) {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
      alert("There was a problem logging out. Please try again.");
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  function showComingSoon(featureName) {
    setProfileMenuOpen(false);
    alert(`${featureName} is coming soon.`);
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>🐗</div>
          Loading your dashboard...
        </div>
      </main>
    );
  }

  const role = profile?.role || "unknown";
  const isSuperAdmin = role === "super_admin";
  const isParent = role === "parent";
  const coachingAssignments = assignments.filter((assignment) =>
  [
    "head_coach",
    "assistant_coach",
    "coach",
    "team_manager",
  ].includes(assignment.role)
);

const clubAssignments = assignments.filter((assignment) =>
  [
    "chairman",
    "club_admin",
    "coaching_coordinator",
    "safeguarding_officer",
  ].includes(assignment.role)
);

const hasCoachAccess = coachingAssignments.length > 0;
const hasClubAccess = clubAssignments.length > 0;

  const displayName = profile?.full_name || "User";

  const displayRole = role
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");

  const pageTitle = isSuperAdmin
  ? "Super Admin Command Centre"
  : isParent
  ? "Player Journey"
  : hasCoachAccess
  ? "Coach Dashboard"
  : hasClubAccess
  ? "Club Administration"
  : "Club Dashboard";

  return (
    <main style={styles.page}>
      <section style={styles.container}>
        <header style={styles.header}>
          <div style={styles.headingArea}>
            <p style={styles.eyebrow}>BOAR PACK TRACK</p>

            <h1 style={styles.title}>{pageTitle}</h1>

            <p style={styles.subtitle}>
              {isParent
                ? `Welcome back, ${displayName}. Follow every step of your child's rugby journey.`
                : `Welcome back, ${displayName}.`}
            </p>
          </div>

          <ProfileMenu
            profileMenuRef={profileMenuRef}
            profileMenuOpen={profileMenuOpen}
            setProfileMenuOpen={setProfileMenuOpen}
            displayName={displayName}
            displayRole={displayRole}
            initials={initials}
            router={router}
            showComingSoon={showComingSoon}
            handleLogout={handleLogout}
            loggingOut={loggingOut}
          />
        </header>

        {isSuperAdmin ? (
          <SuperAdminDashboard router={router} />
        ) : isParent ? (
          <ParentJourney
            player={linkedPlayer}
            router={router}
            showComingSoon={showComingSoon}
          />
        ) : hasCoachAccess ? (
  <section>
    <div style={styles.sectionHeading}>
      <div>
        <p style={styles.eyebrow}>YOUR SQUADS</p>
        <h2 style={styles.sectionTitle}>Coaching Dashboard</h2>
      </div>
    </div>

    <div style={styles.dashboardGrid}>
      {coachingAssignments.map((assignment) => {
        const squad = assignment.teams;

        const squadName =
          squad?.team_name || "Assigned squad";

        const squadAgeGroup =
          squad?.age_group || "Age group not added";

        const roleName = assignment.role
          .replaceAll("_", " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase());

        return (
          <article
            key={assignment.id}
            style={styles.coachSquadCard}
          >
            <div style={styles.coachSquadHeader}>
              <div>
                <p style={styles.cardEyebrow}>BRADFORD SALEM</p>
                <h3 style={styles.coachSquadTitle}>
                  {squadName}
                </h3>
                <p style={styles.coachSquadMeta}>
                  {roleName} • {squadAgeGroup}
                </p>
              </div>

              <div style={styles.squadBadge}>
                🏉
              </div>
            </div>

            <div style={styles.coachActionsGrid}>
              <button
                type="button"
                style={styles.coachActionButton}
                onClick={() =>
                  router.push(`/players?team=${assignment.squad_id}`)
                }
              >
                <span style={styles.coachActionIcon}>👥</span>
                <span>
                  <strong style={styles.coachActionTitle}>
                    Players
                  </strong>
                  <small style={styles.coachActionText}>
                    View and manage your squad
                  </small>
                </span>
              </button>

              <button
                type="button"
                style={styles.coachActionButton}
                onClick={() =>
                  router.push(
                    `/team-selection?team=${assignment.squad_id}`
                  )
                }
              >
                <span style={styles.coachActionIcon}>📋</span>
                <span>
                  <strong style={styles.coachActionTitle}>
                    Team Selection
                  </strong>
                  <small style={styles.coachActionText}>
                    Select starters and replacements
                  </small>
                </span>
              </button>

              <button
                type="button"
                style={styles.coachActionButton}
                onClick={() =>
                  router.push(`/training?team=${assignment.squad_id}`)
                }
              >
                <span style={styles.coachActionIcon}>✅</span>
                <span>
                  <strong style={styles.coachActionTitle}>
                    Training
                  </strong>
                  <small style={styles.coachActionText}>
                    Record attendance and sessions
                  </small>
                </span>
              </button>

              <button
                type="button"
                style={styles.coachActionButton}
                onClick={() =>
                  router.push(`/match-day?team=${assignment.squad_id}`)
                }
              >
                <span style={styles.coachActionIcon}>🏉</span>
                <span>
                  <strong style={styles.coachActionTitle}>
                    Match Day
                  </strong>
                  <small style={styles.coachActionText}>
                    Fixtures, selection and live match
                  </small>
                </span>
              </button>

              <button
                type="button"
                style={styles.coachActionButton}
                onClick={() =>
                  router.push(`/players?team=${assignment.squad_id}`)
                }
              >
                <span style={styles.coachActionIcon}>📈</span>
                <span>
                  <strong style={styles.coachActionTitle}>
                    Development
                  </strong>
                  <small style={styles.coachActionText}>
                    Reviews, progress and coaching focus
                  </small>
                </span>
              </button>

              <button
                type="button"
                style={styles.coachActionButton}
                onClick={() =>
                  router.push(`/reports?team=${assignment.squad_id}`)
                }
              >
                <span style={styles.coachActionIcon}>📊</span>
                <span>
                  <strong style={styles.coachActionTitle}>
                    Reports
                  </strong>
                  <small style={styles.coachActionText}>
                    Squad and player reports
                  </small>
                </span>
              </button>
            </div>
          </article>
        );
      })}
    </div>
  </section>
) : (
  <section style={styles.notice}>
    Your club dashboard will display the tools allowed for your role.
  </section>
)}
      </section>
    </main>
  );
}

function ProfileMenu({
  profileMenuRef,
  profileMenuOpen,
  setProfileMenuOpen,
  displayName,
  displayRole,
  initials,
  router,
  showComingSoon,
  handleLogout,
  loggingOut,
}) {
  return (
    <div ref={profileMenuRef} style={styles.profileMenuWrapper}>
      <button
        type="button"
        style={styles.profileButton}
        onClick={() => setProfileMenuOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={profileMenuOpen}
      >
        <span style={styles.profileAvatar}>{initials || "BP"}</span>

        <span style={styles.profileButtonText}>
          <strong style={styles.profileButtonName}>{displayName}</strong>
          <span style={styles.profileButtonRole}>{displayRole}</span>
        </span>

        <span
          style={{
            ...styles.profileChevron,
            transform: profileMenuOpen
              ? "rotate(180deg)"
              : "rotate(0deg)",
          }}
        >
          ▾
        </span>
      </button>

      {profileMenuOpen && (
        <div style={styles.profileDropdown} role="menu">
          <div style={styles.profileDropdownHeader}>
            <span style={styles.dropdownAvatar}>{initials || "BP"}</span>

            <div style={styles.dropdownIdentity}>
              <strong style={styles.dropdownName}>{displayName}</strong>
              <span style={styles.dropdownRole}>{displayRole}</span>
            </div>
          </div>

          <div style={styles.dropdownDivider} />

          <ProfileMenuItem
            icon="🏠"
            title="Dashboard"
            description="Return to your main dashboard"
            onClick={() => {
              setProfileMenuOpen(false);
              router.push("/dashboard");
            }}
          />

          <ProfileMenuItem
            icon="👤"
            title="My Profile"
            description="View and update your details"
            onClick={() => showComingSoon("My Profile")}
          />

          <ProfileMenuItem
            icon="🔐"
            title="Change Password"
            description="Update your account password"
            onClick={() => showComingSoon("Change Password")}
          />

          <ProfileMenuItem
            icon="❓"
            title="Help Centre"
            description="Guidance and platform support"
            onClick={() => showComingSoon("Help Centre")}
          />

          <div style={styles.dropdownDivider} />

          <button
            type="button"
            style={{
              ...styles.menuItem,
              ...styles.logoutMenuItem,
            }}
            onClick={handleLogout}
            disabled={loggingOut}
            role="menuitem"
          >
            <span style={styles.menuIcon}>🚪</span>

            <span style={styles.menuText}>
              <strong style={styles.logoutTitle}>
                {loggingOut ? "Logging out..." : "Logout"}
              </strong>

              <span style={styles.logoutDescription}>
                Securely leave Boar Pack Track
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

function ProfileMenuItem({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      style={styles.menuItem}
      onClick={onClick}
      role="menuitem"
    >
      <span style={styles.menuIcon}>{icon}</span>

      <span style={styles.menuText}>
        <strong style={styles.menuTitle}>{title}</strong>
        <span style={styles.menuDescription}>{description}</span>
      </span>
    </button>
  );
}

function SuperAdminDashboard({ router }) {
  return (
    <>
      <section style={styles.notice}>
        You have full platform access across every club, user and squad.
      </section>

      <section style={styles.grid}>
        <DashboardCard
          icon="🏉"
          title="Add Club"
          description="Create a new club and begin its setup."
          onClick={() => router.push("/admin/clubs/new")}
        />

        <DashboardCard
          icon="🏟️"
          title="Manage Clubs"
          description="View, edit, archive and restore clubs."
          onClick={() => router.push("/admin/clubs")}
        />

        <DashboardCard
          icon="👤"
          title="Add User"
          description="Create admins, coaches, safeguarding staff and parents."
          onClick={() => router.push("/admin/users/new")}
        />

        <DashboardCard
          icon="👥"
          title="Manage Users"
          description="Manage admins, coaches, parents and access."
          onClick={() => router.push("/admin/users")}
        />

        <DashboardCard
          icon="📋"
          title="View All Squads"
          description="Review squads across every registered club."
          onClick={() => router.push("/squads")}
        />

        <DashboardCard
          icon="⚙️"
          title="System Settings"
          description="Platform settings, roles and future billing."
          onClick={() => router.push("/admin/settings")}
        />
      </section>
    </>
  );
}

function ParentJourney({ player, showComingSoon }) {
  if (!player) {
    return (
      <section style={styles.emptyJourneyCard}>
        <div style={styles.emptyJourneyIcon}>👨‍👩‍👦</div>

        <h2 style={styles.emptyJourneyTitle}>
          No player linked yet
        </h2>

        <p style={styles.emptyJourneyText}>
          A club administrator needs to link your account to your
          child before their Player Journey can be displayed.
        </p>
      </section>
    );
  }

  const playerName = `${player.First_name || ""} ${
    player.Last_name || ""
  }`.trim();

  const playerInitials = `${player.First_name?.charAt(0) || ""}${
    player.Last_name?.charAt(0) || ""
  }`.toUpperCase();

  const playerPhoto =
    player.Profile_image || player.Photo || "";

  const positionText = [
    player.Primary_position,
    player.Secondary_position,
  ]
    .filter(Boolean)
    .join(" • ");

  const overall = normalisePercentage(player.Overall);
  const potential = normalisePercentage(player.Potential);
  const attendance = normalisePercentage(player.Attendance);
  const focusProgress = normalisePercentage(player.Focus_progress);

  return (
    <div style={styles.journeyWrapper}>
      <section style={styles.journeyHero}>
        <div style={styles.heroGlow} />

        <div style={styles.playerPhotoFrame}>
          {playerPhoto ? (
            <img
              src={playerPhoto}
              alt={playerName}
              style={styles.playerPhoto}
            />
          ) : (
            <div style={styles.playerPhotoFallback}>
              <span style={styles.playerInitials}>
                {playerInitials || "BP"}
              </span>
              <span style={styles.playerFallbackLabel}>PLAYER</span>
            </div>
          )}
        </div>

        <div style={styles.heroInformation}>
          <div style={styles.heroBadgeRow}>
            <span style={styles.ptBadge}>
              {player.Pt_number || "PT NUMBER"}
            </span>

            <span style={styles.journeyBadge}>
              PLAYER JOURNEY
            </span>
          </div>

          <h2 style={styles.playerName}>{playerName}</h2>

          <p style={styles.playerPosition}>
            {positionText || "Position not added"}
          </p>

          <p style={styles.heroMessage}>
            Building better people first. Better rugby players second.
          </p>
        </div>

        <div style={styles.capsPanel}>
          <span style={styles.capsNumber}>{player.Caps ?? 0}</span>
          <span style={styles.capsLabel}>CAREER CAPS</span>
        </div>
      </section>

      <section style={styles.metricGrid}>
        <JourneyMetric
          icon="⭐"
          label="Overall Rating"
          value={overall}
          fallback="Awaiting rating"
        />

        <JourneyMetric
          icon="🚀"
          label="Potential"
          value={potential}
          fallback="Awaiting potential"
        />

        <JourneyMetric
          icon="📈"
          label="Attendance"
          value={attendance}
          fallback="Attendance pending"
        />

        <JourneyMetric
          icon="🎯"
          label="Focus Progress"
          value={focusProgress}
          fallback="Progress pending"
        />
      </section>

      <section style={styles.journeyContentGrid}>
        <article style={styles.developmentCard}>
          <div style={styles.cardHeadingRow}>
            <span style={styles.sectionIcon}>🎯</span>

            <div>
              <p style={styles.cardEyebrow}>CURRENT DEVELOPMENT</p>
              <h3 style={styles.journeyCardTitle}>
                Current Focus
              </h3>
            </div>
          </div>

          <div style={styles.focusPanel}>
            <p style={styles.focusText}>
              {player.Current_focus ||
                "The coach has not added a current focus yet."}
            </p>
          </div>

          <ProgressBar
            label="Focus progress"
            value={focusProgress}
          />

          <button
            type="button"
            style={styles.secondaryJourneyButton}
            onClick={() => showComingSoon("Full Development Review")}
          >
            View Full Development Review →
          </button>
        </article>

        <article style={styles.nextUpCard}>
          <div style={styles.cardHeadingRow}>
            <span style={styles.sectionIcon}>📅</span>

            <div>
              <p style={styles.cardEyebrow}>WHAT’S NEXT?</p>
              <h3 style={styles.journeyCardTitle}>Next Up</h3>
            </div>
          </div>

          <JourneyInfoRow
            icon="🏉"
            title="Next Fixture"
            text="Fixture information coming soon"
          />

          <JourneyInfoRow
            icon="🏃"
            title="Next Training"
            text="Training information coming soon"
          />

          <JourneyInfoRow
            icon="📋"
            title="Next Review"
            text="Review date coming soon"
          />
        </article>
      </section>

      <section style={styles.lowerJourneyGrid}>
        <article style={styles.achievementsCard}>
          <div style={styles.cardHeadingRow}>
            <span style={styles.sectionIcon}>🏆</span>

            <div>
              <p style={styles.cardEyebrow}>PLAYER MILESTONES</p>
              <h3 style={styles.journeyCardTitle}>
                Achievement Cabinet
              </h3>
            </div>
          </div>

          <div style={styles.achievementGrid}>
            <Achievement
              icon="🏉"
              title="First Match"
              unlocked={(player.Caps ?? 0) >= 1}
            />

            <Achievement
              icon="2️⃣5️⃣"
              title="25 Caps"
              unlocked={(player.Caps ?? 0) >= 25}
            />

            <Achievement
              icon="5️⃣0️⃣"
              title="50 Caps"
              unlocked={(player.Caps ?? 0) >= 50}
            />

            <Achievement
              icon="7️⃣5️⃣"
              title="75 Caps"
              unlocked={(player.Caps ?? 0) >= 75}
            />

            <Achievement
              icon="💯"
              title="100 Caps"
              unlocked={(player.Caps ?? 0) >= 100}
            />

            <Achievement
              icon="⭐"
              title="More Coming"
              unlocked={false}
            />
          </div>
        </article>

        <article style={styles.reportCard}>
          <span style={styles.reportIcon}>📄</span>

          <p style={styles.reportEyebrow}>PLAYER REPORTS</p>

          <h3 style={styles.reportTitle}>
            Development Report
          </h3>

          <p style={styles.reportText}>
            Download a professional summary of your child’s
            development, progress and current coaching focus.
          </p>

          <button
            type="button"
            style={styles.reportButton}
            onClick={() =>
              showComingSoon("Download Development Report")
            }
          >
            ⬇ Download Report
          </button>
        </article>
      </section>
    </div>
  );
}

function JourneyMetric({
  icon,
  label,
  value,
  fallback,
}) {
  const hasValue = value !== null;

  return (
    <article style={styles.metricCard}>
      <div style={styles.metricTopRow}>
        <span style={styles.metricIcon}>{icon}</span>

        <span style={styles.metricValue}>
          {hasValue ? `${value}%` : "—"}
        </span>
      </div>

      <strong style={styles.metricLabel}>{label}</strong>

      <span style={styles.metricDescription}>
        {hasValue ? "Current recorded progress" : fallback}
      </span>

      <div style={styles.metricTrack}>
        <div
          style={{
            ...styles.metricFill,
            width: `${hasValue ? value : 0}%`,
          }}
        />
      </div>
    </article>
  );
}

function ProgressBar({ label, value }) {
  const safeValue = value ?? 0;

  return (
    <div style={styles.progressWrapper}>
      <div style={styles.progressLabelRow}>
        <span style={styles.progressLabel}>{label}</span>
        <strong style={styles.progressValue}>
          {value !== null ? `${safeValue}%` : "Not recorded"}
        </strong>
      </div>

      <div style={styles.progressTrack}>
        <div
          style={{
            ...styles.progressFill,
            width: `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
}

function JourneyInfoRow({ icon, title, text }) {
  return (
    <div style={styles.journeyInfoRow}>
      <span style={styles.journeyInfoIcon}>{icon}</span>

      <div>
        <strong style={styles.journeyInfoTitle}>{title}</strong>
        <p style={styles.journeyInfoText}>{text}</p>
      </div>
    </div>
  );
}

function Achievement({ icon, title, unlocked }) {
  return (
    <div
      style={{
        ...styles.achievement,
        ...(unlocked
          ? styles.achievementUnlocked
          : styles.achievementLocked),
      }}
    >
      <span style={styles.achievementIcon}>
        {unlocked ? icon : "🔒"}
      </span>

      <strong style={styles.achievementTitle}>{title}</strong>

      <span style={styles.achievementStatus}>
        {unlocked ? "Unlocked" : "Locked"}
      </span>
    </div>
  );
}

function DashboardCard({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button type="button" style={styles.card} onClick={onClick}>
      <span style={styles.cardIcon}>{icon}</span>

      <span style={styles.cardContent}>
        <strong style={styles.cardTitle}>{title}</strong>
        <span style={styles.cardText}>{description}</span>
      </span>

      <span style={styles.arrow}>→</span>
    </button>
  );
}

function normalisePercentage(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round(numberValue)));
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px 24px 120px",
    background:
      "radial-gradient(circle at top right, rgba(35,91,180,0.34), transparent 32%), linear-gradient(145deg, #071326 0%, #0b2857 52%, #071326 100%)",
    color: "#ffffff",
  },

  container: {
    width: "100%",
    maxWidth: "1500px",
    margin: "0 auto",
  },

  loadingCard: {
    maxWidth: "520px",
    margin: "100px auto",
    padding: "30px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.08)",
    textAlign: "center",
    fontWeight: "800",
  },

  loadingIcon: {
    marginBottom: "10px",
    fontSize: "32px",
  },

  header: {
    position: "relative",
    zIndex: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "24px",
    marginBottom: "26px",
  },

  headingArea: {
    flex: "1 1 480px",
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
    fontSize: "clamp(30px, 5vw, 54px)",
    lineHeight: "1.05",
  },

  subtitle: {
    maxWidth: "680px",
    margin: "12px 0 0",
    color: "#cbd8ec",
    fontSize: "17px",
    lineHeight: "1.55",
  },

  profileMenuWrapper: {
    position: "relative",
    zIndex: 30,
    flexShrink: 0,
  },

  profileButton: {
    minWidth: "250px",
    padding: "10px 13px",
    display: "flex",
    alignItems: "center",
    gap: "11px",
    border: "1px solid rgba(245,184,0,0.48)",
    borderRadius: "17px",
    background:
      "linear-gradient(145deg, rgba(19,57,113,0.96), rgba(7,29,67,0.98))",
    color: "#ffffff",
    cursor: "pointer",
    textAlign: "left",
    boxShadow: "0 12px 28px rgba(0,0,0,0.25)",
  },

  profileAvatar: {
    width: "43px",
    height: "43px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    border: "2px solid rgba(245,184,0,0.72)",
    borderRadius: "50%",
    background: "rgba(245,184,0,0.16)",
    color: "#f5b800",
    fontSize: "14px",
    fontWeight: "900",
  },

  profileButtonText: {
    minWidth: 0,
    display: "flex",
    flex: 1,
    flexDirection: "column",
    gap: "3px",
  },

  profileButtonName: {
    overflow: "hidden",
    color: "#ffffff",
    fontSize: "14px",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  profileButtonRole: {
    color: "#f5b800",
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "0.7px",
    textTransform: "uppercase",
  },

  profileChevron: {
    color: "#f5b800",
    fontSize: "18px",
    transition: "transform 0.2s ease",
  },

  profileDropdown: {
    position: "absolute",
    top: "calc(100% + 10px)",
    left: "50%",
    transform: "translateX(-50%)",
    width: "min(295px, calc(100vw - 32px))",
    padding: "10px",
    overflow: "hidden",
    border: "1px solid rgba(245,184,0,0.3)",
    borderRadius: "20px",
    background:
      "linear-gradient(160deg, rgba(12,39,82,0.99), rgba(5,20,47,0.99))",
    boxShadow: "0 22px 50px rgba(0,0,0,0.42)",
  },

  profileDropdownHeader: {
    padding: "13px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  dropdownAvatar: {
    width: "48px",
    height: "48px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    border: "2px solid #f5b800",
    borderRadius: "50%",
    background: "rgba(245,184,0,0.15)",
    color: "#f5b800",
    fontSize: "15px",
    fontWeight: "900",
  },

  dropdownIdentity: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  dropdownName: {
    overflow: "hidden",
    color: "#ffffff",
    fontSize: "15px",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  dropdownRole: {
    color: "#f5b800",
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
  },

  dropdownDivider: {
    height: "1px",
    margin: "7px 6px",
    background: "rgba(255,255,255,0.1)",
  },

  menuItem: {
    width: "100%",
    padding: "11px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    border: "none",
    borderRadius: "13px",
    background: "transparent",
    color: "#ffffff",
    textAlign: "left",
    cursor: "pointer",
  },

  menuIcon: {
    width: "34px",
    height: "34px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    borderRadius: "10px",
    background: "rgba(255,255,255,0.07)",
    fontSize: "16px",
  },

  menuText: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },

  menuTitle: {
    color: "#ffffff",
    fontSize: "14px",
  },

  menuDescription: {
    color: "#9fb0c8",
    fontSize: "11px",
    lineHeight: "1.35",
  },

  logoutMenuItem: {
    background: "rgba(239,68,68,0.08)",
  },

  logoutTitle: {
    color: "#ff8f8f",
    fontSize: "14px",
  },

  logoutDescription: {
    color: "#d4a3a3",
    fontSize: "11px",
    lineHeight: "1.35",
  },

  notice: {
    marginBottom: "26px",
    padding: "18px 20px",
    borderLeft: "5px solid #f5b800",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.07)",
    color: "#dce7f6",
    fontWeight: "700",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "18px",
  },

  card: {
    width: "100%",
    minHeight: "145px",
    padding: "22px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    border: "1px solid rgba(255,255,255,0.11)",
    borderRadius: "20px",
    background:
      "linear-gradient(145deg, rgba(20,62,125,0.95), rgba(7,28,65,0.96))",
    color: "#ffffff",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 14px 30px rgba(0,0,0,0.23)",
  },

  cardIcon: {
    width: "52px",
    height: "52px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    borderRadius: "16px",
    background: "rgba(245,184,0,0.14)",
    fontSize: "25px",
  },

  cardContent: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    flex: 1,
  },

  cardTitle: {
    color: "#f5b800",
    fontSize: "19px",
  },

  cardText: {
    color: "#d4dfef",
    fontSize: "14px",
    lineHeight: "1.45",
  },

  arrow: {
    color: "#f5b800",
    fontSize: "26px",
    fontWeight: "900",
  },

  journeyWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  journeyHero: {
    position: "relative",
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns:
      "minmax(120px, 170px) minmax(0, 1fr) auto",
    alignItems: "center",
    gap: "25px",
    padding: "28px",
    border: "1px solid rgba(245,184,0,0.32)",
    borderRadius: "26px",
    background:
      "linear-gradient(135deg, rgba(24,73,145,0.98), rgba(7,29,68,0.98))",
    boxShadow: "0 22px 55px rgba(0,0,0,0.3)",
  },

  heroGlow: {
    position: "absolute",
    width: "280px",
    height: "280px",
    top: "-160px",
    right: "-80px",
    borderRadius: "50%",
    background: "rgba(245,184,0,0.16)",
    filter: "blur(30px)",
  },

  playerPhotoFrame: {
    position: "relative",
    zIndex: 2,
    width: "150px",
    height: "170px",
    overflow: "hidden",
    border: "3px solid rgba(245,184,0,0.7)",
    borderRadius: "24px",
    background: "#06162f",
    boxShadow: "0 16px 35px rgba(0,0,0,0.3)",
  },

  playerPhoto: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  playerPhotoFallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: "7px",
    background:
      "linear-gradient(145deg, rgba(34,94,181,0.9), rgba(7,31,74,0.98))",
  },

  playerInitials: {
    color: "#f5b800",
    fontSize: "42px",
    fontWeight: "900",
  },

  playerFallbackLabel: {
    color: "#aebed4",
    fontSize: "9px",
    fontWeight: "900",
    letterSpacing: "2px",
  },

  heroInformation: {
    position: "relative",
    zIndex: 2,
    minWidth: 0,
  },

  heroBadgeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "9px",
    marginBottom: "13px",
  },

  ptBadge: {
    padding: "7px 11px",
    borderRadius: "999px",
    background: "#f5b800",
    color: "#071326",
    fontSize: "11px",
    fontWeight: "900",
  },

  journeyBadge: {
    padding: "7px 11px",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.07)",
    color: "#dce7f5",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "0.8px",
  },

  playerName: {
    margin: "0 0 8px",
    color: "#ffffff",
    fontSize: "clamp(32px, 5vw, 52px)",
    lineHeight: "1",
  },

  playerPosition: {
    margin: "0 0 17px",
    color: "#f5b800",
    fontSize: "16px",
    fontWeight: "800",
  },

  heroMessage: {
    maxWidth: "530px",
    margin: 0,
    color: "#c6d4e7",
    fontSize: "14px",
    fontStyle: "italic",
    lineHeight: "1.55",
  },

  capsPanel: {
    position: "relative",
    zIndex: 2,
    minWidth: "130px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    border: "1px solid rgba(245,184,0,0.27)",
    borderRadius: "20px",
    background: "rgba(2,17,42,0.4)",
  },

  capsNumber: {
    color: "#f5b800",
    fontSize: "42px",
    fontWeight: "900",
    lineHeight: "1",
  },

  capsLabel: {
    marginTop: "8px",
    color: "#9fb0c8",
    fontSize: "9px",
    fontWeight: "900",
    letterSpacing: "1.2px",
  },

  metricGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "16px",
  },

  metricCard: {
    padding: "20px",
    border: "1px solid rgba(255,255,255,0.11)",
    borderRadius: "20px",
    background:
      "linear-gradient(145deg, rgba(18,55,111,0.95), rgba(7,27,63,0.97))",
    boxShadow: "0 14px 32px rgba(0,0,0,0.22)",
  },

  metricTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "13px",
  },

  metricIcon: {
    width: "39px",
    height: "39px",
    display: "grid",
    placeItems: "center",
    borderRadius: "12px",
    background: "rgba(245,184,0,0.12)",
    fontSize: "19px",
  },

  metricValue: {
    color: "#f5b800",
    fontSize: "24px",
    fontWeight: "900",
  },

  metricLabel: {
    display: "block",
    color: "#ffffff",
    fontSize: "15px",
  },

  metricDescription: {
    display: "block",
    marginTop: "5px",
    color: "#91a5c2",
    fontSize: "11px",
  },

  metricTrack: {
    height: "8px",
    marginTop: "15px",
    overflow: "hidden",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.1)",
  },

  metricFill: {
    height: "100%",
    borderRadius: "999px",
    background:
      "linear-gradient(90deg, #f5b800, #ffe071)",
    transition: "width 0.5s ease",
  },

  journeyContentGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },

  developmentCard: {
    padding: "24px",
    border: "1px solid rgba(245,184,0,0.24)",
    borderRadius: "22px",
    background:
      "linear-gradient(150deg, rgba(17,52,105,0.97), rgba(6,25,59,0.98))",
  },

  nextUpCard: {
    padding: "24px",
    border: "1px solid rgba(255,255,255,0.11)",
    borderRadius: "22px",
    background: "rgba(7,28,64,0.88)",
  },

  cardHeadingRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },

  sectionIcon: {
    width: "45px",
    height: "45px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    borderRadius: "14px",
    background: "rgba(245,184,0,0.13)",
    fontSize: "21px",
  },

  cardEyebrow: {
    margin: "0 0 3px",
    color: "#f5b800",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "1.2px",
  },

  journeyCardTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "21px",
  },

  focusPanel: {
    marginBottom: "19px",
    padding: "19px",
    borderLeft: "4px solid #f5b800",
    borderRadius: "14px",
    background: "rgba(245,184,0,0.08)",
  },

  focusText: {
    margin: 0,
    color: "#e6edf7",
    fontSize: "15px",
    lineHeight: "1.65",
  },

  progressWrapper: {
    marginBottom: "20px",
  },

  progressLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    marginBottom: "8px",
  },

  progressLabel: {
    color: "#a8bad2",
    fontSize: "12px",
  },

  progressValue: {
    color: "#f5b800",
    fontSize: "12px",
  },

  progressTrack: {
    height: "9px",
    overflow: "hidden",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.1)",
  },

  progressFill: {
    height: "100%",
    borderRadius: "999px",
    background:
      "linear-gradient(90deg, #f5b800, #ffe071)",
  },

  secondaryJourneyButton: {
    width: "100%",
    padding: "13px 16px",
    border: "1px solid rgba(245,184,0,0.3)",
    borderRadius: "13px",
    background: "rgba(245,184,0,0.08)",
    color: "#f5b800",
    fontSize: "12px",
    fontWeight: "900",
    cursor: "pointer",
  },

  journeyInfoRow: {
    padding: "15px 0",
    display: "flex",
    alignItems: "flex-start",
    gap: "13px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },

  journeyInfoIcon: {
    width: "37px",
    height: "37px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    borderRadius: "11px",
    background: "rgba(255,255,255,0.06)",
    fontSize: "18px",
  },

  journeyInfoTitle: {
    color: "#ffffff",
    fontSize: "13px",
  },

  journeyInfoText: {
    margin: "4px 0 0",
    color: "#94a8c4",
    fontSize: "11px",
    lineHeight: "1.45",
  },

  lowerJourneyGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.5fr) minmax(260px, 0.7fr)",
    gap: "20px",
  },

  achievementsCard: {
    padding: "24px",
    border: "1px solid rgba(255,255,255,0.11)",
    borderRadius: "22px",
    background: "rgba(7,28,64,0.88)",
  },

  achievementGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "12px",
  },

  achievement: {
    minHeight: "120px",
    padding: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: "7px",
    borderRadius: "16px",
    textAlign: "center",
  },

  achievementUnlocked: {
    border: "1px solid rgba(245,184,0,0.32)",
    background: "rgba(245,184,0,0.09)",
  },

  achievementLocked: {
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.035)",
    opacity: 0.62,
  },

  achievementIcon: {
    fontSize: "25px",
  },

  achievementTitle: {
    color: "#ffffff",
    fontSize: "12px",
  },

  achievementStatus: {
    color: "#9eafc5",
    fontSize: "9px",
    fontWeight: "800",
    textTransform: "uppercase",
  },

  reportCard: {
    padding: "26px",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    border: "1px solid rgba(245,184,0,0.3)",
    borderRadius: "22px",
    background:
      "linear-gradient(150deg, rgba(85,63,9,0.42), rgba(7,29,66,0.98))",
  },

  reportIcon: {
    marginBottom: "15px",
    fontSize: "35px",
  },

  reportEyebrow: {
    margin: "0 0 6px",
    color: "#f5b800",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "1.2px",
  },

  reportTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "23px",
  },

  reportText: {
    margin: "13px 0 21px",
    color: "#b8c7da",
    fontSize: "12px",
    lineHeight: "1.6",
  },

  reportButton: {
    width: "100%",
    padding: "14px 17px",
    border: "none",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #f5b800, #ffdc63)",
    color: "#071326",
    fontSize: "13px",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow: "0 12px 25px rgba(245,184,0,0.2)",
  },

  emptyJourneyCard: {
    maxWidth: "620px",
    margin: "30px auto",
    padding: "38px 28px",
    border: "1px solid rgba(245,184,0,0.25)",
    borderRadius: "24px",
    background: "rgba(8,30,68,0.9)",
    textAlign: "center",
  },

  emptyJourneyIcon: {
    marginBottom: "14px",
    fontSize: "39px",
  },

  emptyJourneyTitle: {
    margin: "0 0 10px",
    color: "#ffffff",
    fontSize: "25px",
  },

  emptyJourneyText: {
    margin: 0,
    color: "#b2c1d5",
    lineHeight: "1.6",
  },
  sectionHeading: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: "20px",
  marginBottom: "18px",
},

eyebrow: {
  margin: "0 0 6px",
  color: "#f5b800",
  fontSize: "12px",
  fontWeight: "900",
  letterSpacing: "1.4px",
},

sectionTitle: {
  margin: 0,
  color: "#ffffff",
  fontSize: "26px",
  fontWeight: "900",
},

dashboardGrid: {
  width: "100%",
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "22px",
},

coachSquadCard: {
  width: "100%",
  boxSizing: "border-box",
  padding: "30px",
  border: "1px solid rgba(245, 184, 0, 0.35)",
  borderRadius: "24px",
  background:
    "linear-gradient(145deg, rgba(16, 53, 108, 0.98), rgba(6, 28, 66, 0.98))",
  boxShadow: "0 18px 45px rgba(0, 0, 0, 0.28)",
},
coachSquadHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "18px",
  marginBottom: "20px",
},

cardEyebrow: {
  margin: "0 0 7px",
  color: "#f5b800",
  fontSize: "11px",
  fontWeight: "900",
  letterSpacing: "1.2px",
},

coachSquadTitle: {
  margin: 0,
  color: "#ffffff",
  fontSize: "34px",
  fontWeight: "900",
},

coachSquadMeta: {
  margin: "7px 0 0",
  color: "#c9d8f2",
  fontSize: "14px",
  fontWeight: "700",
},

squadBadge: {
  minWidth: "52px",
  height: "52px",
  display: "grid",
  placeItems: "center",
  borderRadius: "16px",
  border: "1px solid rgba(245, 184, 0, 0.35)",
  background: "rgba(245, 184, 0, 0.1)",
  fontSize: "24px",
},

coachActionsGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
  gap: "16px",
  marginTop: "26px",
},

coachActionButton: {
  width: "100%",
  minHeight: "112px",
  display: "flex",
  alignItems: "center",
  gap: "14px",
  padding: "18px",
  textAlign: "left",
  cursor: "pointer",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: "18px",
  background: "rgba(255, 255, 255, 0.07)",
  color: "#ffffff",
  boxShadow: "0 10px 24px rgba(0, 0, 0, 0.16)",
},

coachActionIcon: {
  minWidth: "50px",
  height: "50px",
  display: "grid",
  placeItems: "center",
  borderRadius: "14px",
  background: "rgba(245, 184, 0, 0.14)",
  fontSize: "28px",
},

coachActionTitle: {
  display: "block",
  marginBottom: "4px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "900",
},

coachActionText: {
  display: "block",
  color: "#b8c8e3",
  fontSize: "12px",
  lineHeight: "1.4",
},
};