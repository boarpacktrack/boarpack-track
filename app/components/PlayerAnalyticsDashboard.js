"use client";
export default function PlayerAnalyticsDashboard({ player, reviews = [], achievements = [],}) {
    const sortedReviews = [...reviews].sort(
  (a, b) => new Date(a.review_date || a.created_at) - new Date(b.review_date || b.created_at)
);

const firstRating = Number(sortedReviews[0]?.overall_rating || 0);

const latestRating = Number(
  sortedReviews[sortedReviews.length - 1]?.overall_rating || 0
);

const ratingChange = latestRating - firstRating;
const playerOfMatch = achievements.filter(
  (a) => a.achievement_type === "Player of the Match"
).length;

const coachesPlayer = achievements.filter(
  (a) => a.achievement_type === "Coaches Player"
).length;

const magicMoment = achievements.filter(
  (a) => a.achievement_type === "Magic Moment"
).length;
const ratings = [
  player?.Speed,
  player?.Handling,
  player?.Passing,
  player?.Tackling,
  player?.Game_IQ,
  player?.Fitness,
  player?.Leadership,
  player?.Defence,
  player?.Kicking,
].filter((value) => typeof value === "number");

const overall = ratings.length
  ? Math.round(
      ratings.reduce((total, value) => total + value, 0) / ratings.length
    )
  : 0;
const reviewAverage = latestRating;

const awardScore = Math.min(
  achievements.length * 5,
  20
);

const packScore = Math.min(
  100,
  Math.round(
    overall * 0.7 +
    reviewAverage * 2 +
    awardScore
  )
);
  return (
    <div
      className="panel wide"
      style={{
        background: "#163d75",
        borderRadius: "16px",
        padding: "20px",
        marginTop: "20px",
      }}
    >
      <h2 style={{ marginTop: 0 }}>📊 Player Analytics Dashboard</h2>
<div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
    padding: "16px",
    marginTop: "14px",
    borderRadius: "14px",
    background: "rgba(0,0,0,0.2)",
  }}
>
  <div>
    <div style={{ fontSize: "14px", opacity: 0.8 }}>🐗 Pack Score</div>
    <div style={{ fontSize: "42px", fontWeight: "bold" }}>
      {packScore}
    </div>
  </div>

  <div style={{ fontSize: "22px", fontWeight: "bold" }}>
    {packScore >= 90
      ? "🟢 Elite Pack Member"
      : packScore >= 80
      ? "🔵 Pack Leader"
      : packScore >= 70
      ? "🟡 Developing Well"
      : packScore >= 60
      ? "🟠 On Track"
      : "🔴 Needs Support"}
  </div>
</div>
    <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
    marginTop: "20px",
  }}
>
  <div className="panel">
  <h3>📈 Performance Trend</h3>

  <div style={{ marginTop: "12px" }}>
    <strong>Current Rating</strong>
    <div style={{ fontSize: "28px", fontWeight: "bold" }}>
      {latestRating}/10
    </div>
  </div>

  <div style={{ marginTop: "16px" }}>
    <strong>Trend</strong>
    <div style={{ fontSize: "22px", fontWeight: "bold" }}>
      {ratingChange > 0
        ? "🟢 Improving"
        : ratingChange < 0
        ? "🔴 Declining"
        : "🟡 Stable"}
    </div>
  </div>

  <div style={{ marginTop: "16px" }}>
    <strong>Total Reviews</strong>
    <div>{sortedReviews.length}</div>
  </div>
</div>

  <div className="panel">
    <h3>📅 Attendance</h3>
    <p>Coming next...</p>
  </div>

  <div className="panel">
    <h3>🧠 Coach Summary</h3>
    <p>Coming next...</p>
  </div>

  <div className="panel">
  <h3>🏆 Awards</h3>

  <div style={{ marginTop: "14px", lineHeight: "1.9" }}>
    <div>
      🥇 Player of the Match: <strong>{playerOfMatch}</strong>
    </div>

    <div>
      ⭐ Coaches Player: <strong>{coachesPlayer}</strong>
    </div>

    <div>
      🔥 Magic Moment: <strong>{magicMoment}</strong>
    </div>

    <div style={{ marginTop: "10px", fontSize: "20px", fontWeight: "bold" }}>
      Total Awards: {achievements.length}
    </div>
  </div>
</div>
</div>
    </div>
  );
}