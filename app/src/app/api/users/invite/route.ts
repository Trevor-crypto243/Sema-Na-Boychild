import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createServiceClient();
  const body = await request.json();

  // Create auth user via admin API
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: body.email,
    email_confirm: true,
    password: Math.random().toString(36).slice(-12), // Temp password
    user_metadata: { full_name: body.full_name },
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  // Create user profile
  const { error: profileError } = await supabase.from("users").insert({
    id: authData.user.id,
    email: body.email,
    full_name: body.full_name,
    role: body.role || "mentor",
    is_active: true,
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // TODO: Send invite email via Resend with password reset link

  return NextResponse.json({ success: true, userId: authData.user.id }, { status: 201 });
}
