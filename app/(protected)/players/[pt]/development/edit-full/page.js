"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditFullIPDP() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
const [player, setPlayer] = useState(null);
const [plan, setPlan] = useState(null);
const [error, setError] = useState("");
const [season, setSeason] = useState("");
const [squad, setSquad] = useState("");
const [overallRating, setOverallRating] = useState("");
const [potentialRating, setPotentialRating] = useState("");
const [overallStatus, setOverallStatus] = useState("");
const [reviewPeriodStart, setReviewPeriodStart] = useState("");
const [reviewPeriodEnd, setReviewPeriodEnd] = useState("");
const [nextReviewDate, setNextReviewDate] = useState("");
const [strengths, setStrengths] = useState([]);
const [developmentPriorities, setDevelopmentPriorities] = useState([]);
const [playerProfile, setPlayerProfile] = useState({
  
  summary: "",
  ambition: "",
  preferred_position: "",
  secondary_position: "",
});
  const [coachReview, setCoachReview] = useState("");
useEffect(() => {
  async function loadData() {
    setLoading(true);
    setError("");

    const pt = params.pt;

    const { data: playerData, error: playerError } = await supabase
      .from("Players")
      .select("*")
      .eq("Pt_number", pt)
      .single();

    if (playerError) {
      setError(playerError.message);
      setLoading(false);
      return;
    }

    setPlayer(playerData);

    const { data: planData, error: planError } = await supabase
      .from("player_development_plans")
      .select("*")
      .eq("player_id", playerData.id)
      .order("review_period_start", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    if (planError) {
      setError(planError.message);
      setLoading(false);
      return;
    }

    setPlan(planData);
    if (planData) {
  setSeason(planData.season || "");
  setSquad(planData.squad || "");
 setOverallRating(planData.overall_rating || playerData.Overall || "");
  setPotentialRating(planData.potential_rating ?? "");
  setOverallStatus(planData.overall_status || "");
  setReviewPeriodStart(planData.review_period_start || "");
setReviewPeriodEnd(planData.review_period_end || "");
setNextReviewDate(planData.next_review_date || "");
setDevelopmentPriorities(
  Array.isArray(planData.development_priorities)
    ? planData.development_priorities
    : []);
setStrengths(Array.isArray(planData.strengths) ? planData.strengths : []);
setPlayerProfile(
  planData.player_profile || {
    summary: "",
    ambition: "",
    preferred_position: "",
    secondary_position: "",
  }
);
setCoachReview(planData.coach_review || "");
}
    setLoading(false);
  }

  loadData();
}, [params.pt]);
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#071a33",
        color: "white",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <p style={{ color: "#f5a623", fontWeight: "800" }}>
          BOAR PACK TRACK
        </p>

        <h1 style={{ fontSize: "38px", margin: "8px 0" }}>
          Edit Full IPDP
        </h1>

        <p>Full Individual Player Development Plan editor.</p>
        {loading && <p>Loading existing IPDP...</p>}

{error && (
  <p style={{ color: "#ff6b6b", fontWeight: "700" }}>
    {error}
  </p>
)}

{!loading && player && plan && (
  <div style={{ marginTop: "30px" }}>
    <h2>{player.First_name} {player.Last_name}</h2>
    <label style={{ display: "block", marginTop: "20px", fontWeight: "700" }}>
  Season
</label>
<input
  type="text"
  value={season}
  onChange={(e) => setSeason(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    marginTop: "6px",
    borderRadius: "8px",
    border: "1px solid #334155",
    fontSize: "16px",
  }}
/>
<label style={{ display: "block", marginTop: "20px", fontWeight: "700" }}>
  Squad
</label>
<input
  type="text"
  value={squad}
  onChange={(e) => setSquad(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    marginTop: "6px",
    borderRadius: "8px",
    border: "1px solid #334155",
    fontSize: "16px",
  }}
/>
<label style={{ display: "block", marginTop: "20px", fontWeight: "700" }}>
  Review Period Start
</label>
<input
  type="date"
  value={reviewPeriodStart}
  onChange={(e) => setReviewPeriodStart(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    marginTop: "6px",
    borderRadius: "8px",
    border: "1px solid #334155",
    fontSize: "16px",
  }}
/>

<label style={{ display: "block", marginTop: "20px", fontWeight: "700" }}>
  Review Period End
</label>
<input
  type="date"
  value={reviewPeriodEnd}
  onChange={(e) => setReviewPeriodEnd(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    marginTop: "6px",
    borderRadius: "8px",
    border: "1px solid #334155",
    fontSize: "16px",
  }}
/>

<label style={{ display: "block", marginTop: "20px", fontWeight: "700" }}>
  Next Review Date
</label>
<input
  type="date"
  value={nextReviewDate}
  onChange={(e) => setNextReviewDate(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    marginTop: "6px",
    borderRadius: "8px",
    border: "1px solid #334155",
    fontSize: "16px",
  }}
/>
<label style={{ display: "block", marginTop: "20px", fontWeight: "700" }}>
  Overall Rating
</label>
<input
  type="number"
  min="0"
  max="100"
  value={overallRating}
  onChange={(e) => setOverallRating(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    marginTop: "6px",
    borderRadius: "8px",
    border: "1px solid #334155",
    fontSize: "16px",
  }}
/>

<label style={{ display: "block", marginTop: "20px", fontWeight: "700" }}>
  Potential Rating
</label>
<input
  type="number"
  min="0"
  max="100"
  value={potentialRating}
  onChange={(e) => setPotentialRating(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    marginTop: "6px",
    borderRadius: "8px",
    border: "1px solid #334155",
    fontSize: "16px",
  }}
/>
<p>Status: {overallStatus || "Not set"}</p>
<div style={{ marginTop: "30px" }}>
  <h2 style={{ color: "#f5a623" }}>Player Strengths</h2>

  {strengths.map((strength, index) => (
    <input
      key={index}
      type="text"
      value={strength}
      onChange={(e) => {
        const updated = [...strengths];
        updated[index] = e.target.value;
        setStrengths(updated);
      }}
      style={{
        width: "100%",
        padding: "12px",
        marginTop: "8px",
        borderRadius: "8px",
        border: "1px solid #334155",
        fontSize: "16px",
      }}
    />
  ))}
</div>
<div style={{ marginTop: "30px" }}>
  <h2 style={{ color: "#f5a623" }}>Development Priorities</h2>

  {developmentPriorities.map((priority, index) => (
    <div
      key={index}
      style={{
        marginTop: "15px",
        padding: "20px",
        border: "1px solid #334155",
        borderRadius: "10px",
      }}
    >
      <h3>Priority {index + 1}</h3>

      <input
  type="text"
  value={priority.category || ""}
  onChange={(e) => {
    const updated = [...developmentPriorities];
    updated[index] = { ...updated[index], category: e.target.value };
    setDevelopmentPriorities(updated);
  }}
  style={{
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    borderRadius: "8px",
    border: "1px solid #334155",
    fontSize: "16px",
  }}
/>
      <input
  type="text"
  value={priority.target || ""}
  onChange={(e) => {
    const updated = [...developmentPriorities];
    updated[index] = { ...updated[index], target: e.target.value };
    setDevelopmentPriorities(updated);
  }}
  style={{
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    borderRadius: "8px",
    border: "1px solid #334155",
    fontSize: "16px",
  }}
/>
      <textarea
  value={priority.smart_goal || ""}
  onChange={(e) => {
    const updated = [...developmentPriorities];
    updated[index] = { ...updated[index], smart_goal: e.target.value };
    setDevelopmentPriorities(updated);
  }}
  rows={3}
  style={{
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    borderRadius: "8px",
    border: "1px solid #334155",
    fontSize: "16px",
  }}
/>
     <textarea
  value={priority.actions || ""}
  onChange={(e) => {
    const updated = [...developmentPriorities];
    updated[index] = { ...updated[index], actions: e.target.value };
    setDevelopmentPriorities(updated);
  }}
  rows={3}
  style={{
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    borderRadius: "8px",
    border: "1px solid #334155",
    fontSize: "16px",
  }}
/>
      <input
  type="number"
  min="0"
  max="100"
  value={priority.progress ?? 0}
  onChange={(e) => {
    const updated = [...developmentPriorities];
    updated[index] = {
      ...updated[index],
      progress: Number(e.target.value),
    };
    setDevelopmentPriorities(updated);
  }}
  style={{
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    borderRadius: "8px",
    border: "1px solid #334155",
    fontSize: "16px",
  }}
/>
     <select
  value={priority.status || "Active"}
  onChange={(e) => {
    const updated = [...developmentPriorities];
    updated[index] = {
      ...updated[index],
      status: e.target.value,
    };
    setDevelopmentPriorities(updated);
  }}
  style={{
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    borderRadius: "8px",
    border: "1px solid #334155",
    fontSize: "16px",
  }}
>
  <option value="Active">Active</option>
  <option value="Completed">Completed</option>
  <option value="On Hold">On Hold</option>
</select>
    </div>
  ))}
</div>
<div style={{ marginTop: "30px" }}>
  <h2 style={{ color: "#f5a623" }}>Player Profile</h2>

  <p>Profile Summary</p>
  <textarea
    value={playerProfile.summary || ""}
    onChange={(e) =>
      setPlayerProfile({ ...playerProfile, summary: e.target.value })
    }
    rows={3}
    style={{
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #334155",
      fontSize: "16px",
    }}
  />
  <p>Player Ambition</p>
<textarea
  value={playerProfile.ambition || ""}
  onChange={(e) =>
    setPlayerProfile({ ...playerProfile, ambition: e.target.value })
  }
  rows={3}
  style={{
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    borderRadius: "8px",
    border: "1px solid #334155",
    fontSize: "16px",
  }}
/>
<p>Preferred Position</p>
<input
  type="text"
  value={playerProfile.preferred_position || ""}
  onChange={(e) =>
    setPlayerProfile({
      ...playerProfile,
      preferred_position: e.target.value,
    })
  }
  style={{
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    borderRadius: "8px",
    border: "1px solid #334155",
    fontSize: "16px",
  }}
/>
<p>Secondary Position</p>
<input
  type="text"
  value={playerProfile.secondary_position || ""}
  onChange={(e) =>
    setPlayerProfile({
      ...playerProfile,
      secondary_position: e.target.value,
    })
  }
  style={{
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    borderRadius: "8px",
    border: "1px solid #334155",
    fontSize: "16px",
  }}
/>
</div>
<div style={{ marginTop: "30px" }}>
  <h2 style={{ color: "#f5a623" }}>Coach Review</h2>

  <textarea
    value={coachReview}
    onChange={(e) => setCoachReview(e.target.value)}
    rows={5}
    style={{
      width: "100%",
      padding: "12px",
      marginTop: "8px",
      borderRadius: "8px",
      border: "1px solid #334155",
      fontSize: "16px",
    }}
  />
</div>
  </div>
)}
      </div>
    </main>
  );
}