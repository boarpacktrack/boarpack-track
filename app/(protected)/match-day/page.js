export const dynamic = 'force-dynamic'

import { Header, FooterNav } from "@/app/components"
import { supabase } from "@/lib/supabase"

async function getMatches() {
  if (!supabase) return []

  const { data } = await supabase
    .from('Matches')
    .select('*')
    .order('Match_date', { ascending: false })

  return data || []
}

export default async function MatchDayPage() {
  const matches = await getMatches()
  const nextMatch = matches?.[0] || null

  const selectedCount = nextMatch?.Matchday_squad?.length || 0
  const captainSaved = nextMatch?.Captain ? 'Saved' : 'None'
  const viceSaved = nextMatch?.Vice_captain ? 'Saved' : 'None'
  const forwardsSaved = nextMatch?.Forwards_captain ? 'Saved' : 'None'

  return (
    <main className="app">
      <Header active="Match Day" />

      <section className="grid">
        <div className="panel wide">
          <h2>🏉 Match Day Centre</h2>

          <p className="small">
            {nextMatch
              ? `${nextMatch.Opponent} • ${nextMatch.Venue} • ${nextMatch.Match_date}`
              : 'No match loaded yet'}
          </p>

          <div className="stats">
            <div className="stat">
              <b>{selectedCount}</b>
              Selected
            </div>

            <div className="stat">
              <b>{captainSaved}</b>
              Captain
            </div>

            <div className="stat">
              <b>{viceSaved}</b>
              Vice
            </div>

            <div className="stat">
              <b>{forwardsSaved}</b>
              Forwards
            </div>
          </div>
        </div>

        <a className="panel wide" href="/team_selection">
          <h3>📋 Team Selection</h3>
          <p>Select your squad, captains, bench and generate your team sheet.</p>
        </a>

        <a className="panel wide" href="/match-day/live">
          <h3>🏉 Live Match</h3>
          <p>Record tries, conversions, penalties, cards, substitutions, POTM and final score.</p>
        </a>

        <div className="panel wide">
          <h3>📊 Match Report</h3>
          <p>Final score, scorers, cards and coach notes will appear here soon.</p>
        </div>
      </section>

      <FooterNav />
    </main>
  )
}
