import { Header, FooterNav } from '../components'
import { supabase } from '../../lib/supabase'

async function getMatches() {
  if (!supabase) return []

  const { data, error } = await supabase
  .from('Matches')
  .select('*')
.order('Match_date', { ascending: false })
console.log("DATA:", data)
console.log("ERROR:", error)

return data || []
}
export default async function MatchDayPage() {

  const matches = await getMatches()
const nextMatch = matches?.[0] || null
  console.log(nextMatch)
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
            <div className="stat"><b>15</b>Squad</div>
            <div className="stat"><b>Isaac</b>Captain</div>
            <div className="stat"><b>0</b>Score</div>
          </div>
        </div>
        <div className="panel half">
          <h3>Team Selection</h3>
          <p>Select your squad, captains, bench and generate team sheet.</p>
        </div>
        <div className="panel half">
          <h3>Live Match</h3>
          <p>Record tries, conversions, cards, substitutions, POTM and final score.</p>
        </div>
      </section>
      <FooterNav />
    </main>
  )
}
