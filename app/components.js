export function Header({active}) {
  const items = [
    ['/', 'Dashboard'],
    ['/players', 'Players'],
    ['/training', 'Training'],
    ['/match-day', 'Match Day'],
  ]

  return (
    <header className="header">
      <div className="brand">
        <div className="boar">🐗</div>
        <div>
          <h1>BOARPACK <span className="gold">TRACK</span></h1>
          <div className="tag">Built by coaches · For coaches</div>
        </div>
      </div>
      <nav className="nav">
        {items.map(([href, label]) => (
          <a key={href} className={active === label ? 'active' : ''} href={href}>{label}</a>
        ))}
      </nav>
    </header>
  )
}

export function FooterNav() {
  return (
    <nav className="footerNav">
      <a href="/"><b>🏠</b>Home</a>
      <a href="/players"><b>👥</b>Players</a>
      <a href="/training"><b>✅</b>Training</a>
      <a href="/match-day"><b>🏉</b>Match</a>
    </nav>
  )
}
