import { Header, FooterNav } from '../../components'
import { supabase } from '../../../lib/supabase'

async function getPlayer(pt) {
  if (!supabase) return null
  const { data } = await supabase.from('Players').select('*').eq('pt_number', pt).single()
  return data
}

export default async function PlayerProfile({ params }) {
  const player = await getPlayer(params.pt)

  return (
    <main className="app">
      <Header active="Players" />
      {!player ? (
        <section className="panel" style={{marginTop:16}}>
          <h2>Player not found</h2>
          <p className="small">Check the PT number or import the squad data.</p>
        </section>
      ) : (
        <section className="grid">
          <div className="panel wide">
            <div className="pt">{player.pt_number}</div>
            <h2>{player.first_name} {player.last_name}</h2>
            <p className="small">{player.primary_position} {player.secondary_position ? `· ${player.secondary_position}` : ''}</p>
            <div className="stats">
              <div className="stat"><b>{player.caps || 0}</b>Career Caps</div>
              <div className="stat"><b>{player.tries || 0}</b>2027 Tries</div>
              <div className="stat"><b>{player.conversions || 0}</b>Conversions</div>
              <div className="stat"><b>{player.pack_score || 0}</b>Pack Score</div>
            </div>
          </div>
          <div className="panel half">
            <h3>Strengths</h3>
            <p>{player.strengths}</p>
          </div>
          <div className="panel half">
            <h3>Development Areas</h3>
            <p>{player.development}</p>
          </div>
          <div className="panel wide">
            <h3>Coach Notes / Awards</h3>
            <p>{player.awards || 'To be added.'}</p>
          </div>
        </section>
      )}
      <FooterNav />
    </main>
  )
}
