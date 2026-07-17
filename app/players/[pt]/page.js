import { Header, FooterNav } from "../../components";
import { supabase } from "../../../lib/supabase";

async function getPlayer(pt) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("Players")
    .select("*")
    .eq("Pt_number", pt)
    .single();

  if (error) {
    console.error("Player loading error:", error);
    return null;
  }

  return data;
}

async function getAchievements(playerId) {
  if (!supabase || !playerId) return [];

  const { data, error } = await supabase
    .from("player_achievements")
    .select("*")
    .eq("player_id", playerId)
    .order("achievement_date", { ascending: false });

  if (error) {
    console.error("Achievement loading error:", error);
    return [];
  }

  return data || [];
}

function formatAchievementDate(dateValue) {
  if (!dateValue) return "Date not recorded";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateValue}T12:00:00`));
}

export default async function PlayerProfile({ params }) {
  const { pt } = await params;
  const player = await getPlayer(pt);

  if (!player) {
    return (
      <main className="app">
        <Header active="Players" />

        <a
          href="/players"
          style={{
            display: "inline-block",
            margin: "14px 0",
            color: "#f5b51b",
            fontWeight: "bold",
          }}
        >
          ← Back to Players
        </a>

        <section className="panel" style={{ marginTop: "16px" }}>
          <h2>Player not found</h2>

          <p className="small">
            Check the PT number or import the squad data.
          </p>
        </section>

        <FooterNav />
      </main>
    );
  }

  const achievements = await getAchievements(player.id);
const achievementStats = {
  total: achievements.length,

  featured: achievements.filter(
    (achievement) => achievement.is_featured
  ).length,

  captain: achievements.filter(
    (achievement) =>
      achievement.achievement_type === "Captain Appointed"
  ).length,

  coachesPlayer: achievements.filter(
    (achievement) =>
      achievement.achievement_type === "Coaches Player"
  ).length,

  magicMoment: achievements.filter(
    (achievement) =>
      achievement.achievement_type === "Magic Moment"
  ).length,

  mostImproved: achievements.filter(
    (achievement) =>
      achievement.achievement_type === "Most Improved"
  ).length,
};

const latestAchievement = achievements[0] || null;
  const ratings = [
    player.Speed,
    player.Handling,
    player.Passing,
    player.Tackling,
    player.Game_IQ,
    player.Fitness,
    player.Leadership,
    player.Defence,
    player.Kicking,
  ].filter((value) => typeof value === "number");

  const overall = ratings.length
    ? Math.round(
        ratings.reduce((total, value) => total + value, 0) /
          ratings.length
      )
    : 0;

  const topStats = [
    ["Speed", player.Speed],
    ["Handling", player.Handling],
    ["Passing", player.Passing],
    ["Tackling", player.Tackling],
    ["Game IQ", player.Game_IQ],
    ["Fitness", player.Fitness],
    ["Leadership", player.Leadership],
    ["Defence", player.Defence],
    ["Kicking", player.Kicking],
  ]
    .filter(([, value]) => typeof value === "number")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const getRatingColor = (rating) => {
    if (rating >= 90) return "#22c55e";
    if (rating >= 80) return "#f5b51b";
    return "#ef4444";
  };

  const potential = Number(player.Potential) || 0;

  const progressToPotential = potential
    ? Math.min(100, Math.round((overall / potential) * 100))
    : 0;

  return (
    <main className="app">
      <Header active="Players" />

      <a
        href="/players"
        style={{
          display: "inline-block",
          margin: "14px 0",
          color: "#f5b51b",
          fontWeight: "bold",
        }}
      >
        ← Back to Players
      </a>

      <a
        href={`/players/${player.Pt_number}/edit`}
        style={{
          display: "inline-block",
          margin: "14px 0 14px 18px",
          color: "#f5b51b",
          fontWeight: "bold",
        }}
      >
        Edit Player
      </a>

      <section className="grid">
        <div
          className="panel wide"
          style={{
            textAlign: "center",
          }}
        >
          {player.Profile_image && (
            <img
              src={player.Profile_image}
              alt={`${player.First_name} ${player.Last_name}`}
              style={{
                width: "220px",
                height: "220px",
                borderRadius: "50%",
                objectFit: "cover",
                objectPosition: player.Photo_position || "center",
                marginBottom: "16px",
                border: "4px solid #f5b51b",
                boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
              }}
            />
          )}

          <div className="pt">{player.Pt_number}</div>

          <h2>
            {player.First_name} {player.Last_name}
          </h2>

          <p className="small">
            {player.Primary_position}
            {player.Secondary_position
              ? ` · ${player.Secondary_position}`
              : ""}
          </p>

          <div className="stats">
            <div className="stat">
              <b>{overall}</b>
              Overall
            </div>

            <div
              className="stat"
              style={{
                border: "2px solid #f5b51b",
                boxShadow: "0 0 18px rgba(245,181,27,0.35)",
              }}
            >
              <b>{potential}</b>
              Potential ⭐
            </div>

            <div className="stat">
              <b>{player.Caps || 0}</b>
              Career Caps
            </div>

            <div className="stat">
              <b>{player.Tries || 0}</b>
              2027 Tries
            </div>

            <div className="stat">
              <b>{player.Conversions || 0}</b>
              Conversions
            </div>

            <div className="stat">
              <b>{player.Pack_score || 0}</b>
              Pack Score
            </div>
          </div>
        </div>

        <div className="panel wide">
          <h3>Development Progress</h3>

          <p className="small">
            {overall} / {potential} — {progressToPotential}% to potential
          </p>

          <div
            style={{
              background: "#1b2840",
              borderRadius: "10px",
              overflow: "hidden",
              height: "16px",
            }}
          >
            <div
              style={{
                width: `${progressToPotential}%`,
                height: "100%",
                background:
                  "linear-gradient(90deg, #f5b51b, #ffd84d)",
              }}
            />
          </div>
        </div>

        <div className="panel half">
          <h3>Strengths</h3>

          {topStats.length === 0 ? (
            <p>No ratings have been added yet.</p>
          ) : (
            topStats.map(([label, value]) => (
              <p key={label}>
                ⭐ {label}: <b>{value}</b>
              </p>
            ))
          )}
        </div>

        <div className="panel half">
          <h3>Development Areas</h3>

          <p>{player.Development || "To be added."}</p>
        </div>

        <div className="panel wide">
          <h3>🏆 Awards & Achievements</h3>

          <p>
            ⭐ Player of the Match:{" "}
            {player.Player_of_the_match || 0}
          </p>

          <p>
            💪 Coaches Player: {player.Coaches_player || 0}
          </p>

          <p>
            ✨ Magic Moment: {player.Magic_moment || 0}
          </p>

          <p>
            🚀 Most Improved: {player.Most_improved || 0}
          </p>

          <p>👑 Captain: {player.Captain ? "YES" : "NO"}</p>
        </div>

        <div className="panel wide">
          <h3>Player Ratings</h3>

          {[
            ["⚡ Speed", player.Speed],
            ["🤲 Handling", player.Handling],
            ["🎯 Passing", player.Passing],
            ["💥 Tackling", player.Tackling],
            ["🧠 Game IQ", player.Game_IQ],
            ["❤️ Fitness", player.Fitness],
            ["👑 Leadership", player.Leadership],
            ["🛡 Defence", player.Defence],
            ["👟 Kicking", player.Kicking],
          ].map(([label, value]) => {
            const rating = Number(value) || 0;
            const ratingColor = getRatingColor(rating);

            return (
              <div
                key={label}
                style={{
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                    fontWeight: "bold",
                  }}
                >
                  <span>{label}</span>

                  <span style={{ color: ratingColor }}>
                    {rating}
                  </span>
                </div>

                <div
                  style={{
                    background: "#1b2840",
                    borderRadius: "10px",
                    overflow: "hidden",
                    height: "14px",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, rating)}%`,
                      height: "100%",
                      background: ratingColor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="panel wide">
          <h3>Coach Notes / Awards</h3>

          <p>{player.Awards || "To be added."}</p>
        </div>

        <div
          className="panel wide"
          style={{
            background: "#163d75",
            borderRadius: "16px",
            padding: "14px",
          }}
        >
          <h2>📈 Player Development Plan</h2>

          <p>
            View and manage this player&apos;s personalised
            development objectives, progress and review history.
          </p>

          <a
            href={`/players/${player.Pt_number}/development`}
            style={{
              display: "inline-block",
              marginTop: "8px",
              background: "#f0b323",
              color: "#163d75",
              padding: "12px 20px",
              border: "none",
              borderRadius: "10px",
              fontWeight: "bold",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            View Development Plan
          </a>
        </div>

        <div
          className="panel wide"
          style={{
            background: "#1f2937",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <section
  style={{
    marginTop: "24px",
    background: "linear-gradient(135deg, #111827, #172554)",
    border: "1px solid rgba(245,181,27,0.35)",
    borderRadius: "18px",
    padding: "22px",
    boxShadow: "0 14px 35px rgba(0,0,0,0.28)",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "12px",
      marginBottom: "18px",
    }}
  >
    <div>
      <h2
        style={{
          color: "#f5b51b",
          margin: 0,
          fontSize: "24px",
        }}
      >
        🏆 Achievement Summary
      </h2>

      <p
        style={{
          color: "#cbd5e1",
          margin: "5px 0 0",
        }}
      >
        Awards, milestones and standout moments.
      </p>
    </div>

    <a
      href={`/players/${player.Pt_number}/achievements/create`}
      style={{
        background: "#f5b51b",
        color: "#163d75",
        padding: "10px 16px",
        borderRadius: "10px",
        fontWeight: "900",
        textDecoration: "none",
      }}
    >
      + Add Achievement
    </a>
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
      gap: "12px",
    }}
  >
    {[
      ["🏆", "Total", achievementStats.total],
      ["⭐", "Featured", achievementStats.featured],
      ["👑", "Captain", achievementStats.captain],
      ["💪", "Coaches Player", achievementStats.coachesPlayer],
      ["✨", "Magic Moment", achievementStats.magicMoment],
      ["🚀", "Most Improved", achievementStats.mostImproved],
    ].map(([icon, label, value]) => (
      <div
        key={label}
        style={{
          background: "rgba(15,23,42,0.78)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "14px",
          padding: "16px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "25px",
            marginBottom: "7px",
          }}
        >
          {icon}
        </div>

        <div
          style={{
            color: "#ffffff",
            fontSize: "28px",
            fontWeight: "900",
            lineHeight: 1,
          }}
        >
          {value}
        </div>

        <div
          style={{
            color: "#cbd5e1",
            marginTop: "7px",
            fontSize: "12px",
            fontWeight: "800",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {label}
        </div>
      </div>
    ))}
  </div>

  {latestAchievement && (
    <div
      style={{
        marginTop: "18px",
        padding: "18px",
        borderRadius: "14px",
        background: latestAchievement.is_featured
          ? "linear-gradient(135deg, rgba(245,181,27,0.18), rgba(30,41,59,0.95))"
          : "rgba(30,41,59,0.95)",
        border: latestAchievement.is_featured
          ? "2px solid #f5b51b"
          : "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <p
        style={{
          color: "#f5b51b",
          margin: "0 0 8px",
          fontWeight: "900",
          fontSize: "12px",
          letterSpacing: "0.7px",
          textTransform: "uppercase",
        }}
      >
        Latest Achievement
      </p>

      <h3
        style={{
          color: "#ffffff",
          margin: 0,
          fontSize: "21px",
        }}
      >
        {latestAchievement.icon || "🏆"} {latestAchievement.title}
      </h3>

      {latestAchievement.details && (
        <p
          style={{
            color: "#e5e7eb",
            margin: "10px 0",
            lineHeight: "1.5",
          }}
        >
          {latestAchievement.details}
        </p>
      )}

      <small style={{ color: "#9ca3af" }}>
        {formatAchievementDate(latestAchievement.achievement_date)}
        {latestAchievement.season
          ? ` • ${latestAchievement.season}`
          : ""}
      </small>
    </div>
  )}
</section>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              marginBottom: "18px",
            }}
          >

          
  

            <div>
              <h2
                style={{
                  color: "#fbbf24",
                  margin: "0 0 5px",
                }}
              >
                🏆 Achievement History
              </h2>

              <p
                style={{
                  color: "#cbd5e1",
                  margin: 0,
                }}
              >
                Milestones, awards and standout moments.
              </p>
            </div>

            <a
              href={`/players/${player.Pt_number}/achievements/create`}
              style={{
                display: "inline-block",
                background: "#f5b51b",
                color: "#163d75",
                padding: "11px 17px",
                borderRadius: "10px",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              + Add Achievement
            </a>
          </div>

          {achievements.length === 0 ? (
            <div
              style={{
                padding: "18px",
                border: "1px dashed rgba(245,181,27,0.45)",
                borderRadius: "10px",
                color: "#d1d5db",
              }}
            >
              No achievements recorded yet.
            </div>
          ) : (
            achievements.map((achievement) => (
              <article
  key={achievement.id}
  style={{
    position: "relative",
    background: achievement.is_featured
      ? "linear-gradient(135deg, rgba(30,58,95,0.98), rgba(17,24,39,0.98))"
      : "linear-gradient(135deg, rgba(31,41,55,0.98), rgba(17,24,39,0.98))",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "10px",
    border: achievement.is_featured
      ? "2px solid #f5b51b"
      : "1px solid rgba(255,255,255,0.1)",
    boxShadow: achievement.is_featured
      ? "0 10px 28px rgba(245,181,27,0.18)"
      : "0 10px 24px rgba(0,0,0,0.25)",
    overflow: "hidden",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "10px",
      flexWrap: "wrap",
    }}
  >
    <div style={{ flex: "1 1 320px" }}>
      <p
        style={{
          margin: "0 0 7px",
          color: "#f5b51b",
          fontSize: "12px",
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: "0.8px",
        }}
      >
        {achievement.achievement_type || "Achievement"}
      </p>

      <h3
        style={{
          color: "#ffffff",
          margin: 0,
          fontSize: "22px",
          lineHeight: "1.2",
        }}
      >
        {achievement.icon || "🏆"} {achievement.title}
      </h3>
    </div>

    {achievement.is_featured && (
      <span
        style={{
          padding: "6px 10px",
          borderRadius: "999px",
          background: "#f5b51b",
          color: "#163d75",
          fontSize: "11px",
          fontWeight: "900",
          letterSpacing: "0.6px",
        }}
      >
        FEATURED
      </span>
    )}
  </div>

  {achievement.details && (
    <p
      style={{
        color: "#e5e7eb",
        margin: "8px 0",
        lineHeight: "1.6",
        fontSize: "15px",
      }}
    >
      {achievement.details}
    </p>
  )}

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
      flexWrap: "wrap",
      paddingTop: "8px",
      borderTop: "1px solid rgba(255,255,255,0.08)",
    }}
  >
    <small
      style={{
        color: "#9ca3af",
        fontWeight: "700",
      }}
    >
      {formatAchievementDate(achievement.achievement_date)}
      {achievement.season ? ` • ${achievement.season}` : ""}
    </small>

    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        flexWrap: "wrap",
        gap: "10px",
      }}
    >
      <a
        href={`/players/${player.Pt_number}/achievements/edit/${achievement.id}`}
        style={{
          display: "inline-block",
          padding: "9px 14px",
          border: "1px solid #f5b51b",
          borderRadius: "9px",
          background: "transparent",
          color: "#f5b51b",
          fontWeight: "900",
          textDecoration: "none",
        }}
      >
        ✏️ Edit
      </a>

      <a
        href={`/players/${player.Pt_number}/achievements/delete/${achievement.id}`}
        style={{
          display: "inline-block",
          padding: "9px 14px",
          border: "1px solid #ef4444",
          borderRadius: "9px",
          background: "#dc2626",
          color: "#ffffff",
          fontWeight: "900",
          textDecoration: "none",
        }}
      >
        🗑️ Delete
      </a>
    </div>
  </div>
</article>
            ))
          )}
        </div>
      </section>

      <FooterNav />
    </main>
  );
}