import { useState } from 'react'
import { Header, FooterNav } from '../../components'

export const dynamic = 'force-dynamic'

export default function LiveMatchPage() {
  const [salemScore, setSalemScore] = useState(0)
const [oppositionScore, setOppositionScore] = useState(0)
  return (
    <main className="app">
      <Header active="Match Day" />

      <section className="grid">
        <div className="panel wide">
          <h2>Live Match</h2>
          <p className="small">Record match events as they happen.</p>

          <div className="stats">
            <div className="stat"><b>{salemScore}</b>Salem</div>
<div className="stat"><b>{oppositionScore}</b>Opposition</div>
          </div>
        </div>

        <div className="panel half">
          <h3>Score Events</h3>
          <button onClick={() => setSalemScore(salemScore + 5)}>
  🏉 Salem Try
</button>

<button onClick={() => setOppositionScore(oppositionScore + 5)}>
  🏉 Opposition Try
</button>
          <button onClick={() => setSalemScore(salemScore + 2)}>
  🎯 Salem Conversion
</button>

<button onClick={() => setOppositionScore(oppositionScore + 2)}>
  🎯 Opposition Conversion
</button>
          <button onClick={() => setSalemScore(salemScore + 3)}>
  🏉 Salem Penalty
</button>

<button onClick={() => setOppositionScore(oppositionScore + 3)}>
  🏉 Opposition Penalty
</button>
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
