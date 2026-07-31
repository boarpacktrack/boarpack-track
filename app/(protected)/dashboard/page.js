"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
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

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.loadingCard}>Loading your dashboard...</div>
      </main>
    );
  }

  const role = profile?.role || "unknown";
  const isSuperAdmin = role === "super_admin";

  return (
    <main style={styles.page}>
      <section style={styles.container}>
        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>BOAR PACK TRACK</p>

            <h1 style={styles.title}>
              {isSuperAdmin
                ? "Super Admin Command Centre"
                : "Club Dashboard"}
            </h1>

            <p style={styles.subtitle}>
              Welcome back, {profile?.full_name || "user"}.
            </p>
          </div>

          <div style={styles.roleBadge}>
            {role.replaceAll("_", " ").toUpperCase()}
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
                icon="👑"
                title="Add Club Admin"
                description="Assign the first administrator to a club."
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "24px",
    marginBottom: "26px",
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

  roleBadge: {
    padding: "12px 16px",
    border: "1px solid rgba(245,184,0,0.6)",
    borderRadius: "999px",
    background: "rgba(245,184,0,0.12)",
    color: "#f5b800",
    fontSize: "12px",
    fontWeight: "900",
    whiteSpace: "nowrap",
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