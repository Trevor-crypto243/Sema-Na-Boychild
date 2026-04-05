import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("donations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("donations")
    .insert(body)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update campaign raised amount if linked
  if (body.campaign_id && body.status === "completed") {
    const { data: campaign } = await supabase
      .from("donation_campaigns")
      .select("raised_amount")
      .eq("id", body.campaign_id)
      .single();
    if (campaign) {
      await supabase
        .from("donation_campaigns")
        .update({ raised_amount: Number(campaign.raised_amount) + Number(body.amount) })
        .eq("id", body.campaign_id);
    }
  }

  return NextResponse.json(data, { status: 201 });
}
