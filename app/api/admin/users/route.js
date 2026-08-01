import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const allowedRoles = [
  "super_admin",
  "club_admin",
  "chairman",
  "coaching_coordinator",
  "safeguarding_officer",
  "head_coach",
  "assistant_coach",
  "parent",
];

const clubAdminRoles = ["club_admin", "chairman"];
const coachRoles = ["head_coach", "assistant_coach"];

function getAuthenticatedClient(accessToken) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function POST(request) {
  let createdAuthUserId = null;
  let profileCreated = false;
  let assignmentCreated = false;

  try {
    const authorizationHeader = request.headers.get("authorization");

    if (
      !authorizationHeader ||
      !authorizationHeader.startsWith("Bearer ")
    ) {
      return NextResponse.json(
        { error: "You must be logged in to create users." },
        { status: 401 }
      );
    }

    const accessToken = authorizationHeader
      .replace("Bearer ", "")
      .trim();

    const authenticatedClient =
      getAuthenticatedClient(accessToken);

    const {
      data: { user: currentUser },
      error: currentUserError,
    } = await authenticatedClient.auth.getUser();

    if (currentUserError || !currentUser) {
      return NextResponse.json(
        { error: "Your login session is invalid or has expired." },
        { status: 401 }
      );
    }

    const { data: currentProfile, error: currentProfileError } =
      await supabaseAdmin
        .from("user_profiles")
        .select("id, role, club_id, is_active")
        .eq("id", currentUser.id)
        .maybeSingle();

    if (currentProfileError || !currentProfile) {
      console.error(
        "Current profile lookup error:",
        currentProfileError
      );

      return NextResponse.json(
        { error: "Your user profile could not be verified." },
        { status: 403 }
      );
    }

    if (currentProfile.is_active === false) {
      return NextResponse.json(
        { error: "Your account is inactive." },
        { status: 403 }
      );
    }

    const isSuperAdmin =
      currentProfile.role === "super_admin";

    const isClubAdmin = clubAdminRoles.includes(
      currentProfile.role
    );

    if (!isSuperAdmin && !isClubAdmin) {
      return NextResponse.json(
        { error: "You do not have permission to create users." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const fullName = String(body.full_name || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const phone = String(body.phone || "").trim();
    const role = String(body.role || "").trim();

    const requestedClubId =
      body.club_id === null || body.club_id === ""
        ? null
        : Number(body.club_id);

    const requestedSquadId =
      body.squad_id === null || body.squad_id === ""
        ? null
        : Number(body.squad_id);

    if (!fullName) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: "The selected role is not valid." },
        { status: 400 }
      );
    }

    if (!isSuperAdmin && role === "super_admin") {
      return NextResponse.json(
        {
          error:
            "Only a Super Admin can create another Super Admin.",
        },
        { status: 403 }
      );
    }

    let clubId = requestedClubId;
    let squadId = requestedSquadId;

    if (isClubAdmin) {
      clubId = currentProfile.club_id;

      if (!clubId) {
        return NextResponse.json(
          {
            error:
              "Your account is not assigned to a club.",
          },
          { status: 403 }
        );
      }
    }

    if (role === "super_admin") {
      clubId = null;
      squadId = null;
    }

    if (role !== "super_admin" && !clubId) {
      return NextResponse.json(
        { error: "A club must be selected for this user." },
        { status: 400 }
      );
    }

    if (coachRoles.includes(role) && !squadId) {
      return NextResponse.json(
        { error: "Coaches must be assigned to a squad." },
        { status: 400 }
      );
    }

    if (!coachRoles.includes(role)) {
      squadId = null;
    }

    if (clubId) {
      const { data: club, error: clubError } =
        await supabaseAdmin
          .from("clubs")
          .select("id, Name, is_active")
          .eq("id", clubId)
          .maybeSingle();

      if (clubError || !club) {
        console.error("Club lookup error:", clubError);

        return NextResponse.json(
          { error: "The selected club could not be found." },
          { status: 400 }
        );
      }

      if (club.is_active === false) {
        return NextResponse.json(
          { error: "The selected club is not active." },
          { status: 400 }
        );
      }
    }

    if (squadId) {
      const { data: squad, error: squadError } =
        await supabaseAdmin
          .from("teams")
          .select("*")
          .eq("id", squadId)
          .maybeSingle();

      if (squadError || !squad) {
        console.error("Squad lookup error:", squadError);

        return NextResponse.json(
          { error: "The selected squad could not be found." },
          { status: 400 }
        );
      }

      if (
        squad.club_id !== undefined &&
        squad.club_id !== null &&
        Number(squad.club_id) !== Number(clubId)
      ) {
        return NextResponse.json(
          {
            error:
              "The selected squad does not belong to this club.",
          },
          { status: 400 }
        );
      }
    }

    const {
      data: existingUsersData,
      error: existingUsersError,
    } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (existingUsersError) {
      console.error(
        "Existing user lookup error:",
        existingUsersError
      );

      return NextResponse.json(
        {
          error:
            "Existing accounts could not be checked. Please try again.",
        },
        { status: 500 }
      );
    }

    const existingUser = (
      existingUsersData?.users || []
    ).find(
      (user) =>
        String(user.email || "").toLowerCase() === email
    );

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "A user with this email address already exists.",
        },
        { status: 409 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const { data: inviteData, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(
        email,
        {
          redirectTo: `${siteUrl}/auth/set-password`,
          data: {
            full_name: fullName,
            role,
            club_id: clubId,
          },
        }
      );

    if (inviteError || !inviteData?.user) {
      console.error("Supabase invite error:", inviteError);

      return NextResponse.json(
        {
          error:
            inviteError?.message ||
            "The user invitation could not be created.",
        },
        { status: 400 }
      );
    }

    createdAuthUserId = inviteData.user.id;

    const { error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .insert({
        id: createdAuthUserId,
        email,
        full_name: fullName,
        role,
        club_id: clubId,
        is_active: true,
        phone: phone || null,
        created_by: currentUser.id,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error(
        "User profile creation error:",
        profileError
      );

      throw new Error(
        `The login was created, but the profile could not be saved: ${profileError.message}`
      );
    }

    profileCreated = true;

    const { error: assignmentError } = await supabaseAdmin
      .from("user_assignments")
      .insert({
        user_id: createdAuthUserId,
        club_id: clubId,
        squad_id: squadId,
        role,
      });

    if (assignmentError) {
      console.error(
        "User assignment creation error:",
        assignmentError
      );

      throw new Error(
        `The profile was created, but the assignment could not be saved: ${assignmentError.message}`
      );
    }

    assignmentCreated = true;

    return NextResponse.json(
      {
        success: true,
        message:
          "User created and invitation email sent.",
        user: {
          id: createdAuthUserId,
          full_name: fullName,
          email,
          role,
          club_id: clubId,
          squad_id: squadId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user route error:", error);

    if (createdAuthUserId) {
      if (assignmentCreated) {
        await supabaseAdmin
          .from("user_assignments")
          .delete()
          .eq("user_id", createdAuthUserId);
      }

      if (profileCreated) {
        await supabaseAdmin
          .from("user_profiles")
          .delete()
          .eq("id", createdAuthUserId);
      }

      const { error: cleanupError } =
        await supabaseAdmin.auth.admin.deleteUser(
          createdAuthUserId
        );

      if (cleanupError) {
        console.error(
          "Failed to clean up Auth user:",
          cleanupError
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while creating the user.",
      },
      { status: 500 }
    );
  }
}