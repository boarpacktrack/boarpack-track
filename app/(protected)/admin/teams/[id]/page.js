"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header, FooterNav } from "@/components";
import { supabase } from "@/lib/supabase";

const MAX_SQUAD_SIZE = 30;

export default function SquadDashboardPage() {
  const params = useParams();
  const squadId = params?.id;

  const [squad, setSquad] = useState(null);
  const [club, setClub] = useState(null);
  const [players, setPlayers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (squadId) {
      loadSquadDashboard();
    }
  }, [squadId]);

  async function loadSquadDashboard() {
    setLoading(true);
    setErrorMessage("");

    const squadResult = await supabase
      .from("teams")
      .select("*")
      .eq("id", squadId)
      .single();

    if (squadResult.error) {
      console.error("Squad dashboard error:", squadResult.error);

      setErrorMessage(
        `Could not load this squad: ${squadResult.error.message}`
      );

      setLoading(false);
      return;
    }

    const squadData = squadResult.data;

    const [clubResult, playersResult] = await Promise.all([
      supabase
        .from("clubs")
        .select("*")
        .eq("id", squadData.club_id)
        .single(),

     supabase
  .from("Players")
  .select("*")
  .eq("team_id", squadId),
    ]);

    if (clubResult.error) {
      console.error("Squad club error:", clubResult.error);

      setErrorMessage(
        `The squad loaded, but its club could not be loaded: ${clubResult.error.message}`
      );

      setLoading(false);
      return;
    }

    if (playersResult.error) {
      console.error("Squad players error:", playersResult.error);

      setErrorMessage(
        `The squad loaded, but its players could not be loaded: ${playersResult.error.message}`
      );

      setLoading(false);
      return;
    }

    setSquad(squadData);
    setClub(clubResult.data);
    setPlayers(playersResult.data || []);
    setLoading(false);
  }

  const playerCount = players.length;

  function getPlayerCountColour() {
    if (playerCount >= MAX_SQUAD_SIZE) {
      return "#ff9b9b";
    }

    if (playerCount >= 25) {
      return "#facc15";
    }

    return "#8df0b3";
  }

  const dashboardItems = [
    {
      title: "Players",
      description: "View and manage players in this squad.",
      icon: "👥",
    },
    {
      title: "Attendance",
      description: "Manage training and match attendance.",
      icon: "📅",
    },
    {
      title: "Matches",
      description: "View fixtures, results and match records.",
      icon: "🏉",
    },
    {
      title: "Awards",
      description: "View player awards for this squad.",
      icon: "⭐",
    },
    {
      title: "Development",
      description: "Open the player development tracker.",
      icon: "📈",
    },
    {
      title: "Targets",
      description: "Review and manage player targets.",
      icon: "🎯",
    },
    {
      title: "Achievements",
      description: "View squad and player achievements.",
      icon: "🏆",
    },
    {
      title: "Squad Settings",
      description: "Edit squad details and season settings.",
      icon: "⚙️",
    },
  ];

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
        <Link
          href="/admin/teams"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#d4af37",
            textDecoration: "none",
            fontWeight: "800",
            marginBottom: "18px",
          }}
        >
          ← Back to Squads
        </Link>

        {loading && (
          <section
            style={{
              background: "#1b2333",
              border: "2px solid #d4af37",
              borderRadius: "16px",
              padding: "40px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: "white",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              Loading squad dashboard...
            </div>
          </section>
        )}

        {!loading && errorMessage && (
          <section
            style={{
              background: "#4a1f24",
              color: "#ffd7da",
              border: "1px solid #d9534f",
              borderRadius: "14px",
              padding: "20px",
            }}
          >
            <h2
              style={{
                marginTop: 0,
              }}
            >
              Squad could not be opened
            </h2>

            <p
              style={{
                marginBottom: 0,
              }}
            >
              {errorMessage}
            </p>
          </section>
        )}

        {!loading && !errorMessage && squad && (
          <>
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
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#d4af37",
                      fontWeight: "800",
                      fontSize: "14px",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                    }}
                  >
                    {club?.Name || "Unknown Club"}
                  </div>

                  <h1
                    style={{
                      color: "white",
                      fontSize: "46px",
                      margin: "0 0 8px",
                    }}
                  >
                    {squad.team_name}
                  </h1>

                  <p
                    style={{
                      color: "#d9d9d9",
                      margin: 0,
                    }}
                  >
                    Squad Dashboard
                  </p>
                </div>

                <span
                  style={{
                    background: squad.is_active
                      ? "rgba(34, 197, 94, 0.16)"
                      : "rgba(239, 68, 68, 0.16)",
                    color: squad.is_active ? "#6ee7a2" : "#ff9b9b",
                    border: `1px solid ${
                      squad.is_active ? "#22c55e" : "#ef4444"
                    }`,
                    borderRadius: "999px",
                    padding: "7px 12px",
                    fontSize: "13px",
                    fontWeight: "800",
                  }}
                >
                  {squad.is_active ? "Active Squad" : "Archived Squad"}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "12px",
                  marginTop: "24px",
                }}
              >
                <div
                  style={{
                    background: "#111827",
                    border: "1px solid #38445a",
                    borderRadius: "12px",
                    padding: "15px",
                  }}
                >
                  <div
                    style={{
                      color: "#9ca3af",
                      fontSize: "12px",
                      marginBottom: "5px",
                    }}
                  >
                    Age Group
                  </div>

                  <div
                    style={{
                      color: "white",
                      fontWeight: "800",
                      fontSize: "18px",
                    }}
                  >
                    {squad.age_group || "Not set"}
                  </div>
                </div>

                <div
                  style={{
                    background: "#111827",
                    border: "1px solid #38445a",
                    borderRadius: "12px",
                    padding: "15px",
                  }}
                >
                  <div
                    style={{
                      color: "#9ca3af",
                      fontSize: "12px",
                      marginBottom: "5px",
                    }}
                  >
                    Season
                  </div>

                  <div
                    style={{
                      color: "white",
                      fontWeight: "800",
                      fontSize: "18px",
                    }}
                  >
                    {squad.season || "Not set"}
                  </div>
                </div>

                <div
                  style={{
                    background: "#111827",
                    border: "1px solid #38445a",
                    borderRadius: "12px",
                    padding: "15px",
                  }}
                >
                  <div
                    style={{
                      color: "#9ca3af",
                      fontSize: "12px",
                      marginBottom: "5px",
                    }}
                  >
                    Players
                  </div>

                  <div
                    style={{
                      color: getPlayerCountColour(),
                      fontWeight: "900",
                      fontSize: "18px",
                    }}
                  >
                    {playerCount} / {MAX_SQUAD_SIZE}
                  </div>
                </div>
              </div>

              {playerCount >= MAX_SQUAD_SIZE && (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.12)",
                    color: "#ffb0b0",
                    border: "1px solid #ef4444",
                    borderRadius: "10px",
                    padding: "11px",
                    marginTop: "14px",
                    fontWeight: "700",
                  }}
                >
                  This squad has reached the maximum of 30 players.
                </div>
              )}
            </section>

            <section
              style={{
                background: "#1b2333",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  marginBottom: "20px",
                }}
              >
                <h2
                  style={{
                    color: "#d4af37",
                    margin: "0 0 6px",
                  }}
                >
                  Manage Squad
                </h2>

                <p
                  style={{
                    color: "#d9d9d9",
                    margin: 0,
                  }}
                >
                  Everything shown here will be linked only to{" "}
                  {squad.team_name}.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "16px",
                }}
              >
                {dashboardItems.map((item) => (
                  <article
                    key={item.title}
                    style={{
                      background: "#111827",
                      border: "1px solid #38445a",
                      borderRadius: "14px",
                      padding: "18px",
                      minHeight: "135px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "30px",
                        marginBottom: "10px",
                      }}
                    >
                      {item.icon}
                    </div>

                    <h3
                      style={{
                        color: "white",
                        margin: "0 0 7px",
                        fontSize: "20px",
                      }}
                    >
                      {item.title}
                    </h3>

                    <p
                      style={{
                        color: "#b8c0ce",
                        margin: 0,
                        lineHeight: "1.5",
                      }}
                    >
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </section>

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
                  gap: "14px",
                  flexWrap: "wrap",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <h2
                    style={{
                      color: "#d4af37",
                      margin: "0 0 6px",
                    }}
                  >
                    Squad Players
                  </h2>

                  <p
                    style={{
                      color: "#d9d9d9",
                      margin: 0,
                    }}
                  >
                    {playerCount} player
                    {playerCount === 1 ? "" : "s"} currently linked to
                    this squad.
                  </p>
                </div>
              </div>

              {players.length === 0 ? (
                <div
                  style={{
                    background: "#111827",
                    border: "1px dashed #d4af37",
                    borderRadius: "12px",
                    padding: "28px 20px",
                    textAlign: "center",
                    color: "#d9d9d9",
                  }}
                >
                  No players are currently linked to this squad.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "12px",
                  }}
                  >
{players.map((player) => (
  <Link
    key={player.id}
    href={`/players/${player.Pt_number}`}
    style={{
      display: "block",
      background: "#111827",
      border: "1px solid #38445a",
      borderRadius: "12px",
      padding: "14px",
      textDecoration: "none",
    }}
  >
    <div
      style={{
        color: "#d4af37",
        fontSize: "12px",
        fontWeight: "800",
        marginBottom: "5px",
      }}
    >
      {player.Pt_number || "No PT number"}
    </div>

    <div
      style={{
        color: "white",
        fontWeight: "800",
        fontSize: "17px",
      }}
    >
      {`${player.First_name || ""} ${player.Last_name || ""}`.trim() ||
        "Unnamed Player"}
    </div>
  </Link>
))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <FooterNav />
    </>
  );
}