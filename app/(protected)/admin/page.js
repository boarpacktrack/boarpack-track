"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase";
import { Header, FooterNav } from "@/app/components";

const adminSections = [
  {
    title: "Players",
    icon: "👥",
    description: "Add, edit and manage player profiles.",
    href: "/players",
    actions: ["View Players", "Add Player", "Edit Player"],
  },
  {
    title: "Achievements",
    icon: "🏆",
    description: "Manage awards, milestones and standout moments.",
    href: "/players",
    actions: ["View Achievements", "Add Achievement", "Edit Achievement"],
  },
  {
    title: "Fixtures",
    icon: "📅",
    description: "Create fixtures and manage upcoming matches.",
    href: "/match-day",
    actions: ["View Fixtures", "Add Fixture", "Match Day"],
  },
  {
    title: "Teams",
    icon: "🏉",
    description: "Create teams and organise your squads.",
    href: "/team_selection",
    actions: ["View Teams", "Create Team", "Select Squad"],
  },
  {
    title: "Training",
    icon: "✅",
    description: "Manage training sessions and attendance.",
    href: "/training",
    actions: ["Training Register", "Attendance", "Session History"],
  },
  {
    title: "Reports",
    icon: "📊",
    description: "View player progress and team information.",
    href: "/players",
    actions: ["Player Reports", "Attendance Reports", "Season Summary"],
  },
];
const allowedRoles = [
  "super_admin",
  "club_admin",
  "chairman",
  "safeguarding_officer",
]
export default function AdminDashboard() {
  const router = useRouter()

useEffect(() => {
  async function checkAccess() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    const { data: assignment } = await supabase
      .from("user_assignments")
      .select("role")
      .eq("user_id", user.id)
      .single()

    if (!assignment || !allowedRoles.includes(assignment.role)) {
      router.push("/dashboard")
    }
  }

  checkAccess()
}, [router])
  return (
    <main className="app">
      <Header active="Admin" />

      <section
        style={{
          marginTop: "18px",
          padding: "28px",
          borderRadius: "20px",
          background:
            "linear-gradient(135deg, rgba(17,24,39,0.98), rgba(22,61,117,0.95))",
          border: "1px solid rgba(245,181,27,0.35)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            color: "#f5b51b",
            fontWeight: "900",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          Boar Pack Track
        </p>

        <h1
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "clamp(32px, 5vw, 52px)",
          }}
        >
          Admin Dashboard
        </h1>

        <p
          style={{
            margin: "12px 0 0",
            color: "#cbd5e1",
            maxWidth: "720px",
            lineHeight: "1.6",
          }}
        >
          Manage players, achievements, fixtures, teams and training from one
          simple screen.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "18px",
          marginTop: "22px",
          marginBottom: "95px",
        }}
      >
        {adminSections.map((section) => (
          <a
            key={section.title}
            href={section.href}
            style={{
              display: "block",
              padding: "22px",
              borderRadius: "18px",
              background:
                "linear-gradient(135deg, rgba(31,41,55,0.98), rgba(17,24,39,0.98))",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 12px 28px rgba(0,0,0,0.25)",
              textDecoration: "none",
              color: "#ffffff",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "54px",
                  height: "54px",
                  borderRadius: "14px",
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(245,181,27,0.12)",
                  border: "1px solid rgba(245,181,27,0.3)",
                  fontSize: "28px",
                }}
              >
                {section.icon}
              </div>

              <span
                style={{
                  color: "#f5b51b",
                  fontSize: "24px",
                  fontWeight: "900",
                }}
              >
                →
              </span>
            </div>

            <h2
              style={{
                margin: "18px 0 8px",
                color: "#f5b51b",
                fontSize: "24px",
              }}
            >
              {section.title}
            </h2>

            <p
              style={{
                margin: "0 0 18px",
                color: "#cbd5e1",
                lineHeight: "1.5",
              }}
            >
              {section.description}
            </p>

            <div
              style={{
                paddingTop: "14px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {section.actions.map((action) => (
                <p
                  key={action}
                  style={{
                    margin: "7px 0",
                    color: "#e5e7eb",
                    fontSize: "14px",
                    fontWeight: "700",
                  }}
                >
                  ✓ {action}
                </p>
              ))}
            </div>
          </a>
        ))}
      </section>

      <FooterNav />
    </main>
  );
}