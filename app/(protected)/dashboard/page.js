"use client"

import { supabase } from "../../lib/supabase"
import { useEffect, useState } from "react"
export default function DashboardPage() {
  const [role, setRole] = useState("")
  useEffect(() => {
  async function loadRole() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

   const { data } = await supabase
  .from("user_assignments")
  .select("role")
  .eq("user_id", user.id)
  .single()

    if (data) {
      setRole(data.role)
    }
  }

  loadRole()
}, [])
  return (
    <div style={{ padding: 40 }}>
      <h1>BoarPack Track Dashboard</h1>
      <p>Your role: {role || "Loading..."}</p>
      <p>You are successfully logged in.</p>
    </div>
  )
}