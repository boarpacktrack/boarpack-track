export default function RugbyPitch({ players = [], selected = [] }) {
const selectedPlayers = selected.map((playerId) =>
  players.find((player) => player.id === playerId)
)
      const positions = [
    { number: 1, left: "18%", top: "34%" },
    { number: 2, left: "18%", top: "50%" },
    { number: 3, left: "18%", top: "66%" },

    { number: 4, left: "28%", top: "41%" },
    { number: 5, left: "28%", top: "59%" },

    { number: 6, left: "39%", top: "30%" },
    { number: 8, left: "39%", top: "50%" },
    { number: 7, left: "39%", top: "70%" },

    { number: 9, left: "49%", top: "60%" },
    { number: 10, left: "57%", top: "48%" },

    { number: 11, left: "69%", top: "18%" },
    { number: 12, left: "69%", top: "39%" },
    { number: 13, left: "69%", top: "61%" },
    { number: 14, left: "69%", top: "82%" },

    { number: 15, left: "82%", top: "50%" }
  ]

  const bench = [
  { number: 16 },
  { number: 17 },
  { number: 18 },
  { number: 19 },
  { number: 20 },
  { number: 21 },
  { number: 22 },
  { number: 23 }
]
  return (
    <div
      style={{
       width: "100%",
marginTop: "20px",
position: "relative",
left: "50%",
transform: "translateX(-50%)",
display: "flex",
flexDirection: "column",
alignItems: "center"
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "14px"
        }}
      >
        🏉 Matchday Team
      </h2>

      <div
        style={{
          width: "calc(100vw - 80px)",
maxWidth: "1100px",
height: "460px",
          position: "relative",
          overflow: "hidden",
          borderRadius: "20px",
          border: "4px solid white",
          background:
            "repeating-linear-gradient(90deg, #1f7a38 0px, #1f7a38 70px, #248642 70px, #248642 140px)",
          boxShadow: "0 10px 30px rgba(0,0,0,.35)"
        }}
      >
        {/* Outer pitch line */}
        <div
          style={{
            position: "absolute",
            inset: "18px",
            border: "3px solid white"
          }}
        />

        {/* Left try line */}
        <div
          style={{
            position: "absolute",
            top: "18px",
            bottom: "18px",
            left: "10%",
            width: "3px",
            background: "white"
          }}
        />

        {/* Right try line */}
        <div
          style={{
            position: "absolute",
            top: "18px",
            bottom: "18px",
            right: "10%",
            width: "3px",
            background: "white"
          }}
        />

        {/* Left 22 */}
        <div
          style={{
            position: "absolute",
            top: "18px",
            bottom: "18px",
            left: "24%",
            width: "3px",
            background: "rgba(255,255,255,.85)"
          }}
        />

        {/* Right 22 */}
        <div
          style={{
            position: "absolute",
            top: "18px",
            bottom: "18px",
            right: "24%",
            width: "3px",
            background: "rgba(255,255,255,.85)"
          }}
        />

        {/* Halfway line */}
        <div
          style={{
            position: "absolute",
            top: "18px",
            bottom: "18px",
            left: "50%",
            width: "3px",
            background: "white",
            transform: "translateX(-50%)"
          }}
        />

        {/* Left 10 metre line */}
        <div
          style={{
            position: "absolute",
            top: "18px",
            bottom: "18px",
            left: "42%",
            borderLeft: "2px dashed rgba(255,255,255,.7)"
          }}
        />

        {/* Right 10 metre line */}
        <div
          style={{
            position: "absolute",
            top: "18px",
            bottom: "18px",
            right: "42%",
            borderLeft: "2px dashed rgba(255,255,255,.7)"
          }}
        />

        {/* Centre spot */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: "white",
            transform: "translate(-50%, -50%)"
          }}
        />

        {/* Left posts */}
<div
  style={{
    position: "absolute",
    left: "6%",
    top: "50%",
    transform: "translateY(-50%)",
    width: "70px",
    height: "110px"
  }}
>
  <div
    style={{
      position: "absolute",
      left: "12px",
      top: "0",
      width: "4px",
      height: "110px",
      background: "white"
    }}
  />
  <div
    style={{
      position: "absolute",
      right: "12px",
      top: "0",
      width: "4px",
      height: "110px",
      background: "white"
    }}
  />
  <div
    style={{
      position: "absolute",
      left: "12px",
      right: "12px",
      top: "55px",
      height: "4px",
      background: "white"
    }}
  />
</div>

{/* Right posts */}
<div
  style={{
    position: "absolute",
    right: "6%",
    top: "50%",
    transform: "translateY(-50%)",
    width: "70px",
    height: "110px"
  }}
>
  <div
    style={{
      position: "absolute",
      left: "12px",
      top: "0",
      width: "4px",
      height: "110px",
      background: "white"
    }}
  />
  <div
    style={{
      position: "absolute",
      right: "12px",
      top: "0",
      width: "4px",
      height: "110px",
      background: "white"
    }}
  />
  <div
    style={{
      position: "absolute",
      left: "12px",
      right: "12px",
      top: "55px",
      height: "4px",
      background: "white"
    }}
  />
</div>
        {/* Starting XV position markers */}
        {positions.map((position) => (
          <div
            key={position.number}
            style={{
              position: "absolute",
              left: position.left,
              top: position.top,
              transform: "translate(-50%, -50%)",
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "#123a6d",
              border: "3px solid #f0c23a",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "11px",
              textAlign: "center",
              padding: "4px",
              lineHeight: "1.1",
              boxShadow: "0 4px 10px rgba(0,0,0,.4)",
              zIndex: 999
            }}
          >
            {selectedPlayers[position.number - 1] ? (
  <div style={{ textAlign: "center" }}>
    <div>{selectedPlayers[position.number - 1].First_name}</div>
    <div style={{ fontSize: "15px", marginTop: "2px" }}>
      {position.number}
    </div>
  </div>
) : (
  position.number
)}
          </div>
        ))}
        </div>
        <h3
  style={{
    color: "white",
    marginTop: "30px",
    marginBottom: "16px",
    textAlign: "center"
  }}
>
🟨 Replacements
</h3>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    width: "100%",
    maxWidth: "1100px"
  }}
>

{bench.map((player) => (

<div
key={player.number}
style={{
background:"#123a6d",
border:"3px solid #f0c23a",
borderRadius:"16px",
padding:"16px",
textAlign:"center",
color:"white",
fontWeight:"bold",
boxShadow:"0 4px 12px rgba(0,0,0,.35)"
}}
>

<div style={{fontSize:"24px"}}>
{player.number}
</div>

<div
style={{
marginTop:"10px",
fontSize:"16px",
opacity:.8
}}
>
Select Player
</div>

</div>

))}

</div>
      </div>
  )
}