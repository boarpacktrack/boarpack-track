import { Header, FooterNav } from '../../../components'
import { supabase } from '../../../../lib/supabase'
import { redirect } from 'next/navigation'

async function getPlayer(pt) {
  if (!supabase) return null

  const { data } = await supabase
    .from('Players')
    .select('*')
    .eq('Pt_number', pt)
    .single()

  return data
}

export default async function EditPlayerPage({ params }) {
  const { pt } = await params
  const player = await getPlayer(pt)

  async function savePlayer(formData) {
    'use server'

    const { error } = await supabase
      .from('Players')
      .update({
      First_name: formData.get('First_name'),
Last_name: formData.get('Last_name'),
Primary_position: formData.get('Primary_position'),
Secondary_position: formData.get('Secondary_position'),
        Caps: Number(formData.get('Caps')),
        Speed: Number(formData.get('Speed')),
        Passing: Number(formData.get('Passing')),
        Tackling: Number(formData.get('Tackling')),
        Handling: Number(formData.get('Handling')),
Fitness: Number(formData.get('Fitness')),
Game_IQ: Number(formData.get('Game_IQ')),
Leadership: Number(formData.get('Leadership')),
Defence: Number(formData.get('Defence')),
Kicking: Number(formData.get('Kicking')),
        Potential: Number(formData.get('Potential')),
      })
      .eq('Pt_number', player.Pt_number)
      if (error) {
        console.log(error)
      }

    redirect(`/players/${pt}`)
  }

  return (
    <main className="app">
      <Header active="Players" />

      <a href={`/players/${pt}`} style={{ color: "#f5b51b", fontWeight: "bold" }}>
        ← Back to Profile
      </a>

      <section className="panel wide">
        <h2>Edit Player</h2>

        {!player ? (
          <p>Player not found.</p>
        ) : (
          <form action={savePlayer} className="grid">
            <div className="panel half">
              <label>First Name</label>
              <input name="First_name" defaultValue={player.First_name || ''} />

              <label>Last Name</label>
              <input name="Last_name" defaultValue={player.Last_name || ''} />

              <label>Primary Position</label>
              <input name="Primary_position" defaultValue={player.Primary_position || ''} />

              <label>Secondary Position</label>
              <input name="Secondary_position" defaultValue={player.Secondary_position || ''} />

              <label>Caps</label>
              <input name="Caps" type="number" defaultValue={player.Caps || 0} />
            </div>

            <div className="panel half">
              <label>Speed</label>
              <input name="Speed" type="number" defaultValue={player.Speed || 0} />

              <label>Passing</label>
              <input name="Passing" type="number" defaultValue={player.Passing || 0} />

              <label>Tackling</label>
              <input name="Tackling" type="number" defaultValue={player.Tackling || 0} />
<label>Handling</label>
<input name="Handling" type="number" defaultValue={player.Handling || 0} />

<label>Fitness</label>
<input name="Fitness" type="number" defaultValue={player.Fitness || 0} />

<label>Game IQ</label>
<input name="Game_IQ" type="number" defaultValue={player.Game_IQ || 0} />

<label>Leadership</label>
<input name="Leadership" type="number" defaultValue={player.Leadership || 0} />

<label>Defence</label>
<input name="Defence" type="number" defaultValue={player.Defence || 0} />

<label>Kicking</label>
<input name="Kicking" type="number" defaultValue={player.Kicking || 0} />
              <label>Potential</label>
              <input name="Potential" type="number" defaultValue={player.Potential || 0} />

              <button type="submit">💾 Save Changes</button>
            </div>
          </form>
        )}
      </section>

      <FooterNav />
    </main>
  )
}