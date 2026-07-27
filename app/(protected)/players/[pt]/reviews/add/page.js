"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
export default function AddReviewPage() {
    const params = useParams();
const router = useRouter();
const [form, setForm] = useState({
  coach_name: "",
  review_date: "",
  overall_rating: "",
  strengths: "",
  development_areas: "",
  coach_comments: "",
  next_review_date: "",
  review_status: "On Track",
});
async function handleSubmit(e) {
  e.preventDefault();
 const { data: player, error: playerError } = await supabase
  .from("Players")
  .select("id")
  .eq("Pt_number", params.pt)
  .single();
  if (playerError) {
  console.error("Player lookup error:", playerError);
  return;
}
const { error } = await supabase
  .from("player_coach_reviews")
.insert({
  player_id: player.id,
  ...form,
  review_date: form.review_date || null,
  next_review_date: form.next_review_date || null,
});
  if (error) {
  alert(JSON.stringify(error));
  return;
}
router.push(`/players/${params.pt}`);
router.refresh();
}
  return (
    <main style={{ padding: "30px" }}>
  <form onSubmit={handleSubmit}>
      <h1>Add Coach Review</h1>
      <label
  style={{
    display: "block",
    marginTop: "20px",
    marginBottom: "6px",
    fontWeight: "800",
  }}
>
  Coach Name
</label>
<label style={{ display: "block", marginTop: "20px", fontWeight: "800" }}>
  Coach Name
</label>

<input
  type="text"
  value={form.coach_name}
  onChange={(e) => setForm({ ...form, coach_name: e.target.value })}
  style={{ width: "100%", padding: "12px", marginBottom: "16px" }}
/>

<label style={{ display: "block", fontWeight: "800" }}>
  Overall Rating (1-10)
</label>

<input
  type="number"
  min="1"
  max="10"
  value={form.overall_rating}
  onChange={(e) => setForm({ ...form, overall_rating: e.target.value })}
  style={{ width: "100%", padding: "12px", marginBottom: "16px" }}
/>

<label style={{ display: "block", fontWeight: "800" }}>
  Strengths
</label>
<label style={{ display: "block", fontWeight: "800" }}>
  Development Areas
</label>

<textarea
  rows="3"
  value={form.development_areas}
  onChange={(e) =>
    setForm({ ...form, development_areas: e.target.value })
  }
  style={{ width: "100%", padding: "12px", marginBottom: "16px" }}
/>

<label style={{ display: "block", fontWeight: "800" }}>
  Coach Comments
</label>

<textarea
  rows="4"
  value={form.coach_comments}
  onChange={(e) =>
    setForm({ ...form, coach_comments: e.target.value })
  }
  style={{ width: "100%", padding: "12px", marginBottom: "16px" }}
/>

<label style={{ display: "block", fontWeight: "800" }}>
  Review Status
</label>

<select
  value={form.review_status}
  onChange={(e) =>
    setForm({ ...form, review_status: e.target.value })
  }
  style={{ width: "100%", padding: "12px", marginBottom: "16px" }}
>
  <option>On Track</option>
  <option>Needs Support</option>
  <option>Completed</option>
</select>
<textarea
  rows="3"
  value={form.strengths}
  onChange={(e) => setForm({ ...form, strengths: e.target.value })}
  style={{ width: "100%", padding: "12px", marginBottom: "16px" }}
/>
<input
  type="text"
  value={form.coach_name}
  onChange={(e) =>
    setForm({ ...form, coach_name: e.target.value })
  }
  style={{
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #94a3b8",
  }}
/>
<button
  type="submit"
  style={{
    width: "100%",
    padding: "14px",
    background: "#f5b51b",
    color: "#111827",
    fontWeight: "800",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "20px",
  }}
>
  Save Review
</button>
</form>
    </main>
  );
}