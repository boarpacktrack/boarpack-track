export default function SkillsDashboard({ player }) {
  const skills = [
    ["Speed", player.Speed],
    ["Passing", player.Passing],
    ["Tackling", player.Tackling],
    ["Fitness", player.Fitness],
    ["Game IQ", player.Game_IQ],
["Leadership", player.Leadership],
["Defence", player.Defence],
["Handling", player.Handling],
["Kicking", player.Kicking],
  ];

  return (
    <div className="panel wide">
      <h3>🏉 Skills Dashboard</h3>

      {skills.map(([name, value]) => (
        <div key={name} style={{ marginBottom: "18px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <b>{name}</b>
            <span>{value || 0}</span>
          </div>

          <div
            style={{
              width: "100%",
              height: "10px",
              background: "#2b2b2b",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${value || 0}%`,
                height: "100%",
                background: "#f4c542",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}