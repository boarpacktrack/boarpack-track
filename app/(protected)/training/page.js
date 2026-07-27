import { Header, FooterNav } from "@/app/components"

export default function TrainingPage() {
  return (
    <main className="app">
      <Header active="Training" />
      <section className="grid">
        <div className="panel wide">
          <h2>Training Centre</h2>
          <p className="small">Phase 3 will connect attendance directly to player records.</p>
          <div className="stats">
            <div className="stat"><b>12</b>Players</div>
            <div className="stat"><b>7:00</b>Start</div>
            <div className="stat"><b>Breakdown</b>Focus</div>
            <div className="stat"><b>0</b>Awards</div>
          </div>
        </div>
        <div className="panel half">
          <h3>Tonight's Plan</h3>
          <p>Warm up · Passing · Breakdown · Contact · Conditioned game · Cool down</p>
        </div>
        <div className="panel half">
          <h3>Next Build</h3>
          <p>Tick attendance, add awards, save coach notes and generate a training poster.</p>
        </div>
      </section>
      <FooterNav />
    </main>
  )
}
