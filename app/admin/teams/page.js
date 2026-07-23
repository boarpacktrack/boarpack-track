"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header, FooterNav } from "../../components";
import { supabase } from "../../../lib/supabase";

const initialForm = {
  club_id: "",
  team_name: "",
  age_group: "",
  season: "2026/27",
  is_active: true,
};

const MAX_SQUAD_SIZE = 30;

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [playerCounts, setPlayerCounts] = useState({});
  const [form, setForm] = useState(initialForm);

  const [showForm, setShowForm] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [archivingId, setArchivingId] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadSquadsPage();
  }, []);

  async function loadSquadsPage() {
    setLoading(true);
    setErrorMessage("");

    const [teamsResult, clubsResult, playersResult] = await Promise.all([
      supabase
        .from("teams")
        .select("*")
        .order("is_active", { ascending: false })
        .order("team_name", { ascending: true }),

      supabase.from("clubs").select("*").order("Name"),

      supabase.from("Players").select("team_id"),
    ]);

    if (teamsResult.error) {
      console.error("Squads error:", teamsResult.error);

      setErrorMessage(
        `Could not load squads: ${teamsResult.error.message}`
      );

      setLoading(false);
      return;
    }

    if (clubsResult.error) {
      console.error("Clubs error:", clubsResult.error);

      setErrorMessage(
        `Could not load clubs: ${clubsResult.error.message}`
      );

      setLoading(false);
      return;
    }

    if (playersResult.error) {
      console.error("Player count error:", playersResult.error);

      setErrorMessage(
        `Could not load player numbers: ${playersResult.error.message}`
      );

      setLoading(false);
      return;
    }

    const counts = {};

    (playersResult.data || []).forEach((player) => {
      if (player.team_id !== null && player.team_id !== undefined) {
        const teamId = String(player.team_id);

        counts[teamId] = (counts[teamId] || 0) + 1;
      }
    });

    setTeams(teamsResult.data || []);
    setClubs(clubsResult.data || []);
    setPlayerCounts(counts);
    setLoading(false);
  }

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function openAddForm() {
    setForm(initialForm);
    setEditingTeamId(null);
    setErrorMessage("");
    setSuccessMessage("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function openEditForm(team) {
    setForm({
      club_id: String(team.club_id ?? ""),
      team_name: team.team_name ?? "",
      age_group: team.age_group ?? "",
      season: team.season ?? "",
      is_active: Boolean(team.is_active),
    });

    setEditingTeamId(team.id);
    setErrorMessage("");
    setSuccessMessage("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setForm(initialForm);
    setEditingTeamId(null);
    setErrorMessage("");
    setShowForm(false);
  }

  async function saveSquad(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!form.club_id) {
      setErrorMessage("Please choose a club.");
      return;
    }

    if (!form.team_name.trim()) {
      setErrorMessage("Please enter a squad name.");
      return;
    }

    if (!form.age_group.trim()) {
      setErrorMessage("Please enter an age group.");
      return;
    }

    if (!form.season.trim()) {
      setErrorMessage("Please enter a season.");
      return;
    }

    setSaving(true);

    const squadDetails = {
      club_id: Number(form.club_id),
      team_name: form.team_name.trim(),
      age_group: form.age_group.trim(),
      season: form.season.trim(),
      is_active: form.is_active,
    };

    let result;

    if (editingTeamId) {
      result = await supabase
        .from("teams")
        .update(squadDetails)
        .eq("id", editingTeamId);
    } else {
      result = await supabase
        .from("teams")
        .insert([squadDetails]);
    }

    if (result.error) {
      console.error("Save squad error:", result.error);

      setErrorMessage(
        `Could not save squad: ${result.error.message}`
      );

      setSaving(false);
      return;
    }

    setSuccessMessage(
      editingTeamId
        ? `${form.team_name.trim()} has been updated.`
        : `${form.team_name.trim()} has been added.`
    );

    setForm(initialForm);
    setEditingTeamId(null);
    setShowForm(false);
    setSaving(false);

    await loadSquadsPage();
  }

  async function archiveSquad(team) {
    const playerCount = getPlayerCount(team.id);

    const warning =
      playerCount > 0
        ? `${team.team_name} currently has ${playerCount} player${
            playerCount === 1 ? "" : "s"
          } linked to it.\n\nArchiving will not delete the squad or its players. Continue?`
        : `Archive ${team.team_name}?\n\nNothing will be deleted.`;

    const confirmed = window.confirm(warning);

    if (!confirmed) {
      return;
    }

    setArchivingId(team.id);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("teams")
      .update({
        is_active: false,
      })
      .eq("id", team.id);

    if (error) {
      console.error("Archive squad error:", error);

      setErrorMessage(
        `Could not archive squad: ${error.message}`
      );

      setArchivingId(null);
      return;
    }

    setSuccessMessage(
      `${team.team_name} has been archived. No records were deleted.`
    );

    setArchivingId(null);

    await loadSquadsPage();
  }

  async function restoreSquad(team) {
    const confirmed = window.confirm(
      `Restore ${team.team_name} and make it active again?`
    );

    if (!confirmed) {
      return;
    }

    setArchivingId(team.id);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("teams")
      .update({
        is_active: true,
      })
      .eq("id", team.id);

    if (error) {
      console.error("Restore squad error:", error);

      setErrorMessage(
        `Could not restore squad: ${error.message}`
      );

      setArchivingId(null);
      return;
    }

    setSuccessMessage(
      `${team.team_name} has been restored.`
    );

    setArchivingId(null);

    await loadSquadsPage();
  }

  function getClubName(clubId) {
    const club = clubs.find(
      (item) => String(item.id) === String(clubId)
    );

    return club?.Name || "Unknown club";
  }

  function getPlayerCount(teamId) {
    return playerCounts[String(teamId)] || 0;
  }

  function getPlayerCountColour(count) {
    if (count >= MAX_SQUAD_SIZE) {
      return "#ff9b9b";
    }

    if (count >= 25) {
      return "#facc15";
    }

    return "#8df0b3";
  }

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    background: "#111827",
    color: "white",
    border: "1px solid #48536a",
    borderRadius: "10px",
    padding: "12px",
    fontSize: "16px",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    color: "#d4af37",
    fontWeight: "800",
    marginBottom: "7px",
  };

  return (
    <>
      <Header />

      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px",
          paddingBottom: "110px",
        }}
      >
        <section
          style={{
            background: "#1b2333",
            border: "2px solid #d4af37",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              color: "#d4af37",
              fontWeight: "700",
              fontSize: "14px",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            BOAR PACK TRACK
          </div>

          <h1
            style={{
              color: "white",
              fontSize: "46px",
              margin: "8px 0",
            }}
          >
            Squads
          </h1>

          <p
            style={{
              color: "#d9d9d9",
              margin: 0,
            }}
          >
            Create and manage rugby squads for every club.
          </p>
        </section>

        {successMessage && (
          <div
            style={{
              background: "rgba(34, 197, 94, 0.14)",
              color: "#8df0b3",
              border: "1px solid #22c55e",
              borderRadius: "12px",
              padding: "14px",
              marginBottom: "18px",
              fontWeight: "700",
            }}
          >
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              background: "#4a1f24",
              color: "#ffd7da",
              border: "1px solid #d9534f",
              borderRadius: "12px",
              padding: "14px",
              marginBottom: "18px",
            }}
          >
            {errorMessage}
          </div>
        )}
                {showForm && (
          <section
            style={{
              background: "#1b2333",
              border: "1px solid #d4af37",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2
                  style={{
                    color: "#d4af37",
                    margin: "0 0 5px",
                  }}
                >
                  {editingTeamId ? "Edit Squad" : "Add Squad"}
                </h2>

                <p
                  style={{
                    color: "#d9d9d9",
                    margin: 0,
                  }}
                >
                  {editingTeamId
                    ? "Update this squad's details."
                    : "Add a new rugby squad to a club."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                style={{
                  background: "transparent",
                  color: "white",
                  border: "1px solid #697386",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontWeight: "700",
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
            </div>

            <form onSubmit={saveSquad}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "18px",
                }}
              >
                <div>
                  <label htmlFor="club_id" style={labelStyle}>
                    Club
                  </label>

                  <select
                    id="club_id"
                    name="club_id"
                    value={form.club_id}
                    onChange={updateField}
                    style={inputStyle}
                  >
                    <option value="">Choose a club</option>

                    {clubs.map((club) => (
                      <option key={club.id} value={club.id}>
                        {club.Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="team_name" style={labelStyle}>
                    Squad Name
                  </label>

                  <input
                    id="team_name"
                    name="team_name"
                    type="text"
                    value={form.team_name}
                    onChange={updateField}
                    placeholder="Example: Under 14s"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label htmlFor="age_group" style={labelStyle}>
                    Age Group
                  </label>

                  <input
                    id="age_group"
                    name="age_group"
                    type="text"
                    value={form.age_group}
                    onChange={updateField}
                    placeholder="Example: U14"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label htmlFor="season" style={labelStyle}>
                    Season
                  </label>

                  <input
                    id="season"
                    name="season"
                    type="text"
                    value={form.season}
                    onChange={updateField}
                    placeholder="Example: 2026/27"
                    style={inputStyle}
                  />
                </div>
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "white",
                  marginTop: "20px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                <input
                  name="is_active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={updateField}
                  style={{
                    width: "18px",
                    height: "18px",
                  }}
                />

                Squad is active
              </label>

              <button
                type="submit"
                disabled={saving}
                style={{
                  width: "100%",
                  background: "#d4af37",
                  color: "#111827",
                  border: "none",
                  borderRadius: "11px",
                  padding: "14px 18px",
                  marginTop: "22px",
                  fontWeight: "900",
                  fontSize: "16px",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.65 : 1,
                }}
              >
                {saving
                  ? "Saving Squad..."
                  : editingTeamId
                  ? "Save Changes"
                  : "Save Squad"}
              </button>
            </form>
          </section>
        )}

        <section
          style={{
            background: "#1b2333",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2
                style={{
                  color: "#d4af37",
                  margin: "0 0 6px",
                }}
              >
                Club Squads
              </h2>

              <p
                style={{
                  color: "#d9d9d9",
                  margin: 0,
                }}
              >
                {loading
                  ? "Loading squads..."
                  : `${teams.length} squad${
                      teams.length === 1 ? "" : "s"
                    } found`}
              </p>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              disabled={showForm}
              style={{
                background: "#d4af37",
                color: "#111827",
                border: "none",
                borderRadius: "10px",
                padding: "12px 18px",
                fontWeight: "800",
                fontSize: "15px",
                cursor: showForm ? "not-allowed" : "pointer",
                opacity: showForm ? 0.6 : 1,
              }}
            >
              + Add Squad
            </button>
          </div>

          {loading && (
            <div
              style={{
                color: "white",
                textAlign: "center",
                padding: "40px 20px",
              }}
            >
              Loading squads...
            </div>
          )}

          {!loading && teams.length === 0 && (
            <div
              style={{
                background: "#111827",
                border: "1px dashed #d4af37",
                borderRadius: "12px",
                padding: "32px 20px",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  color: "#d4af37",
                  marginTop: 0,
                }}
              >
                No squads found
              </h3>

              <p
                style={{
                  color: "#d9d9d9",
                  marginBottom: 0,
                }}
              >
                Use the Add Squad button to create your first squad.
              </p>
            </div>
          )}

          {!loading && teams.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "16px",
              }}
            >
              {teams.map((team) => {
                const playerCount = getPlayerCount(team.id);
                const playerColour =
                  getPlayerCountColour(playerCount);

                const isProcessing = archivingId === team.id;

                return (
                  <article
                    key={team.id}
                    style={{
                      background: team.is_active
                        ? "#111827"
                        : "#171717",
                      border: team.is_active
                        ? "1px solid #38445a"
                        : "1px solid #6b3c3c",
                      borderRadius: "14px",
                      padding: "18px",
                      opacity: team.is_active ? 1 : 0.75,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px",
                        marginBottom: "14px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: "#d4af37",
                            fontSize: "13px",
                            fontWeight: "800",
                            textTransform: "uppercase",
                            letterSpacing: "0.7px",
                            marginBottom: "5px",
                          }}
                        >
                          {getClubName(team.club_id)}
                        </div>

                        <h3
                          style={{
                            color: "white",
                            fontSize: "24px",
                            margin: 0,
                          }}
                        >
                          {team.team_name}
                        </h3>
                      </div>

                      <span
                        style={{
                          background: team.is_active
                            ? "rgba(34, 197, 94, 0.16)"
                            : "rgba(239, 68, 68, 0.16)",
                          color: team.is_active
                            ? "#6ee7a2"
                            : "#ff9b9b",
                          border: `1px solid ${
                            team.is_active
                              ? "#22c55e"
                              : "#ef4444"
                          }`,
                          borderRadius: "999px",
                          padding: "5px 9px",
                          fontSize: "12px",
                          fontWeight: "800",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {team.is_active ? "Active" : "Archived"}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(3, minmax(0, 1fr))",
                        gap: "10px",
                      }}
                    >
                                          <div
                        style={{
                          background: "#1b2333",
                          borderRadius: "10px",
                          padding: "11px",
                        }}
                      >
                        <div
                          style={{
                            color: "#9ca3af",
                            fontSize: "12px",
                            marginBottom: "4px",
                          }}
                        >
                          Age Group
                        </div>

                        <div
                          style={{
                            color: "white",
                            fontWeight: "700",
                          }}
                        >
                          {team.age_group || "Not set"}
                        </div>
                      </div>

                      <div
                        style={{
                          background: "#1b2333",
                          borderRadius: "10px",
                          padding: "11px",
                        }}
                      >
                        <div
                          style={{
                            color: "#9ca3af",
                            fontSize: "12px",
                            marginBottom: "4px",
                          }}
                        >
                          Season
                        </div>

                        <div
                          style={{
                            color: "white",
                            fontWeight: "700",
                          }}
                        >
                          {team.season || "Not set"}
                        </div>
                      </div>

                      <div
                        style={{
                          background: "#1b2333",
                          borderRadius: "10px",
                          padding: "11px",
                        }}
                      >
                        <div
                          style={{
                            color: "#9ca3af",
                            fontSize: "12px",
                            marginBottom: "4px",
                          }}
                        >
                          Players
                        </div>

                        <div
                          style={{
                            color: playerColour,
                            fontWeight: "900",
                          }}
                        >
                          {playerCount} / {MAX_SQUAD_SIZE}
                        </div>
                      </div>
                    

                    {playerCount >= MAX_SQUAD_SIZE && (
                      <div
                        style={{
                          background: "rgba(239, 68, 68, 0.12)",
                          color: "#ffb0b0",
                          border: "1px solid #ef4444",
                          borderRadius: "9px",
                          padding: "9px",
                          marginTop: "12px",
                          fontSize: "13px",
                          fontWeight: "700",
                        }}
                      >
                        This squad has reached 30 players.
                      </div>
                    )}
</div>
<Link
  href={`/admin/teams/${team.id}`}
  style={{
    display: "block",
    background: "#d4af37",
    color: "#111827",
    border: "none",
    borderRadius: "10px",
    padding: "12px",
    marginTop: "16px",
    textAlign: "center",
    textDecoration: "none",
    fontWeight: "900",
  }}
>
  🐗 Open Squad Dashboard
</Link>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "10px",
                        marginTop: "16px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => openEditForm(team)}
                        disabled={saving || isProcessing}
                        style={{
                          background: "#26344c",
                          color: "white",
                          border: "1px solid #64748b",
                          borderRadius: "10px",
                          padding: "11px",
                          fontWeight: "800",
                          cursor:
                            saving || isProcessing
                              ? "not-allowed"
                              : "pointer",
                          opacity:
                            saving || isProcessing ? 0.6 : 1,
                        }}
                      >
                        ✏️ Edit Squad
                      </button>

                      {team.is_active ? (
                        <button
                          type="button"
                          onClick={() => archiveSquad(team)}
                          disabled={saving || isProcessing}
                          style={{
                            background: "rgba(239, 68, 68, 0.12)",
                            color: "#ffb0b0",
                            border: "1px solid #ef4444",
                            borderRadius: "10px",
                            padding: "11px",
                            fontWeight: "800",
                            cursor:
                              saving || isProcessing
                                ? "not-allowed"
                                : "pointer",
                            opacity:
                              saving || isProcessing ? 0.6 : 1,
                          }}
                        >
                          {isProcessing
                            ? "Archiving..."
                            : "📦 Archive Squad"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => restoreSquad(team)}
                          disabled={saving || isProcessing}
                          style={{
                            background: "rgba(34, 197, 94, 0.14)",
                            color: "#8df0b3",
                            border: "1px solid #22c55e",
                            borderRadius: "10px",
                            padding: "11px",
                            fontWeight: "800",
                            cursor:
                              saving || isProcessing
                                ? "not-allowed"
                                : "pointer",
                            opacity:
                              saving || isProcessing ? 0.6 : 1,
                          }}
                        >
                          {isProcessing
                            ? "Restoring..."
                            : "♻️ Restore Squad"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <FooterNav />
    </>
  );
}