'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
export default function TeamSelector({ players, savedSquad = [] }) {
  const [selected, setSelected] = useState(savedSquad)
  const [captain, setCaptain] = useState("")
const [viceCaptain, setViceCaptain] = useState("")
const [forwardsCaptain, setForwardsCaptain] = useState("")
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
    .update({ Matchday_squad: selected })
    .eq('id', 1)

  if (error) {
    alert('Error saving squad')
    return
  }

  alert('Squad saved')
}
  return (
    <div>
      <p>
        <strong>Selected:</strong> {selected.length}/23
      </p>
    <p>
  <strong>Starting XV:</strong> {Math.min(selected.length, 15)}/15
</p>

<p>
  <strong>Bench:</strong> {Math.max(selected.length - 15, 0)}/8
</p>
<button
  onClick={saveSquad}
  style={{
    marginTop: '10px',
    padding: '8px 16px',
    cursor: 'pointer'
  }}
>
  Save Squad
</button>
<h3>Leadership</h3>

<p>Captain</p>
<select value={captain} onChange={(e) => setCaptain(e.target.value)}>
  <option value="">Select Captain</option>
  {selectedPlayers.map(player => (
    <option key={player.id} value={player.id}>
      {player.First_name} {player.Last_name}
    </option>
  ))}
</select>

<p>Vice Captain</p>
<select value={viceCaptain} onChange={(e) => setViceCaptain(e.target.value)}>
  <option value="">Select Vice Captain</option>
  {selectedPlayers.map(player => (
    <option key={player.id} value={player.id}>
      {player.First_name} {player.Last_name}
    </option>
  ))}
</select>

<p>Forwards Captain</p>
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
    <div key={position}>
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
