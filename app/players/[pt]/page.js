import { Header, FooterNav } from '../../components'
import { supabase } from '../../../lib/supabase'

async function getPlayer(pt) {
  if (!supabase) return null
  const { data } = await supabase.from('Players').select('*').eq('Pt_number', pt).single()
  return data
}

export default async function PlayerProfile({ params }) {
  const {pt} = await params 
    const player = await getPlayer(pt)

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
          <div className="panel wide" style={{ textAlign: 'center' }}>
    {player.Profile_image && (
  <img
    src={player.Profile_image}
    alt={`${player.First_name} ${player.Last_name}`}
    style={{
      width: '220px',
      height: '220px',
      borderRadius: '50%',
      objectFit: 'cover',
      marginBottom: '16px',
      border:'4px solid #f5b51b',
boxShadow:'0 10px 30px rgba(0,0,0,0.35)'
    }}
  />
)}
            <div className="pt">{player.Pt_number}</div>
            <h2>{player.First_name} {player.Last_name}</h2>
            <p className="small">{player.Primary_position} {player.Secondary_position ? `· ${player.Secondary_position}` : ''}</p>
            <div className="stats">
<div className="stat"><b>{player.Overall || 0}</b>Overall</div>
              <div className="stat"><b>{player.Caps || 0}</b>Career Caps</div>
              <div className="stat"><b>{player.Tries || 0}</b>2027 Tries</div>
              <div className="stat"><b>{player.Conversions || 0}</b>Conversions</div>
              <div className="stat"><b>{player.Pack_score || 0}</b>Pack Score</div>
            </div>
          </div>
          <div className="panel half">
            <h3>Strengths</h3>
            <p>{player.Strengths}</p>
          </div>
          <div className="panel half">
            <h3>Development Areas</h3>
            <p>{player.Development}</p>
          </div>
          <div className="panel wide">
            <h3>Coach Notes / Awards</h3>
            <p>{player.Awards || 'To be added.'}</p>
          </div>
        </section>
      )}
      <FooterNav />
    </main>
  )
}
