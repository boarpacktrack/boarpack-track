'use client'
import { useState, useEffect } from 'react'
import { Header, FooterNav } from '../../components'
import { supabase } from '../../../lib/supabase'

export const dynamic = 'force-dynamic'

export default function LiveMatchPage() {
  const [salemScore, setSalemScore] = useState(0)
const [oppositionScore, setOppositionScore] = useState(0)
  const [events, setEvents] = useState([])
const [selectedPlayer, setSelectedPlayer] = useState('')
  const matchId = 1
  useEffect(() => {
  async function loadMatch() {
    const { data } = await supabase
      .from('Matches')
      .select('Salem_live_score, Opposition_live_score, Match_events')
      .eq('id', matchId)
      .single()

    if (data) {
      setSalemScore(data.Salem_live_score || 0)
      setOppositionScore(data.Opposition_live_score || 0)
      setEvents(data.Match_events || [])
    }
  }

  loadMatch()
    }, [matchId])
async function addEvent(team, type, points) {
  if (team === 'Salem') {
    setSalemScore(salemScore + points)
  } else {
    setOppositionScore(oppositionScore + points)
  }

  setEvents([
    ...events,
    {
      team,
      type,
      points,
      player: selectedPlayer|| null
    }
  ])
  const { error } = await supabase
  .from('Matches')
  .update({
    Salem_live_score: team === 'Salem'
      ? salemScore + points
      : salemScore,

    Opposition_live_score: team === 'Opposition'
      ? oppositionScore + points
      : oppositionScore,

    Match_events: [
      ...events,
      {
        team,
        type,
        points,
        player: selectedPlayer,
        time: new Date().toISOString()
      }
    ]
  })
.eq('id', matchId)
.select()

alert(error ? error.message : "Saved to database")
}
  async function undoLastEvent() {
  if (events.length === 0) return

  const lastEvent = events[events.length - 1]
  const newEvents = events.slice(0, -1)

  const newSalemScore = lastEvent.team === 'Salem'
    ? salemScore - lastEvent.points
    : salemScore

  const newOppositionScore = lastEvent.team === 'Opposition'
    ? oppositionScore - lastEvent.points
    : oppositionScore

setSalemScore(newSalemScore)
setOppositionScore(newOppositionScore)
setEvents(newEvents)

  const { error } = await supabase
    .from('Matches')
    .update({
      Salem_live_score: newSalemScore,
      Opposition_live_score: newOppositionScore,
      Match_events: newEvents
    })
    .eq('id', matchId)

  alert(error ? error.message : 'Last event undone')
  }
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
    <h3>Player</h3>

<select
  value={selectedPlayer}
  onChange={(e) => setSelectedPlayer(e.target.value)}
>
  <option value="">Select Player</option>
  <option>Isaac Birkett</option>
  <option>Zach Hollings</option>
  <option>Ethan Greenwood</option>
</select>
          <h3>Score Events</h3>
          <button onClick={() => addEvent('Salem', 'Try', 5)}>
🏉 Salem Try
</button>

<button onClick={() => addEvent('Opposition', 'Try', 5)}>
🏉 Opposition Try
</button>
          <button onClick={() => addEvent('Salem', 'Conversion', 2)}>
🎯 Salem Conversion
</button>

<button onClick={() => addEvent('Opposition', 'Conversion', 2)}>
🎯 Opposition Conversion
</button>
          <button onClick={() => addEvent('Salem', 'Penalty', 3)}>
🥅 Salem Penalty
</button>

<button onClick={() => addEvent('Opposition', 'Penalty', 3)}>
🥅 Opposition Penalty
</button>
  <button
  onClick={undoLastEvent}
  style={{
    marginTop: '10px',
    width: '100%',
    background: '#d9534f',
    color: 'white',
    borderRadius: '8px',
    padding: '10px'
  }}
>
  ↩️ Undo Last Event
</button>

</div>
      
        <div className="panel half">
  <h3>Match Timeline</h3>

{events.map((event, index) => (
  <div key={index}>
    {event.player || event.team} {event.type} (+{event.points})
  </div>
))}
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
