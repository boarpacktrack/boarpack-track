'use client'
import RugbyPitch from "@/app/components/RugbyPitch"
import { useState } from 'react'
import { supabase } from "@/lib/supabase"
export default function TeamSelector({ players, savedSquad = [], savedCaptain = "", savedViceCaptain = "", savedForwardsCaptain = "" }) {
  const [selected, setSelected] = useState(savedSquad)
  const [captain, setCaptain] = useState(savedCaptain)
const [viceCaptain, setViceCaptain] = useState(savedViceCaptain)
const [forwardsCaptain, setForwardsCaptain] = useState(savedForwardsCaptain)
const selectedPlayers = players.filter(p => selected.includes(p.id))
const startingXV = selected.slice(0, 15)
  const positions = [
  "Loosehead Prop",
  "Hooker",
  "Tighthead Prop",
  "Lock",
  "Lock",
  "Blindside Flanker",
  "Openside Flanker",
  "Number 8",
  "Scrum Half",
  "Fly Half",
  "Left Wing",
  "Inside Centre",
  "Outside Centre",
  "Right Wing",
  "Full Back"
]
const bench = selected.slice(15, 23)
  function togglePlayer(id) {
    setSelected((current) => {
  if (current.includes(id)) {
    return current.filter((playerId) => playerId !== id)
  }

  if (current.length >= 23) {
    alert('Maximum squad size is 23 players.')
    return current
  }

  return [...current, id]
})
  }
  function changeStartingPlayer(index, playerId) {
  setSelected((current) => {
    const next = [...current]
    const existingIndex = next.indexOf(playerId)
    const oldPlayer = next[index]

    if (!playerId) {
      next.splice(index, 1)
      return next
    }

    next[index] = playerId

    if (existingIndex !== -1 && existingIndex !== index) {
      if (oldPlayer) {
        next[existingIndex] = oldPlayer
      } else {
        next.splice(existingIndex, 1)
      }
    }

    return next
  })
  }
async function saveSquad() {
  const { error } = await supabase
    .from('Matches')
    .update({
  Matchday_squad: selected,
  Captain: captain || null,
  Vice_captain: viceCaptain || null,
  Forwards_captain: forwardsCaptain || null
})
    .eq('id', 1)

  if (error) {
    alert('Error saving squad')
    return
  }
const matchPlayerRows = selected.map((playerId, index) => ({
  match_id: 1,
  player_id: playerId,
  selected: true,
  started: index < 15,
  played: true,
  position: index < 15 ? positions[index] : 'Replacement'
}))

const { error: deleteError } = await supabase
  .from('match_players')
  .delete()
  .eq('match_id', 1)

if (deleteError) {
  alert(`Error clearing old squad: ${deleteError.message}`)
  return
}

const { error: matchPlayersError } = await supabase
  .from('match_players')
  .insert(matchPlayerRows)

if (matchPlayersError) {
  alert(`Error linking players to match: ${matchPlayersError.message}`)
  return
}
  alert('Squad saved')
}
  return (
    <div>
  <div style={{
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "12px",
  margin: "20px 0"
}}>

  <div style={{
    background: "#163d75",
    padding: "12px 8px",
    borderRadius: "12px",
    textAlign: "center"
  }}>
    <div style={{fontSize:"24px",fontWeight:"bold"}}>{selected.length}</div>
    <div>Selected</div>
  </div>

  <div style={{
    background: "#163d75",
    padding: "12px 8px",
    borderRadius: "12px",
    textAlign: "center"
  }}>
    <div style={{fontSize:"24px",fontWeight:"bold"}}>{Math.min(selected.length,15)}</div>
    <div>Starting XV</div>
  </div>

  <div style={{
    background: "#163d75",
    padding: "12px 8 px",
    borderRadius: "12px",
    textAlign: "center"
  }}>
    <div style={{fontSize:"24px",fontWeight:"bold"}}>{Math.max(selected.length-15,0)}</div>
    <div>Bench</div>
  </div>
 <RugbyPitch 
 players={players}
 selected={selected}
 />
</div>
<button
  onClick={saveSquad}
  style={{
  marginTop: "10px",
  padding: "12px 24px",
  background: "linear-gradient(135deg, #d4a017, #f0c23a)",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(0,0,0,.35)"
}}
>
  💾 Save Matchday Squad
</button>
<h3>🏉 Leadership Team</h3>

<p><strong>👑 Captain</strong></p>
<select value={captain} onChange={(e) => setCaptain(e.target.value)}>
  <option value="">Select Captain</option>
  {selectedPlayers.map(player => (
    <option key={player.id} value={player.id}>
      {player.First_name} {player.Last_name}
    </option>
  ))}
</select>

<p><strong>⭐ Vice Captain</strong></p>
<select value={viceCaptain} onChange={(e) => setViceCaptain(e.target.value)}>
  <option value="">Select Vice Captain</option>
  {selectedPlayers.map(player => (
    <option key={player.id} value={player.id}>
      {player.First_name} {player.Last_name}
    </option>
  ))}
</select>

<p><strong>🛡️ Forwards Captain</strong></p>
<select value={forwardsCaptain} onChange={(e) => setForwardsCaptain(e.target.value)}>
  <option value="">Select Forwards Captain</option>
  {selectedPlayers.map(player => (
    <option key={player.id} value={player.id}>
      {player.First_name} {player.Last_name}
    </option>
  ))}
</select>
<h3>Starting XV</h3>

{positions.map((position, index) => {
  const player = players.find(p => p.id === startingXV[index])

  return (
    <div key={`${position}-${index}`}>
      <strong>{index + 1}. {position}</strong><br />
    
        
    <select
  value={startingXV[index] || ""}
  
onChange={(e) => changeStartingPlayer(index, e.target.value)}
  >
  <option value="">Not Selected</option>

  {selected.map((playerId) => {
    const optionPlayer = players.find(p => p.id === playerId)

    return (
      <option key={playerId} value={playerId}>
        {optionPlayer?.First_name} {optionPlayer?.Last_name}
      </option>
    )
  })}
</select>
  </div>
  )
})}

<h3>Bench</h3>

{bench.map((id, index) => {
  const player = players.find(p => p.id === id)
  return (
    <p key={id}>
      {16 + index}. {player?.First_name} {player?.Last_name}
    </p>
  )
})}


      {players.map((player) => {
        const isSelected = selected.includes(player.id)

        return (
          <div
            key={player.id}
            className="panel"
            onClick={() => togglePlayer(player.id)}
            style={{
              marginBottom: '10px',
              cursor: 'pointer',
              border: isSelected ? '2px solid #facc15' : undefined
            }}
          >
            <strong>
              {player.First_name} {player.Last_name}
            </strong>
            <br />
            {player.Primary_position}
            {isSelected && <p>✅ Selected</p>}
          </div>
        )
      })}
     
    </div>
  )
}
