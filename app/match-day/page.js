export const dynamic = 'force-dynamic'
import { Header, FooterNav } from '../components'
import { supabase } from '../../lib/supabase'

async function getMatches() {
  if (!supabase) return []

  const { data, error } = await supabase
  .from('Matches')
  .select('*')
.order('Match_date', { ascending: false })



return data || []
}
export default async function MatchDayPage() {

  const matches = await getMatches()
const nextMatch = matches?.[0] || null
  const captain = nextMatch?.Captain
const viceCaptain = nextMatch?.Vice_captain
const forwardsCaptain = nextMatch?.Forwards_captain
  return (
    <main className="app">
      <Header active="Match Day" />
      <section className="grid">
        <div className="panel wide">
          <h2>Match Day Centre</h2>
          <p className="small">
  {nextMatch?.Opponent} • {nextMatch?.Venue} • {nextMatch?.Match_date}
</p>
          <div className="stats">
            <div className="stat"><b>12</b>Available</div>
<div className="stat"><b>{nextMatch?.Matchday_squad?.length || 0}</b>Squad</div>
<div className="stat"><b>{captain ? "Saved" : "None"}</b>Captain</div>
<div className="stat"><b>{viceCaptain ? "Saved" : "None"}</b>Vice</div>
<div className="stat"><b>{forwardsCaptain ? "Saved" : "None"}</b>Forwards</div>
            <div className="stat"><b>0</b>Score</div>
          </div>
        </div>
        <a className="panel half" href="/team_selection">
  <h3>Team Selection</h3>
  <p>Select your squad, captains, bench and generate team sheet.</p>
</a>
        <a className="panel half" href="/match-day/live">
  <h3>Live Match</h3>
  <p>Record tries, conversions, cards, substitutions, POTM and final score.</p>
</a>
      </section>
      <FooterNav />
    </main>
  )
}
