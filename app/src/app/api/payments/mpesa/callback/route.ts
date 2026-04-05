import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const supabase = await createServiceClient();

  const callback = body.Body?.stkCallback;
  if (!callback) {
    return NextResponse.json({ error: "Invalid callback" }, { status: 400 });
  }

  const resultCode = callback.ResultCode;
  if (resultCode === 0) {
    // Payment successful
    const items = callback.CallbackMetadata?.Item || [];
    const amount = items.find((i: { Name: string; Value: unknown }) => i.Name === "Amount")?.Value;
    const mpesaRef = items.find((i: { Name: string; Value: unknown }) => i.Name === "MpesaReceiptNumber")?.Value;
    const phone = items.find((i: { Name: string; Value: unknown }) => i.Name === "PhoneNumber")?.Value;

    await supabase.from("donations").insert({
      donor_phone: phone?.toString(),
      amount,
      currency: "KES",
      payment_method: "mpesa",
      transaction_ref: mpesaRef,
      status: "completed",
      purpose: "M-Pesa Donation",
      is_anonymous: false,
    });
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
