"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const profileMenuRef = useRef(null);

  const [profile, setProfile] = useState(null);
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

      const { data, error } = await supabase
        .from("user_profiles")
        .select("full_name, role, club_id")
        .eq("id", user.id)
        .maybeSingle();

      if (error || !data) {
        console.error("Dashboard profile error:", error);
        setLoading(false);
        return;
      }

      setProfile(data);
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
        <div style={styles.loadingCard}>Loading your dashboard...</div>
      </main>
    );
  }

  const role = profile?.role || "unknown";
  const isSuperAdmin = role === "super_admin";

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

  return (
    <main style={styles.page}>
      <section style={styles.container}>
        <header style={styles.header}>
          <div style={styles.headingArea}>
            <p style={styles.eyebrow}>BOAR PACK TRACK</p>

            <h1 style={styles.title}>
              {isSuperAdmin
                ? "Super Admin Command Centre"
                : "Club Dashboard"}
            </h1>

            <p style={styles.subtitle}>Welcome back, {displayName}.</p>
          </div>

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

                <button
                  type="button"
                  style={styles.menuItem}
                  onClick={() => {
                    setProfileMenuOpen(false);
                    router.push("/dashboard");
                  }}
                  role="menuitem"
                >
                  <span style={styles.menuIcon}>🏠</span>
                  <span style={styles.menuText}>
                    <strong style={styles.menuTitle}>Dashboard</strong>
                    <span style={styles.menuDescription}>
                      Return to your command centre
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  style={styles.menuItem}
                  onClick={() => showComingSoon("My Profile")}
                  role="menuitem"
                >
                  <span style={styles.menuIcon}>👤</span>
                  <span style={styles.menuText}>
                    <strong style={styles.menuTitle}>My Profile</strong>
                    <span style={styles.menuDescription}>
                      View and update your details
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  style={styles.menuItem}
                  onClick={() => showComingSoon("Change Password")}
                  role="menuitem"
                >
                  <span style={styles.menuIcon}>🔐</span>
                  <span style={styles.menuText}>
                    <strong style={styles.menuTitle}>Change Password</strong>
                    <span style={styles.menuDescription}>
                      Update your account password
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  style={styles.menuItem}
                  onClick={() => showComingSoon("Help Centre")}
                  role="menuitem"
                >
                  <span style={styles.menuIcon}>❓</span>
                  <span style={styles.menuText}>
                    <strong style={styles.menuTitle}>Help Centre</strong>
                    <span style={styles.menuDescription}>
                      Guidance and platform support
                    </span>
                  </span>
                </button>

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
        </header>

        {isSuperAdmin ? (
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
        ) : (
          <section style={styles.notice}>
            Your club dashboard will display the tools allowed for your role.
          </section>
        )}
      </section>
    </main>
  );
}

function DashboardCard({ icon, title, description, onClick }) {
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

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px 24px 120px",
    background:
      "linear-gradient(145deg, #071326 0%, #0b2857 52%, #071326 100%)",
    color: "#ffffff",
  },

  container: {
    width: "100%",
    maxWidth: "1180px",
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
    margin: "12px 0 0",
    color: "#cbd8ec",
    fontSize: "17px",
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
    letterSpacing: "0.5px",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
};