import { Header, FooterNav } from './components'
import { supabase } from '../lib/supabase'

async function getPlayers() {
  if (!supabase) return []
  const { data } = await supabase.from('Players').select('*').order('Pt_number')
  return data || []
}

export default async function Dashboard() {
  const players = await getPlayers()
  const totalCaps = players.reduce((sum, p) => sum + (p.Caps || 0), 0)
  const topCap = [...players].sort((a,b)=>(b.Caps||0)-(a.Caps||0))[0]
const potmLeader = [...players].sort((a, b) => (b.Player_of_the_match || 0) - (a.Player_of_the_match || 0))[0]

const coachesLeader = [...players].sort((a, b) => (b.Coaches_player || 0) - (a.Coaches_player || 0))[0]

const magicLeader = [...players].sort((a, b) => (b.Magic_moment || 0) - (a.Magic_moment || 0))[0]

const improvedLeader = [...players].sort((a, b) => (b.Most_improved || 0) - (a.Most_improved || 0))[0]

const captains = players.filter(p => p.Captain)
const ratingFields = [
  "Speed",
  "Handling",
  "Passing",
  "Tackling",
  "Game_IQ",
  "Fitness",
  "Leadership",
  "Defence",
  "Kicking",
]

const teamRatings = ratingFields.map(field => {
  const values = players
    .map(player => player[field])
    .filter(value => typeof value === "number")

  const average = values.length
    ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
    : 0

  return [field, average]
})

const teamOverall = teamRatings.length
  ? Math.round(
      teamRatings.reduce((sum, [, value]) => sum + value, 0) /
        teamRatings.length
    )
  : 0
  const rankedPlayers = players
  .map(player => {
    const ratings = ratingFields
      .map(field => player[field])
      .filter(value => typeof value === "number")

    const overall = ratings.length
      ? Math.round(
          ratings.reduce((sum, value) => sum + value, 0) /
            ratings.length
        )
      : 0

    return {
      ...player,
      overall,
    }
  })
  .sort((a, b) => b.overall - a.overall)
  .slice(0, 5)
  return (
    <main className="app">
      <Header active="Dashboard" />
      <section className="grid">
        <div className="panel wide">
          <h2>Good Evening, Coach Brendan 👋</h2>
          <p className="small">Bradford Salem U14s · Season 2027</p>
          <div className="stats">
          <div className="stat">
  <b>{players.length || 12}</b>
  Players
</div>

<div className="stat">
  <b>{teamOverall}</b>
  Team Rating
</div>

<div className="stat">
  <b>{totalCaps || 0}</b>
  Total Caps
</div>

<div className="stat">
  <b>{captains.length}</b>
  Captains
</div>
        </div>
</div>
<div className="panel half">
  <h3>📊 Team Average Ratings</h3>

  {teamRatings.map(([label, value]) => (
    <div key={label} style={{ marginBottom: "12px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "4px",
          fontWeight: "bold",
        }}
      >
        <span>{label}</span>
        <span>{value}</span>
      </div>

      <div
        style={{
          background: "#1b2840",
          borderRadius: "10px",
          overflow: "hidden",
          height: "12px",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background:
              value >= 85
                ? "#4caf50"
                : value >= 80
                ? "#fbc02d"
                : "#f44336",
          }}
        />
      </div>
    </div>
  ))}
</div>
<div className="panel half">
  <h3>🏆 Top Players</h3>

  {rankedPlayers.map((player, index) => (
    <div
      key={player.id || player.Pt_number}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <span>
        {index === 0
          ? "🥇"
          : index === 1
          ? "🥈"
          : index === 2
          ? "🥉"
          : `${index + 1}.`}{" "}
        {player.First_name} {player.Last_name}
      </span>

      <b>{player.overall}</b>
    </div>
  ))}
</div>
        <div className="panel half">
          <h3>Quick Actions</h3>
          <p><a className="button gold" href="/training">Start Training</a></p>
          <p><a className="button gold" href="/match-day">Match Day Centre</a></p>
          <p><a className="button gold" href="/team_selection">Team Selection</a></p>
<p><a className="button" href="/players">View Player Profiles</a></p>
        </div>
<div className="panel wide">
  <h3>🏅 Awards Leaders</h3>

  
<p>⭐ Player of the Match Leader: {potmLeader?.First_name} ({potmLeader?.Player_of_the_match || 0})</p>

<p>💪 Coaches Player Leader: {coachesLeader?.First_name} ({coachesLeader?.Coaches_player || 0})</p>

<p>✨ Magic Moment Leader: {magicLeader?.First_name} ({magicLeader?.Magic_moment || 0})</p>

<p>🚀 Most Improved Leader: {improvedLeader?.First_name} ({improvedLeader?.Most_improved || 0})</p>

<p>👑 Captain(s): {captains.length ? captains.map(c => c.First_name).join(", ") : "None"}</p>
  </div>
        <div className="panel half">
          <h3>Coach Assistant</h3>
          <p>🎯 Suggested focus: Breakdown & communication</p>
          <p>🧢 Milestone watch: Adam 109 Caps, Ethan 126 Caps, Luke 91 Caps</p>
          <p>🏆 Awards ready to track from first session.</p>
        </div>
      </section>
      <FooterNav />
    </main>
  )
}
