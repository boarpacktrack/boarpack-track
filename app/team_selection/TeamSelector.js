'use client'

import { useState } from 'react'

export default function TeamSelector({ players }) {
  const [selected, setSelected] = useState([])

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

  return (
    <div>
      <p>
        <strong>Selected:</strong> {selected.length}/23
      </p>

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
