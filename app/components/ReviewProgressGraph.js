"use client";

export default function ReviewProgressGraph({ reviews = [] }) {
  const sortedReviews = [...reviews].sort(
    (a, b) => new Date(a.review_date) - new Date(b.review_date)
  );

  const firstRating = Number(sortedReviews[0]?.overall_rating || 0);
  const latestRating = Number(
    sortedReviews[sortedReviews.length - 1]?.overall_rating || 0
  );

  const improvement = latestRating - firstRating;
const graphWidth = 800;
const graphHeight = 220;
const graphPadding = 35;

const graphPoints = sortedReviews.map((review, index) => {
  const rating = Number(review.overall_rating || 0);

  const x =
    sortedReviews.length === 1
      ? graphWidth / 2
      : graphPadding +
        (index * (graphWidth - graphPadding * 2)) /
          (sortedReviews.length - 1);

  const y =
    graphHeight -
    graphPadding -
    (rating / 10) * (graphHeight - graphPadding * 2);

  return {
    x,
    y,
    rating,
    date: review.review_date || review.created_at,
  };
});
  return (
    <div
      className="panel wide"
      style={{
        padding: "20px",
        borderRadius: "16px",
        background: "#163d75",
        color: "#fff",
        marginTop: "20px",
        width: "100%",
      }}
    >
      <h2 style={{ marginTop: 0 }}>📈 Review Progress</h2>

      {sortedReviews.length === 0 ? (
        <p>No coach reviews have been added yet.</p>
      ) : (
        <>
          <svg
  viewBox={`0 0 ${graphWidth} ${graphHeight}`}
  style={{
    width: "100%",
    height: "260px",
    marginBottom: "20px",
  }}
>
  <line
    x1={graphPadding}
    y1={graphHeight - graphPadding}
    x2={graphWidth - graphPadding}
    y2={graphHeight - graphPadding}
    stroke="rgba(255,255,255,0.35)"
    strokeWidth="2"
  />

  <polyline
    fill="none"
    stroke="#f5b51b"
    strokeWidth="4"
    points={graphPoints.map((p) => `${p.x},${p.y}`).join(" ")}
  />

  {graphPoints.map((point, index) => (
    <g key={index}>
      <circle
        cx={point.x}
        cy={point.y}
        r="6"
        fill="#f5b51b"
      />

      <text
        x={point.x}
        y={point.y - 12}
        textAnchor="middle"
        fill="white"
        fontSize="14"
      >
        {point.rating}
      </text>

      <text
        x={point.x}
        y={graphHeight - 8}
        textAnchor="middle"
        fill="white"
        fontSize="12"
      >
        {point.date
          ? new Date(point.date).toLocaleDateString("en-GB")
          : ""}
      </text>
    </g>
  ))}
</svg>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            <div>
              <strong>Latest rating</strong>
              <div style={{ fontSize: "20px", marginTop: "6px" }}>
                {"⭐".repeat(latestRating)}
                {"☆".repeat(10 - latestRating)} ({latestRating}/10)
              </div>
            </div>

            <div>
              <strong>Progress since first review</strong>
              <div style={{ fontSize: "20px", marginTop: "6px" }}>
                {improvement > 0
                  ? `+${improvement}`
                  : improvement === 0
                  ? "No change"
                  : improvement}
              </div>
            </div>

            <div>
              <strong>Total reviews</strong>
              <div style={{ fontSize: "20px", marginTop: "6px" }}>
                {sortedReviews.length}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}