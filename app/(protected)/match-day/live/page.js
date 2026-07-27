'use client'
import { useState, useEffect } from 'react'
import { Header, FooterNav } from "@/app/components"
import { supabase } from "@/lib/supabase"
export const dynamic = 'force-dynamic'

export default function LiveMatchPage() {
  const [salemScore, setSalemScore] = useState(0)
const [oppositionScore, setOppositionScore] = useState(0)
  const [events, setEvents] = useState([])
const [selectedPlayer, setSelectedPlayer] = useState('')
const [selectedPlayerId, setSelectedPlayerId] = useState('')
const [squad, setSquad] = useState([])
  const matchId = 1
  const [showInjuryForm, setShowInjuryForm] = useState(false)
  const [injuryForm, setInjuryForm] = useState({
  player_name: "",
  injury_minute: "",
  injury_type: "Body Injury",
  description: "",
  play_stopped: false,
  removed_from_play: false,
  returned_to_play: false,
  parent_informed: false,
  first_aider: false,
  ambulance_required: false,
})
  useEffect(() => {
  async function loadMatch() {
    const { data } = await supabase
      .from('Matches')
      .select('Salem_live_score, Opposition_live_score, Match_events, Matchday_squad')
      .eq('id', matchId)
      .single()

    if (data) {
      const { data: players } = await supabase
  .from("Players")
  .select("id, First_name, Last_name")
  .in("id", data.Matchday_squad || [])
  console.log(players)
      setSalemScore(data.Salem_live_score || 0)
      setOppositionScore(data.Opposition_live_score || 0)
      setEvents(data.Match_events || [])
     setSquad(players || [])
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
      player: selectedPlayer|| null,
      playerId: selectedPlayerId || null,
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
        playerId: selectedPlayerId || null,
        time: new Date().toISOString()
      }
    ]
  })
.eq('id', matchId)
.select()

alert(error ? error.message : "Saved to database")
if (team === 'Salem' && selectedPlayerId) {
  const { data: playerStats, error: playerReadError } = await supabase
  .from('Players')
  .select('Tries, Conversions')
  .eq('id', selectedPlayerId)
  .single()

if (playerReadError) {
  alert(playerReadError.message)
  return
}


  const updates = {}

if (type === 'Try') {
  updates.Tries = (playerStats.Tries || 0) + 1
}

if (type === 'Conversion') {
  
  updates.Conversions = (playerStats.Conversions || 0) + 1
}

if (Object.keys(updates).length > 0) {
  const { error: playerUpdateError } = await supabase
    .from('Players')
    .update(updates)
    .eq('id', selectedPlayerId)

  if (playerUpdateError) {
    alert(playerUpdateError.message)
    return 
  }
}
  
}
}

async function saveInjuryReport() {
  const { error } = await supabase.from("injuries").insert([
    {
      match_id: null,
      player_name: injuryForm.player_name,
      injury_minute: Number(injuryForm.injury_minute),
      injury_type: injuryForm.injury_type,
      description: injuryForm.description,
      play_stopped: injuryForm.play_stopped,
      removed_from_play: injuryForm.removed_from_play,
      returned_to_play: injuryForm.returned_to_play,
      parent_informed: injuryForm.parent_informed,
      first_aider: injuryForm.first_aider,
      ambulance_required: injuryForm.ambulance_required,
    },
  ])

  if (error) {
    alert(error.message)
    return
  }

  alert("Injury report saved successfully!")

  setInjuryForm({
    player_name: "",
    injury_minute: "",
    injury_type: "Body Injury",
    description: "",
    play_stopped: false,
    removed_from_play: false,
    returned_to_play: false,
    parent_informed: false,
    first_aider: false,
    ambulance_required: false,
  })
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
 
 
      async function completeMatch() {
  const confirmed = window.confirm(
    'Complete this match and award caps to all players marked as played?'
  )

  if (!confirmed) return

  const { data: matchPlayers, error: matchPlayersError } = await supabase
    .from('match_players')
    .select('id, player_id, played')
    .eq('match_id', matchId)

  if (matchPlayersError) {
    alert(matchPlayersError.message)
    return
  }

  const playersWhoPlayed = (matchPlayers || []).filter(
    (matchPlayer) => matchPlayer.played === true
  )

  if (playersWhoPlayed.length === 0) {
    alert('No players are marked as played yet.')
    return
  }

  for (const matchPlayer of playersWhoPlayed) {
    const { data: player, error: playerReadError } = await supabase
      .from('Players')
      .select('Caps')
      .eq('id', matchPlayer.player_id)
      .single()

    if (playerReadError) {
      alert(playerReadError.message)
      return
    }

    const { error: playerUpdateError } = await supabase
      .from('Players')
      .update({
        Caps: (player.Caps || 0) + 1
      })
      .eq('id', matchPlayer.player_id)

    if (playerUpdateError) {
      alert(playerUpdateError.message)
      return
    }
  }

  const { error: matchUpdateError } = await supabase
    .from('Matches')
    .update({
      status: 'completed'
    })
    .eq('id', matchId)

  if (matchUpdateError) {
    alert(matchUpdateError.message)
    return
  }

alert("Match completed. " + playersWhoPlayed.length + " caps awarded.")
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
  value={selectedPlayerId}
 
onChange={(e) => {
  const playerId = e.target.value

  const chosenPlayer = squad.find(
    (player) => String(player.id) === String(playerId)
  )

  setSelectedPlayerId(playerId)

  setSelectedPlayer(
    chosenPlayer
      ? `${chosenPlayer.First_name} ${chosenPlayer.Last_name}`
      : ''
  )
}}
>
  <option value="">Select Player</option>
{squad.map((player) => (
  <option key={player.id} value={player.id}>
    {player.First_name} {player.Last_name}
  </option>
))}
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
<button
  onClick={completeMatch}
  style={{
    marginTop: '10px',
    width: '100%',
    background: '#16a34a',
    color: 'white',
    borderRadius: '8px',
    padding: '12px',
    fontWeight: 'bold'
  }}>

  ✅ Complete Match
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
          <button onClick={() => setShowInjuryForm(true)}>
  🩹 Record Injury
</button>
        </div>
      </section>
{showInjuryForm && (
  <div
    style={{
      background: "#1b2840",
      border: "2px solid #ef4444",
      borderRadius: "12px",
      padding: "20px",
      marginTop: "20px",
    }}
  >
    <h3>🩹 Injury Report</h3>
    <div style={{ display: "grid", gap: "10px" }}>

<input
  placeholder="Player Name"
  value={injuryForm.player_name}
  onChange={(e) =>
    setInjuryForm({
      ...injuryForm,
      player_name: e.target.value,
    })
  }
/>

<input
  type="number"
  placeholder="Minute of Injury"
  value={injuryForm.injury_minute}
  onChange={(e) =>
    setInjuryForm({
      ...injuryForm,
      injury_minute: e.target.value,
    })
  }
/>

<select
  value={injuryForm.injury_type}
  onChange={(e) =>
    setInjuryForm({
      ...injuryForm,
      injury_type: e.target.value,
    })
  }
>
  <option>Body Injury</option>
  <option>Head Injury / Suspected Concussion</option>
  <option>Blood Injury</option>
  <option>Other</option>
</select>

<textarea
  rows={4}
  placeholder="Describe exactly what happened..."
  value={injuryForm.description}
  onChange={(e) =>
    setInjuryForm({
      ...injuryForm,
      description: e.target.value,
    })
  }
/>
 

<label>
  <input
    type="checkbox"
    checked={injuryForm.play_stopped}
    onChange={(e) =>
      setInjuryForm({
        ...injuryForm,
        play_stopped: e.target.checked,
      })
    }
  />
  Play stopped immediately
</label>

<label>
  <input
    type="checkbox"
    checked={injuryForm.removed_from_play}
    onChange={(e) =>
      setInjuryForm({
        ...injuryForm,
        removed_from_play: e.target.checked,
      })
    }
  />
  Player removed from play
</label>

<label>
  <input
    type="checkbox"
    checked={injuryForm.returned_to_play}
    onChange={(e) =>
      setInjuryForm({
        ...injuryForm,
        returned_from_play: e.target.checked,
      })
    }
  />
  Player returned to play
</label>
<label>
  <input
    type="checkbox"
    checked={injuryForm.parent_informed}
    onChange={(e) =>
      setInjuryForm({
        ...injuryForm,
        parent_informed: e.target.checked,
      })
    }
  />
  Parent / Guardian informed
</label>
<label>
  <input
    type="checkbox"
    checked={injuryForm.first_aider}
    onChange={(e) =>
      setInjuryForm({
        ...injuryForm,
        first_aider: e.target.checked,
      })
    }
  />
  First aider present
</label>

<label>
  <input
    type="checkbox"
    checked={injuryForm.ambulance_required}
    onChange={(e) =>
      setInjuryForm({
        ...injuryForm,
        ambulance_required: e.target.checked,
      })
    }
  />
  Ambulance required
</label>

</div>

<button onClick={saveInjuryReport}>
  Save Injury Report
</button>

    <button onClick={() => setShowInjuryForm(false)}>
      Close
    </button>
  </div>
)}
      <FooterNav />
    </main>
  )
}
