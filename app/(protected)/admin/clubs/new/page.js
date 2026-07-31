"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AddClubPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    short_name: "",
    sport: "Rugby Union",
    primary_colour: "#0b2857",
    secondary_colour: "#f5b800",
    email: "",
    phone: "",
    website: "",
    address: "",
    club_type: "live",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    if (!form.name.trim()) {
      setErrorMessage("Please enter the club name.");
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("clubs")
      .insert({
        Name: form.name.trim(),
        short_name: form.short_name.trim() || null,
        sport: form.sport,
        primary_colour: form.primary_colour,
        secondary_colour: form.secondary_colour,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        website: form.website.trim() || null,
        address: form.address.trim() || null,
        demo_club: form.club_type === "demo",
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Create club error:", error);
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setMessage(`${data.name} has been created successfully.`);
    setSaving(false);

    setTimeout(() => {
      router.push("/admin/clubs");
      router.refresh();
    }, 1000);
  }

  return (
    <main style={styles.page}>
      <section style={styles.container}>
        <button
          type="button"
          style={styles.backButton}
          onClick={() => router.push("/dashboard")}
        >
          ← Back to Command Centre
        </button>

        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>SUPER ADMIN</p>
            <h1 style={styles.title}>Add a New Club</h1>
            <p style={styles.subtitle}>
              Create either a live club or a branded demonstration club.
            </p>
          </div>
        </header>

        <form style={styles.form} onSubmit={handleSubmit}>
          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>Club setup</h2>

            <div style={styles.typeGrid}>
              <button
                type="button"
                style={{
                  ...styles.typeCard,
                  ...(form.club_type === "live"
                    ? styles.selectedTypeCard
                    : {}),
                }}
                onClick={() => updateField("club_type", "live")}
              >
                <span style={styles.typeIcon}>🟢</span>
                <strong style={styles.typeTitle}>Live Club</strong>
                <span style={styles.typeText}>
                  A real club ready for admins, coaches, squads and players.
                </span>
              </button>

              <button
                type="button"
                style={{
                  ...styles.typeCard,
                  ...(form.club_type === "demo"
                    ? styles.selectedTypeCard
                    : {}),
                }}
                onClick={() => updateField("club_type", "demo")}
              >
                <span style={styles.typeIcon}>🔵</span>
                <strong style={styles.typeTitle}>Demo Club</strong>
                <span style={styles.typeText}>
                  A branded example for presentations and sales meetings.
                </span>
              </button>
            </div>
          </section>

          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>Club details</h2>

            <div style={styles.grid}>
              <Field
                label="Club name"
                required
                value={form.name}
                onChange={(value) => updateField("name", value)}
                placeholder="Wharfedale RUFC"
              />

              <Field
                label="Short name"
                value={form.short_name}
                onChange={(value) => updateField("short_name", value)}
                placeholder="Wharfedale"
              />

              <SelectField
                label="Sport"
                value={form.sport}
                onChange={(value) => updateField("sport", value)}
                options={[
                  "Rugby Union",
                  "Rugby League",
                  "Football",
                  "Other",
                ]}
              />

              <Field
                label="Club email"
                type="email"
                value={form.email}
                onChange={(value) => updateField("email", value)}
                placeholder="club@example.com"
              />

              <Field
                label="Phone"
                value={form.phone}
                onChange={(value) => updateField("phone", value)}
                placeholder="01234 567890"
              />

              <Field
                label="Website"
                value={form.website}
                onChange={(value) => updateField("website", value)}
                placeholder="https://..."
              />
            </div>

            <label style={styles.label}>
              Club address
              <textarea
                rows={4}
                style={styles.textarea}
                value={form.address}
                onChange={(event) =>
                  updateField("address", event.target.value)
                }
                placeholder="Club ground address"
              />
            </label>
          </section>

          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>Club branding</h2>

            <div style={styles.colourGrid}>
              <label style={styles.label}>
                Primary colour
                <div style={styles.colourRow}>
                  <input
                    type="color"
                    value={form.primary_colour}
                    onChange={(event) =>
                      updateField("primary_colour", event.target.value)
                    }
                    style={styles.colourPicker}
                  />
                  <span style={styles.colourValue}>
                    {form.primary_colour}
                  </span>
                </div>
              </label>

              <label style={styles.label}>
                Secondary colour
                <div style={styles.colourRow}>
                  <input
                    type="color"
                    value={form.secondary_colour}
                    onChange={(event) =>
                      updateField("secondary_colour", event.target.value)
                    }
                    style={styles.colourPicker}
                  />
                  <span style={styles.colourValue}>
                    {form.secondary_colour}
                  </span>
                </div>
              </label>
            </div>

            <div
              style={{
                ...styles.preview,
                background: `linear-gradient(135deg, ${form.primary_colour}, #071326)`,
                borderColor: form.secondary_colour,
              }}
            >
              <span
                style={{
                  ...styles.previewBadge,
                  color: form.secondary_colour,
                  borderColor: form.secondary_colour,
                }}
              >
                CLUB PREVIEW
              </span>

              <h3 style={styles.previewTitle}>
                {form.name || "Your Club Name"}
              </h3>

              <p style={styles.previewText}>
                {form.club_type === "demo"
                  ? "Demonstration Club"
                  : "Live Club"}
              </p>
            </div>
          </section>

          {errorMessage && (
            <div style={styles.errorBox}>{errorMessage}</div>
          )}

          {message && <div style={styles.successBox}>{message}</div>}

          <div style={styles.actions}>
            <button
              type="button"
              style={styles.cancelButton}
              onClick={() => router.push("/dashboard")}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={styles.submitButton}
              disabled={saving}
            >
              {saving ? "Creating club..." : "Create Club"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <label style={styles.label}>
      {label}
      {required ? " *" : ""}
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        style={styles.input}
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label style={styles.label}>
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={styles.input}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "34px 22px 120px",
    background:
      "linear-gradient(145deg, #071326 0%, #0b2857 52%, #071326 100%)",
    color: "#ffffff",
  },

  container: {
    width: "100%",
    maxWidth: "1050px",
    margin: "0 auto",
  },

  backButton: {
    marginBottom: "22px",
    padding: 0,
    border: "none",
    background: "transparent",
    color: "#f5b800",
    fontWeight: "900",
    cursor: "pointer",
  },

  header: {
    marginBottom: "24px",
  },

  eyebrow: {
    margin: "0 0 8px",
    color: "#f5b800",
    fontSize: "13px",
    fontWeight: "900",
    letterSpacing: "2px",
  },

  title: {
    margin: 0,
    fontSize: "clamp(34px, 6vw, 58px)",
    lineHeight: 1,
  },

  subtitle: {
    marginTop: "14px",
    color: "#cbd8ec",
    fontSize: "17px",
  },

  form: {
    display: "grid",
    gap: "20px",
  },

  panel: {
    padding: "24px",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.07)",
    boxShadow: "0 16px 34px rgba(0,0,0,0.22)",
  },

  panelTitle: {
    margin: "0 0 20px",
    color: "#f5b800",
    fontSize: "22px",
  },

  typeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "14px",
  },

  typeCard: {
    minHeight: "150px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "8px",
    border: "2px solid rgba(255,255,255,0.12)",
    borderRadius: "18px",
    background: "rgba(4,18,43,0.7)",
    color: "#ffffff",
    textAlign: "left",
    cursor: "pointer",
  },

  selectedTypeCard: {
    borderColor: "#f5b800",
    boxShadow: "0 0 0 3px rgba(245,184,0,0.12)",
  },

  typeIcon: {
    fontSize: "26px",
  },

  typeTitle: {
    color: "#f5b800",
    fontSize: "19px",
  },

  typeText: {
    color: "#d4dfef",
    lineHeight: 1.45,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
  },

  label: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    color: "#e8eef8",
    fontWeight: "800",
    fontSize: "14px",
  },

  input: {
    width: "100%",
    padding: "13px 14px",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "12px",
    background: "rgba(4,18,43,0.8)",
    color: "#ffffff",
    fontSize: "16px",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    padding: "13px 14px",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "12px",
    background: "rgba(4,18,43,0.8)",
    color: "#ffffff",
    fontSize: "16px",
    resize: "vertical",
    boxSizing: "border-box",
  },

  colourGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "16px",
    marginBottom: "22px",
  },

  colourRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  colourPicker: {
    width: "64px",
    height: "44px",
    border: "none",
    borderRadius: "8px",
    background: "transparent",
    cursor: "pointer",
  },

  colourValue: {
    fontFamily: "monospace",
    color: "#dce7f6",
  },

  preview: {
    minHeight: "170px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    border: "3px solid",
    borderRadius: "20px",
  },

  previewBadge: {
    width: "fit-content",
    marginBottom: "12px",
    padding: "7px 10px",
    border: "1px solid",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "1.4px",
  },

  previewTitle: {
    margin: 0,
    fontSize: "30px",
  },

  previewText: {
    margin: "6px 0 0",
    color: "#e0e8f4",
    fontWeight: "700",
  },

  errorBox: {
    padding: "16px",
    borderRadius: "14px",
    background: "rgba(185,28,28,0.28)",
    border: "1px solid rgba(248,113,113,0.5)",
    color: "#fecaca",
    fontWeight: "800",
  },

  successBox: {
    padding: "16px",
    borderRadius: "14px",
    background: "rgba(22,101,52,0.28)",
    border: "1px solid rgba(74,222,128,0.5)",
    color: "#bbf7d0",
    fontWeight: "800",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    flexWrap: "wrap",
  },

  cancelButton: {
    padding: "13px 20px",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.06)",
    color: "#ffffff",
    fontWeight: "900",
    cursor: "pointer",
  },

  submitButton: {
    padding: "13px 22px",
    border: "none",
    borderRadius: "12px",
    background: "#f5b800",
    color: "#071326",
    fontWeight: "900",
    cursor: "pointer",
  },
};