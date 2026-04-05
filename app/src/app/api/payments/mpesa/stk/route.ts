import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { phone, amount } = body;

  if (!phone || !amount) {
    return NextResponse.json({ error: "Phone and amount required" }, { status: 400 });
  }

  const consumerKey = process.env.MPESA_CONSUMER_KEY!;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
  const passkey = process.env.MPESA_PASSKEY!;
  const shortcode = process.env.MPESA_SHORTCODE!;
  const callbackUrl = process.env.MPESA_CALLBACK_URL!;
  const isSandbox = process.env.MPESA_ENV === "sandbox";

  const baseUrl = isSandbox
    ? "https://sandbox.safaricom.co.ke"
    : "https://api.safaricom.co.ke";

  try {
    // Step 1: Get OAuth token
    const authString = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const tokenRes = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${authString}` },
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Step 2: Initiate STK Push
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    const stkRes = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount),
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: callbackUrl,
        AccountReference: "SemaNaBoychild",
        TransactionDesc: "Donation to Sema Na Boychild",
      }),
    });

    const stkData = await stkRes.json();
    return NextResponse.json(stkData);
  } catch {
    return NextResponse.json({ error: "M-Pesa request failed" }, { status: 500 });
  }
}
