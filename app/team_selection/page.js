import { Header, FooterNav } from '../components'
import { supabase } from '../../lib/supabase'
import TeamSelector from './TeamSelector'
export const dynamic = 'force-dynamic'

async function getPlayers() {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('Players')
    .select('*')
    .order('Last_name', { ascending: true })

  if (error) {
    console.log(error)
    return []
  }

  return data || []
}

export default async function TeamSelectionPage() {
  const players = await getPlayers()

  return (
    <main className="app">
      <Header active="Team Selection" />

      <section className="panel wide">
        <h2>Team Selection</h2>
        <p>Select your matchday squad.</p>

        {players.length === 0 ? (
  <p>No players found.</p>
) : (
  <TeamSelector players={players} />
)}
        
      </section>

      <FooterNav />
    </main>
  )
}
