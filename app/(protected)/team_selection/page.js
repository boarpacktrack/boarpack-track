import { Header, FooterNav } from "@/components"
import { supabase } from "@/lib/supabase"
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
async function getMatch() {
  if (!supabase) return null

  const { data } = await supabase
    .from('Matches')
    .select('Matchday_squad, Captain, Vice_captain, Forwards_captain')
    .eq('id', 1)
    .single()

  return data
}
export default async function TeamSelectionPage() {
  const players = await getPlayers()
const match = await getMatch()
  return (
    <main className="app">
      <Header active="Team Selection" />

      <section className="panel wide">
        <h2>Team Selection</h2>
        <p>Select your matchday squad.</p>

        {players.length === 0 ? (
  <p>No players found.</p>
) : (
  <TeamSelector
  players={players}
  savedSquad={match?.Matchday_squad || []}
  savedCaptain={match?.Captain || ""}
  savedViceCaptain={match?.Vice_captain || ""}
  savedForwardsCaptain={match?.Forwards_captain || ""}
/>
)}
        
      </section>

      <FooterNav />
    </main>
  )
}
