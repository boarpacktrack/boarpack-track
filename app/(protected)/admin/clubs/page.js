"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ManageClubsPage() {
  const router = useRouter();

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadClubs = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.push("/login");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("Profile check error:", profileError);
      setErrorMessage("We could not confirm your user profile.");
      setLoading(false);
      return;
    }

    if (profile.role !== "super_admin") {
      router.push("/dashboard");
      return;
    }

    const { data, error } = await supabase
      .from("clubs")
      .select(
        `
          id,
          created_at,
          Name,
          short_name,
          is_active,
          sport,
          email,
          phone,
          website,
          address,
          primary_colour,
          secondary_colour,
          logo_url,
          demo_club,
          created_by
        `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load clubs error:", error);
      setErrorMessage(error.message);
      setClubs([]);
      setLoading(false);
      return;
    }

    setClubs(data || []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadClubs();
  }, [loadClubs]);

  const filteredClubs = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return clubs.filter((club) => {
      const clubName = club.Name || "";
      const shortName = club.short_name || "";
      const sport = club.sport || "";

      const matchesSearch =
        !search ||
        clubName.toLowerCase().includes(search) ||
        shortName.toLowerCase().includes(search) ||
        sport.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "live" && !club.demo_club) ||
        (statusFilter === "demo" && club.demo_club) ||
        (statusFilter === "active" && club.is_active) ||
        (statusFilter === "archived" && !club.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [clubs, searchTerm, statusFilter]);

  const totals = useMemo(() => {
    return {
      total: clubs.length,
      live: clubs.filter((club) => !club.demo_club).length,
      demo: clubs.filter((club) => club.demo_club).length,
      active: clubs.filter((club) => club.is_active).length,
      archived: clubs.filter((club) => !club.is_active).length,
    };
  }, [clubs]);

  async function toggleClubStatus(club) {
    const newStatus = !club.is_active;

    const actionText = newStatus ? "restore" : "archive";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} ${club.Name}?`
    );

    if (!confirmed) {
      return;
    }

    setUpdatingId(club.id);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("clubs")
      .update({
        is_active: newStatus,
      })
      .eq("id", club.id);

    if (error) {
      console.error("Update club status error:", error);
      setErrorMessage(error.message);
      setUpdatingId(null);
      return;
    }

    setClubs((currentClubs) =>
      currentClubs.map((currentClub) =>
        currentClub.id === club.id
          ? {
              ...currentClub,
              is_active: newStatus,
            }
          : currentClub
      )
    );

    setSuccessMessage(
      `${club.Name} has been ${newStatus ? "restored" : "archived"}.`
    );

    setUpdatingId(null);
  }

  function showComingNext(feature, clubName) {
    window.alert(
      `${feature} for ${clubName} is the next page we will connect.`
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.container}>
        <button
          type="button"
          style={styles.backButton}
          onClick={() => router.push("/dashboard")}
        >
          ← Back to Command Centre
        </button>

        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>SUPER ADMIN</p>

            <h1 style={styles.title}>Manage Clubs</h1>

            <p style={styles.subtitle}>
              View and control every live and demonstration club using Boar Pack
              Track.
            </p>
          </div>

          <button
            type="button"
            style={styles.addButton}
            onClick={() => router.push("/admin/clubs/new")}
          >
            + Add New Club
          </button>
        </header>

        <section style={styles.statsGrid}>
          <StatCard label="Total Clubs" value={totals.total} icon="🏉" />
          <StatCard label="Live Clubs" value={totals.live} icon="🟢" />
          <StatCard label="Demo Clubs" value={totals.demo} icon="🔵" />
          <StatCard label="Active" value={totals.active} icon="✅" />
          <StatCard label="Archived" value={totals.archived} icon="📦" />
        </section>

        <section style={styles.controlsPanel}>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by club name, short name or sport..."
            style={styles.searchInput}
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All clubs</option>
            <option value="live">Live clubs</option>
            <option value="demo">Demo clubs</option>
            <option value="active">Active clubs</option>
            <option value="archived">Archived clubs</option>
          </select>

          <button
            type="button"
            style={styles.refreshButton}
            onClick={loadClubs}
          >
            Refresh
          </button>
        </section>

        {errorMessage && (
          <div style={styles.errorBox}>
            <strong>Unable to load clubs</strong>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div style={styles.successBox}>{successMessage}</div>
        )}

        {loading ? (
          <section style={styles.loadingPanel}>
            <div style={styles.loadingSpinner}>🏉</div>
            <p>Loading clubs...</p>
          </section>
        ) : filteredClubs.length === 0 ? (
          <section style={styles.emptyPanel}>
            <span style={styles.emptyIcon}>🏟️</span>

            <h2 style={styles.emptyTitle}>No clubs found</h2>

            <p style={styles.emptyText}>
              Try changing the search or filter, or create a new club.
            </p>

            <button
              type="button"
              style={styles.addButton}
              onClick={() => router.push("/admin/clubs/new")}
            >
              + Add New Club
            </button>
          </section>
        ) : (
          <section style={styles.clubGrid}>
            {filteredClubs.map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                updating={updatingId === club.id}
                onToggleStatus={() => toggleClubStatus(club)}
                onOpen={() => showComingNext("Open Club", club.Name)}
                onEdit={() => showComingNext("Edit Club", club.Name)}
                onAddAdmin={() =>
                  showComingNext("Add Club Admin", club.Name)
                }
              />
            ))}
          </section>
        )}
      </section>
    </main>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <article style={styles.statCard}>
      <span style={styles.statIcon}>{icon}</span>

      <div>
        <strong style={styles.statValue}>{value}</strong>
        <span style={styles.statLabel}>{label}</span>
      </div>
    </article>
  );
}

function ClubCard({
  club,
  updating,
  onToggleStatus,
  onOpen,
  onEdit,
  onAddAdmin,
}) {
  const primaryColour = club.primary_colour || "#0b2857";
  const secondaryColour = club.secondary_colour || "#f5b800";

  const clubInitial =
    club.Name && club.Name.trim()
      ? club.Name.trim().charAt(0).toUpperCase()
      : "C";

  return (
    <article
      style={{
        ...styles.clubCard,
        borderTopColor: secondaryColour,
      }}
    >
      <div
        style={{
          ...styles.clubBanner,
          background: `linear-gradient(135deg, ${primaryColour}, #071326)`,
        }}
      >
        <div style={styles.logoArea}>
          {club.logo_url ? (
            <img
              src={club.logo_url}
              alt={`${club.Name} logo`}
              style={styles.clubLogo}
            />
          ) : (
            <div
              style={{
                ...styles.logoPlaceholder,
                borderColor: secondaryColour,
                color: secondaryColour,
              }}
            >
              {clubInitial}
            </div>
          )}
        </div>

        <div style={styles.bannerBadges}>
          <span
            style={{
              ...styles.badge,
              background: club.demo_club
                ? "rgba(56,189,248,0.18)"
                : "rgba(74,222,128,0.18)",
              color: club.demo_club ? "#7dd3fc" : "#86efac",
            }}
          >
            {club.demo_club ? "DEMO CLUB" : "LIVE CLUB"}
          </span>

          <span
            style={{
              ...styles.badge,
              background: club.is_active
                ? "rgba(74,222,128,0.18)"
                : "rgba(248,113,113,0.18)",
              color: club.is_active ? "#86efac" : "#fca5a5",
            }}
          >
            {club.is_active ? "ACTIVE" : "ARCHIVED"}
          </span>
        </div>
      </div>

      <div style={styles.clubBody}>
        <div style={styles.clubHeadingRow}>
          <div>
            <h2 style={styles.clubName}>{club.Name}</h2>

            <p style={styles.shortName}>
              {club.short_name || "No short name recorded"}
            </p>
          </div>

          <div style={styles.clubId}>ID {club.id}</div>
        </div>

        <div style={styles.detailsGrid}>
          <DetailItem label="Sport" value={club.sport || "Not recorded"} />

          <DetailItem
            label="Created"
            value={formatDate(club.created_at)}
          />

          <DetailItem
            label="Email"
            value={club.email || "Not recorded"}
          />

          <DetailItem
            label="Phone"
            value={club.phone || "Not recorded"}
          />
        </div>

        {club.website && (
          <div style={styles.websiteRow}>
            <span style={styles.detailLabel}>Website</span>
            <span style={styles.websiteText}>{club.website}</span>
          </div>
        )}

        <div style={styles.colourStrip}>
          <div style={styles.colourItem}>
            <span
              style={{
                ...styles.colourSwatch,
                background: primaryColour,
              }}
            />
            <span>Primary</span>
          </div>

          <div style={styles.colourItem}>
            <span
              style={{
                ...styles.colourSwatch,
                background: secondaryColour,
              }}
            />
            <span>Secondary</span>
          </div>
        </div>

        <div style={styles.primaryActions}>
          <button
            type="button"
            style={styles.openButton}
            onClick={onOpen}
          >
            Open Club
          </button>

          <button
            type="button"
            style={styles.adminButton}
            onClick={onAddAdmin}
          >
            Add Club Admin
          </button>
        </div>

        <div style={styles.secondaryActions}>
          <button
            type="button"
            style={styles.editButton}
            onClick={onEdit}
          >
            Edit
          </button>

          <button
            type="button"
            style={
              club.is_active
                ? styles.archiveButton
                : styles.restoreButton
            }
            onClick={onToggleStatus}
            disabled={updating}
          >
            {updating
              ? "Updating..."
              : club.is_active
                ? "Archive"
                : "Restore"}
          </button>
        </div>
      </div>
    </article>
  );
}

function DetailItem({ label, value }) {
  return (
    <div style={styles.detailItem}>
      <span style={styles.detailLabel}>{label}</span>
      <strong style={styles.detailValue}>{value}</strong>
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return "Not recorded";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "34px 22px 120px",
    background:
      "linear-gradient(145deg, #071326 0%, #0b2857 52%, #071326 100%)",
    color: "#ffffff",
  },

  container: {
    width: "100%",
    maxWidth: "1220px",
    margin: "0 auto",
  },

  backButton: {
    marginBottom: "22px",
    padding: 0,
    border: "none",
    background: "transparent",
    color: "#f5b800",
    fontWeight: "900",
    cursor: "pointer",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "24px",
    marginBottom: "26px",
    flexWrap: "wrap",
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
    fontSize: "clamp(36px, 6vw, 58px)",
    lineHeight: 1,
  },

  subtitle: {
    maxWidth: "700px",
    margin: "14px 0 0",
    color: "#cbd8ec",
    fontSize: "17px",
    lineHeight: 1.5,
  },

  addButton: {
    padding: "14px 20px",
    border: "none",
    borderRadius: "13px",
    background: "#f5b800",
    color: "#071326",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(245,184,0,0.2)",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
    gap: "14px",
    marginBottom: "22px",
  },

  statCard: {
    minHeight: "92px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    border: "1px solid rgba(255,255,255,0.11)",
    borderRadius: "17px",
    background: "rgba(255,255,255,0.07)",
  },

  statIcon: {
    fontSize: "24px",
  },

  statValue: {
    display: "block",
    color: "#f5b800",
    fontSize: "25px",
    lineHeight: 1,
  },

  statLabel: {
    display: "block",
    marginTop: "6px",
    color: "#d8e2f0",
    fontSize: "13px",
    fontWeight: "700",
  },

  controlsPanel: {
    marginBottom: "22px",
    padding: "16px",
    display: "grid",
    gridTemplateColumns: "minmax(220px, 1fr) minmax(180px, 240px) auto",
    gap: "12px",
    border: "1px solid rgba(255,255,255,0.11)",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.06)",
  },

  searchInput: {
    width: "100%",
    padding: "13px 14px",
    border: "1px solid rgba(255,255,255,0.17)",
    borderRadius: "12px",
    background: "rgba(4,18,43,0.85)",
    color: "#ffffff",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  filterSelect: {
    width: "100%",
    padding: "13px 14px",
    border: "1px solid rgba(255,255,255,0.17)",
    borderRadius: "12px",
    background: "#081b3a",
    color: "#ffffff",
    fontSize: "15px",
  },

  refreshButton: {
    padding: "12px 17px",
    border: "1px solid rgba(255,255,255,0.19)",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.07)",
    color: "#ffffff",
    fontWeight: "900",
    cursor: "pointer",
  },

  errorBox: {
    marginBottom: "20px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    border: "1px solid rgba(248,113,113,0.5)",
    borderRadius: "14px",
    background: "rgba(185,28,28,0.26)",
    color: "#fecaca",
  },

  successBox: {
    marginBottom: "20px",
    padding: "16px",
    border: "1px solid rgba(74,222,128,0.5)",
    borderRadius: "14px",
    background: "rgba(22,101,52,0.26)",
    color: "#bbf7d0",
    fontWeight: "800",
  },

  loadingPanel: {
    minHeight: "260px",
    display: "grid",
    placeItems: "center",
    alignContent: "center",
    gap: "10px",
    border: "1px solid rgba(255,255,255,0.11)",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.06)",
    color: "#dce7f6",
    fontWeight: "800",
  },

  loadingSpinner: {
    fontSize: "36px",
  },

  emptyPanel: {
    minHeight: "300px",
    padding: "35px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    border: "1px solid rgba(255,255,255,0.11)",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.06)",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "42px",
  },

  emptyTitle: {
    margin: "14px 0 6px",
  },

  emptyText: {
    margin: "0 0 20px",
    color: "#cbd8ec",
  },

  clubGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))",
    gap: "20px",
  },

  clubCard: {
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.13)",
    borderTop: "5px solid",
    borderRadius: "22px",
    background: "rgba(5,20,48,0.96)",
    boxShadow: "0 18px 38px rgba(0,0,0,0.24)",
  },

  clubBanner: {
    minHeight: "130px",
    padding: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "14px",
  },

  logoArea: {
    minWidth: "70px",
  },

  clubLogo: {
    width: "72px",
    height: "72px",
    objectFit: "contain",
    borderRadius: "15px",
    background: "#ffffff",
    padding: "6px",
    boxSizing: "border-box",
  },

  logoPlaceholder: {
    width: "68px",
    height: "68px",
    display: "grid",
    placeItems: "center",
    border: "3px solid",
    borderRadius: "50%",
    background: "rgba(0,0,0,0.25)",
    fontSize: "29px",
    fontWeight: "900",
  },

  bannerBadges: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "7px",
  },

  badge: {
    padding: "7px 10px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "1px",
  },

  clubBody: {
    padding: "21px",
  },

  clubHeadingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "14px",
    marginBottom: "18px",
  },

  clubName: {
    margin: 0,
    color: "#ffffff",
    fontSize: "24px",
  },

  shortName: {
    margin: "6px 0 0",
    color: "#aebdd1",
    fontSize: "14px",
  },

  clubId: {
    padding: "6px 9px",
    borderRadius: "9px",
    background: "rgba(255,255,255,0.07)",
    color: "#f5b800",
    fontSize: "11px",
    fontWeight: "900",
    whiteSpace: "nowrap",
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "11px",
  },

  detailItem: {
    minHeight: "66px",
    padding: "11px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.055)",
  },

  detailLabel: {
    color: "#f5b800",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
  },

  detailValue: {
    color: "#eef4fc",
    fontSize: "13px",
    overflowWrap: "anywhere",
  },

  websiteRow: {
    marginTop: "11px",
    padding: "11px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.055)",
  },

  websiteText: {
    color: "#dbe6f5",
    fontSize: "13px",
    overflowWrap: "anywhere",
  },

  colourStrip: {
    marginTop: "15px",
    padding: "12px",
    display: "flex",
    gap: "22px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.045)",
    color: "#cbd8ec",
    fontSize: "12px",
    fontWeight: "800",
  },

  colourItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  colourSwatch: {
    width: "19px",
    height: "19px",
    display: "block",
    border: "1px solid rgba(255,255,255,0.4)",
    borderRadius: "5px",
  },

  primaryActions: {
    marginTop: "18px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },

  secondaryActions: {
    marginTop: "10px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },

  openButton: {
    padding: "12px",
    border: "none",
    borderRadius: "11px",
    background: "#f5b800",
    color: "#071326",
    fontWeight: "900",
    cursor: "pointer",
  },

  adminButton: {
    padding: "12px",
    border: "1px solid rgba(245,184,0,0.55)",
    borderRadius: "11px",
    background: "rgba(245,184,0,0.1)",
    color: "#f5b800",
    fontWeight: "900",
    cursor: "pointer",
  },

  editButton: {
    padding: "11px",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "11px",
    background: "rgba(255,255,255,0.06)",
    color: "#ffffff",
    fontWeight: "900",
    cursor: "pointer",
  },

  archiveButton: {
    padding: "11px",
    border: "1px solid rgba(248,113,113,0.4)",
    borderRadius: "11px",
    background: "rgba(185,28,28,0.18)",
    color: "#fca5a5",
    fontWeight: "900",
    cursor: "pointer",
  },

  restoreButton: {
    padding: "11px",
    border: "1px solid rgba(74,222,128,0.4)",
    borderRadius: "11px",
    background: "rgba(22,101,52,0.18)",
    color: "#86efac",
    fontWeight: "900",
    cursor: "pointer",
  },
};