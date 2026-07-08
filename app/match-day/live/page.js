import { Header, FooterNav } from '../../components'

export const dynamic = 'force-dynamic'

export default function LiveMatchPage() {
  return (
    <main className="app">
      <Header active="Match Day" />

      <section className="grid">
        <div className="panel wide">
          <h2>Live Match</h2>
          <p className="small">Record match events as they happen.</p>

          <div className="stats">
            <div className="stat"><b>0</b>Salem</div>
            <div className="stat"><b>0</b>Opposition</div>
          </div>
        </div>

        <div className="panel half">
          <h3>Score Events</h3>
          <button>🏉 Try</button>
          <button>🎯 Conversion</button>
          <button>🏉 Penalty</button>
        </div>

        <div className="panel half">
          <h3>Match Events</h3>
          <button>🔄 Substitution</button>
          <button>🟨 Yellow Card</button>
          <button>🟥 Red Card</button>
          <button>⭐ Player of the Match</button>
        </div>
      </section>

      <FooterNav />
    </main>
  )
}
