"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AccountControls() {
  const router = useRouter();

  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAccount() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (userError || !user) {
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);

      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      setRole(profileData?.role || null);
      setLoading(false);
    }

    loadAccount();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
      alert("There was a problem logging out. Please try again.");
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {role === "super_admin" && (
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          style={{
            border: "1px solid #f5b800",
            background: "#163d75",
            color: "#ffffff",
            borderRadius: "10px",
            padding: "10px 14px",
            fontWeight: "800",
            cursor: "pointer",
          }}
        >
          ← Super Admin
        </button>
      )}

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        style={{
          border: "1px solid #f5b800",
          background: "#f5b800",
          color: "#07152e",
          borderRadius: "10px",
          padding: "10px 14px",
          fontWeight: "800",
          cursor: loggingOut ? "wait" : "pointer",
        }}
      >
        {loggingOut ? "Signing Out..." : "Sign Out"}
      </button>
    </div>
  );
}