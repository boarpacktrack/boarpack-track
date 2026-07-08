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
  return (
    <main className="app">
      <Header active="Dashboard" />
      <section className="grid">
        <div className="panel wide">
          <h2>Good Evening, Coach Brendan 👋</h2>
          <p className="small">Bradford Salem U14s · Season 2027</p>
          <div className="stats">
            <div className="stat"><b>{players.length || 12}</b>Players</div>
            <div className="stat"><b>{totalCaps || 0}</b>Total Caps</div>
            <div className="stat"><b>{topCap ? topCap.First_name : 'Ethan'}</b>Top Caps</div>
            <div className="stat"><b>0</b>Season Tries</div>
          </div>
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
