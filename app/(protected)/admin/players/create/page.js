"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header, FooterNav } from "@/app/components";
import { supabase } from "@/lib/supabase";

const initialForm = {
  club_id: "",
  team_id: "",
  Name:"",
  Primary_Position: "",
  Secondary_Position: "",
  Join_Date: "",
  Caps: "0",
  Strengths: "",
  Development_Areas: "",
  Coach_Notes: "",
  captain: false,
  Speed: "0",
  Handling: "0",
  Passing: "0",
  Tackling: "0",
  Game_IQ: "0",
  Fitness: "0",
  Leadership: "0",
  Defence: "0",
  Kicking: "0",
  Potential: "0",
};

const positions = [
  "Loosehead Prop",
  "Hooker",
  "Tighthead Prop",
  "Second Row",
  "Blindside Flanker",
  "Openside Flanker",
  "Number 8",
  "Scrum Half",
  "Fly Half",
  "Left Wing",
  "Inside Centre",
  "Outside Centre",
  "Right Wing",
  "Full Back",
  "Utility Forward",
  "Utility Back",
];

const ratingFields = [
  ["Speed", "Speed"],
  ["Handling", "Handling"],
  ["Passing", "Passing"],
  ["Tackling", "Tackling"],
  ["Game_IQ", "Game IQ"],
  ["Fitness", "Fitness"],
  ["Leadership", "Leadership"],
  ["Defence", "Defence"],
  ["Kicking", "Kicking"],
  ["Potential", "Potential"],
];

export default function AddPlayerPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
const [clubs, setClubs] = useState([]);
const [teams, setTeams] = useState([]);
 function updateField(event) {
  const { name, value, type, checked } = event.target;

  setForm((current) => ({
    ...current,
    [name]: type === "checkbox" ? checked : value,
    ...(name === "club_id" ? { team_id: "" } : {}),
  }));

  if (name === "club_id") {
    loadTeams(value);
  }
}
useEffect(() => {
  loadClubs();
}, []);

async function loadClubs() {
  const { data, error } = await supabase
    .from("clubs")
    .select("*")
    .eq("is_active", true)
    .order("Name");
console.log("Clubs data:", data);
console.log("Clubs error:", error);
  if (!error) {
    setClubs(data || []);
  }
}
async function loadTeams(clubId) {
  if (!clubId) {
    setTeams([]);
    return;
  }

  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("club_id", Number(clubId))
    .eq("is_active", true)
    .order("team_name");

  console.log("Teams data:", data);
  console.log("Teams error:", error);

  if (error) {
    setTeams([]);
    setErrorMessage(error.message || "Teams could not be loaded.");
    return;
  }

  setTeams(data || []);
}
  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

  

    if (!form.Name.trim()) {
      setErrorMessage("Please enter the player's name.");
      return;
    }

    if (!form.Primary_Position) {
      setErrorMessage("Please choose a primary position.");
      return;
    }

    setSaving(true);

    const playerRecord = {
      
      Name: form.Name.trim(),
      Primary_Position: form.Primary_Position,
      Secondary_Position: form.Secondary_Position || null,
      Join_Date: form.Join_Date || null,
      Caps: Number(form.Caps) || 0,
      Strengths: form.Strengths.trim() || null,
      Development_Areas: form.Development_Areas.trim() || null,
      Coach_Notes: form.Coach_Notes.trim() || null,
      captain: form.captain,
      Speed: Number(form.Speed) || 0,
      Handling: Number(form.Handling) || 0,
      Passing: Number(form.Passing) || 0,
      Tackling: Number(form.Tackling) || 0,
      Game_IQ: Number(form.Game_IQ) || 0,
      Fitness: Number(form.Fitness) || 0,
      Leadership: Number(form.Leadership) || 0,
      Defence: Number(form.Defence) || 0,
      Kicking: Number(form.Kicking) || 0,
      Potential: Number(form.Potential) || 0,
    };

    const { error } = await supabase.from("Players").insert(playerRecord);

    if (error) {
      console.error("Player creation error:", error);
      setErrorMessage(error.message || "The player could not be added.");
      setSaving(false);
      return;
    }

    router.push("/players");
    router.refresh();
  }

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(15,23,42,0.9)",
    color: "#ffffff",
    fontSize: "15px",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "7px",
    color: "#f5b51b",
    fontSize: "14px",
    fontWeight: "900",
  };

  const panelStyle = {
    marginTop: "20px",
    padding: "22px",
    borderRadius: "18px",
    background:
      "linear-gradient(135deg, rgba(31,41,55,0.98), rgba(17,24,39,0.98))",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
  };

  return (
    <main className="app">
      <Header active="Admin" />

      <a
        href="/admin"
        style={{
          display: "inline-block",
          marginTop: "18px",
          color: "#f5b51b",
          fontWeight: "900",
          textDecoration: "none",
        }}
      >
        ← Back to Admin Dashboard
      </a>

      <section
        style={{
          marginTop: "16px",
          padding: "26px",
          borderRadius: "20px",
          background:
            "linear-gradient(135deg, rgba(17,24,39,0.98), rgba(23,53,98,0.96))",
          border: "1px solid rgba(245,181,27,0.35)",
          borderBottom: "4px solid #f5b51b",
          boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
        }}
      >
        <p
          style={{
            margin: "0 0 6px",
            color: "#f5b51b",
            fontWeight: "900",
            letterSpacing: "1px",
          }}
        >
          BOAR PACK TRACK
        </p>

        <h1
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "clamp(34px, 5vw, 52px)",
          }}
        >
          Add New Player
        </h1>

        <p style={{ margin: "10px 0 0", color: "#cbd5e1" }}>
          Create a complete player profile without opening Supabase.
        </p>
      </section>

      <form onSubmit={handleSubmit}>
        <section style={panelStyle}>
          <h2 style={{ margin: "0 0 18px", color: "#f5b51b" }}>
            👤 Player Information
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "16px",
            }}
          >
            
<div>
  <label style={labelStyle} htmlFor="club_id">
    Club *
  </label>

  <select
    id="club_id"
    name="club_id"
    value={form.club_id}
    onChange={updateField}
    style={inputStyle}
  >
    <option value="">Select club</option>

    {clubs.map((club) => (
      <option key={club.id} value={club.id}>
        {club.Name}
      </option>
    ))}
  </select>
</div>
<div>
  <label style={labelStyle} htmlFor="team_id">
    Team *
  </label>

  <select
    id="team_id"
    name="team_id"
    value={form.team_id}
    onChange={updateField}
    style={inputStyle}
  >
    <option value="">Select team</option>

    {teams.map((team) => (
      <option key={team.id} value={team.id}>
        {team.team_name}
      </option>
    ))}
  </select>
</div>
            <div>
              <label style={labelStyle} htmlFor="Name">
                Player Name *
              </label>

              <input
                id="Name"
                name="Name"
                value={form.Name}
                onChange={updateField}
                placeholder="Full name"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle} htmlFor="Join_Date">
                Join Date
              </label>

              <input
                id="Join_Date"
                name="Join_Date"
                type="date"
                value={form.Join_Date}
                onChange={updateField}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle} htmlFor="Caps">
                Current Caps
              </label>

              <input
                id="Caps"
                name="Caps"
                type="number"
                min="0"
                value={form.Caps}
                onChange={updateField}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle} htmlFor="Primary_Position">
                Primary Position *
              </label>

              <select
                id="Primary_Position"
                name="Primary_Position"
                value={form.Primary_Position}
                onChange={updateField}
                style={inputStyle}
              >
                <option value="">Select position</option>

                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle} htmlFor="Secondary_Position">
                Secondary Position
              </label>

              <select
                id="Secondary_Position"
                name="Secondary_Position"
                value={form.Secondary_Position}
                onChange={updateField}
                style={inputStyle}
              >
                <option value="">No secondary position</option>

                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "20px",
              color: "#ffffff",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            <input
              name="captain"
              type="checkbox"
              checked={form.captain}
              onChange={updateField}
              style={{ width: "20px", height: "20px" }}
            />

            👑 This player is a captain
          </label>
        </section>

        <section style={panelStyle}>
          <h2 style={{ margin: "0 0 18px", color: "#f5b51b" }}>
            📝 Development Information
          </h2>

          <div style={{ display: "grid", gap: "16px" }}>
            <div>
              <label style={labelStyle} htmlFor="Strengths">
                Strengths
              </label>

              <textarea
                id="Strengths"
                name="Strengths"
                value={form.Strengths}
                onChange={updateField}
                placeholder="Passing, leadership, tackling, game awareness..."
                rows="4"
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <div>
              <label style={labelStyle} htmlFor="Development_Areas">
                Development Areas
              </label>

              <textarea
                id="Development_Areas"
                name="Development_Areas"
                value={form.Development_Areas}
                onChange={updateField}
                placeholder="Fitness, positioning, communication..."
                rows="4"
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <div>
              <label style={labelStyle} htmlFor="Coach_Notes">
                Coach Notes
              </label>

              <textarea
                id="Coach_Notes"
                name="Coach_Notes"
                value={form.Coach_Notes}
                onChange={updateField}
                placeholder="Awards, memories, leadership history and other notes..."
                rows="4"
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
          </div>
        </section>

        <section style={panelStyle}>
          <h2 style={{ margin: "0 0 6px", color: "#f5b51b" }}>
            📊 Initial Player Ratings
          </h2>

          <p style={{ margin: "0 0 18px", color: "#cbd5e1" }}>
            Enter ratings from 0 to 100. These can be updated later.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "14px",
            }}
          >
            {ratingFields.map(([field, label]) => (
              <div key={field}>
                <label style={labelStyle} htmlFor={field}>
                  {label}
                </label>

                <input
                  id={field}
                  name={field}
                  type="number"
                  min="0"
                  max="100"
                  value={form[field]}
                  onChange={updateField}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
        </section>

        {errorMessage && (
          <div
            style={{
              marginTop: "18px",
              padding: "15px",
              borderRadius: "12px",
              background: "rgba(220,38,38,0.16)",
              border: "1px solid rgba(239,68,68,0.55)",
              color: "#fecaca",
              fontWeight: "800",
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}

        <section
          style={{
            ...panelStyle,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "flex-end",
            gap: "12px",
            marginBottom: "100px",
          }}
        >
          <a
            href="/admin"
            style={{
              padding: "13px 20px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#ffffff",
              fontWeight: "900",
              textDecoration: "none",
            }}
          >
            Cancel
          </a>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "13px 22px",
              border: 0,
              borderRadius: "10px",
              background: saving ? "#64748b" : "#f5b51b",
              color: saving ? "#e2e8f0" : "#163d75",
              fontWeight: "900",
              fontSize: "15px",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving Player..." : "➕ Add Player"}
          </button>
        </section>
      </form>

      <FooterNav />
    </main>
  );
}