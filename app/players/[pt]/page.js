import { Header, FooterNav } from '../../components'
import { supabase } from '../../../lib/supabase'

async function getPlayer(pt) {
  if (!supabase) return null
  const { data } = await supabase.from('Players').select('*').eq('Pt_number', pt).single()
  return data
}

export default async function PlayerProfile({ params }) {
  const {pt} = await params 
    const player = await getPlayer(pt)
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
].filter((v) => typeof v === "number")

const overall = ratings.length
  ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length)
  : 0
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
  .filter(([label, value]) => typeof value === "number")
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3);

  const getRatingColor = (rating) => {
  if (rating >= 90) return "#22c55e"
  if (rating >= 80) return "#f5b51b"
  return "#ef4444"
}
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
  
      {!player ? (
        <section className="panel" style={{marginTop:16}}>
          <h2>Player not found</h2>
          <p className="small">Check the PT number or import the squad data.</p>
        </section>
      ) : (
        <section className="grid">
          <div className="panel wide" style={{ textAlign: 'center' }}>
    {player.Profile_image && (
  <img
    src={player.Profile_image}
    alt={`${player.First_name} ${player.Last_name}`}
    style={{
      width: '220px',
      height: '220px',
      borderRadius: '50%',
      objectFit: 'cover',
      objectPosition: player.Photo_position || 'center',
      marginBottom: '16px',
      border:'4px solid #f5b51b',
boxShadow:'0 10px 30px rgba(0,0,0,0.35)'
    }}
  />
)}
            <div className="pt">{player.Pt_number}</div>
            <h2>{player.First_name} {player.Last_name}</h2>
            <p className="small">{player.Primary_position} {player.Secondary_position ? `· ${player.Secondary_position}` : ''}</p>
            <div className="stats">
<div className="stat"><b>{overall}</b>Overall</div>
  <div
  className="stat"
  style={{
    border: "2px solid #f5b51b",
    boxShadow: "0 0 18px rgba(245,181,27,0.35)"
  }}
>
  <b>{player.Potential || 0}</b>
  Potential ⭐
</div>
              <div className="stat"><b>{player.Caps || 0}</b>Career Caps</div>
              <div className="stat"><b>{player.Tries || 0}</b>2027 Tries</div>
              <div className="stat"><b>{player.Conversions || 0}</b>Conversions</div>
              <div className="stat"><b>{player.Pack_score || 0}</b>Pack Score</div>
            </div>
          </div>
    <div className="panel wide">
  <h3>Development Progress</h3>
  <p className="small">
    {overall} / {player.Potential || 0} —{" "}
    {player.Potential
      ? Math.round((overall / player.Potential) * 100)
      : 0}
    % to potential
  </p>

  <div style={{
    background: "#1b2840",
    borderRadius: "10px",
    overflow: "hidden",
    height: "16px"
  }}>
    <div style={{
      width: `${player.Potential ? Math.round((overall / player.Potential) * 100) : 0}%`,
      height: "100%",
      background: "linear-gradient(90deg,#f5b51b,#ffd84d)"
    }} />
  </div>
</div>
          <div className="panel half">
            <h3>Strengths</h3>
            {topStats.map(([label, value]) => (
  <p key={label}>
    ⭐ {label}: <b>{value}</b>
  </p>
))}
          </div>
          <div className="panel half">
            <h3>Development Areas</h3>
            <p>{player.Development}</p>
          </div>
      <div className="panel wide">
  <h3>🏆 Awards & Achievements</h3>

  <p>⭐ Player of the Match: {player.Player_of_the_match || 0}</p>
  <p>💪 Coaches Player: {player.Coaches_player || 0}</p>
  <p>✨ Magic Moment: {player.Magic_moment || 0}</p>
  <p>🚀 Most Improved: {player.Most_improved || 0}</p>
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
  
].map(([label, value]) => (
  <div key={label} style={{ marginBottom: "16px" }}>
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "4px",
      fontWeight: "bold"
    }}>
      <span>{label}</span>
      <span style={{ color: getRatingColor(value) }}>
  {value || 0}
</span>
    </div>

    <div style={{
      background: "#1b2840",
      borderRadius: "10px",
      overflow: "hidden",
      height: "14px"
    }}>
      <div
        style={{
          width: `${value || 0}%`,
          height:"100%",
    background:
  `linear-gradient(90deg, ${getRatingColor(value)}, ${getRatingColor(value)})`,
        }}
      />
    </div>
  </div>
))}
</div>
  
          <div className="panel wide">
            <h3>Coach Notes / Awards</h3>
            <p>{player.Awards || 'To be added.'}</p>
          </div>
        </section>
      )}
      <FooterNav />
    </main>
  )
}
