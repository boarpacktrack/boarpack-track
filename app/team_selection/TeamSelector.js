'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
export default function TeamSelector({ players, savedSquad = [] }) {
  const [selected, setSelected] = useState(savedSquad)
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

<h3>Starting XV</h3>

{positions.map((position, index) => {
  const player = players.find(p => p.id === startingXV[index])

  return (
    <p key={position}>
      <strong>{index + 1}. {position}</strong><br />
      {player
        ? `${player.First_name} ${player.Last_name}`
        : "Not Selected"}
    </p>
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
