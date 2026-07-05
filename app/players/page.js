import { Header, FooterNav } from '../components'
import { supabase } from '../../lib/supabase'

async function getPlayers() {
  if (!supabase) return []
  const { data } = await supabase.from('Players').select('*').order('Pt_number')
  return data || []
}

export default async function PlayersPage() {
  const players = await getPlayers()

  return (
    <main className="app">
      <Header active="Players" />
      <section className="grid">
        <div className="panel wide">
          <h2>Bradford Salem U14s Players</h2>
          <p className="small">Live squad pulled from Supabase.</p>
          <div className="cards">
            {players.map((p) => (
              <a className="card" key={p.id || p.pt_number} href={`/players/${p.Pt_number}`}>
                <div className="pt">{p.pt_number}</div>
                <div className="name">{p.First_name} {p.Last_name}</div>
                <div>{p.Primary_position}</div>
                <span className="badge">{p.Caps || 0} Caps</span>
                {p.Secondary_position && <span className="badge">{p.Secondary_position}</span>}
              </a>
            ))}
            {!players.length && (
              <div className="card">
                <div className="pt">NO DATA YET</div>
                <div className="name">Import players in Supabase</div>
                <p className="small">Once the players table has rows, they will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </section>
      <FooterNav />
    </main>
  )
}
