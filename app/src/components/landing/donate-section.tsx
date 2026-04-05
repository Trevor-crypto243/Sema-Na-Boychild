"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

const presetAmounts = [500, 1000, 2500, 5000];

export function DonateSection() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [donating, setDonating] = useState(false);
  const [showMpesa, setShowMpesa] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const amount = selectedAmount || parseInt(customAmount) || 0;

  async function handleMpesaDonate() {
    if (!phone || !amount) return;
    setDonating(true);
    setResult(null);

    try {
      const res = await fetch("/api/payments/mpesa/stk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.startsWith("0") ? `254${phone.slice(1)}` : phone,
          amount,
        }),
      });
      const data = await res.json();

      if (data.ResponseCode === "0" || data.CheckoutRequestID) {
        setResult({ success: true, message: "Check your phone for the M-Pesa prompt. Enter your PIN to complete the donation." });
      } else {
        setResult({ success: false, message: data.errorMessage || data.ResponseDescription || "M-Pesa request failed. Please try again." });
      }
    } catch {
      setResult({ success: false, message: "Network error. Please try again." });
    }

    setDonating(false);
  }

  return (
    <section id="donate" className="bg-[#1B4332] py-20 text-white">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h2 className="text-3xl font-bold">Support the Boy-Child</h2>
        <p className="mx-auto mt-4 max-w-xl text-white/80">
          Your donation directly funds school visits, seminars, mentorship materials, and programs
          that transform young lives. Every shilling counts.
        </p>

        {/* Amount Selection */}
        <div className="mx-auto mt-8 flex max-w-lg flex-wrap justify-center gap-3">
          {presetAmounts.map((amt) => (
            <button
              key={amt}
              onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
              className={`rounded-lg border px-6 py-3 font-medium transition-colors ${
                selectedAmount === amt
                  ? "bg-white text-[#1B4332] border-white"
                  : "border-white/30 hover:bg-white/10"
              }`}
            >
              KES {amt.toLocaleString()}
            </button>
          ))}
          <div className="relative">
            <Input
              type="number"
              placeholder="Custom"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
              className="w-28 rounded-lg border border-white/30 bg-transparent px-4 py-3 text-white placeholder:text-white/50 text-center"
            />
          </div>
        </div>

        {amount > 0 && (
          <p className="mt-4 text-lg font-semibold text-[#D4A373]">
            Donating KES {amount.toLocaleString()}
          </p>
        )}

        {/* Payment Buttons */}
        {!showMpesa ? (
          <div className="mx-auto mt-6 flex max-w-sm flex-col gap-3">
            <button
              onClick={() => setShowMpesa(true)}
              disabled={!amount}
              className="rounded-lg bg-[#4CAF50] px-6 py-3 font-medium text-white hover:bg-[#4CAF50]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Donate via M-Pesa
            </button>
            <button
              disabled={!amount}
              className="rounded-lg bg-[#635BFF] px-6 py-3 font-medium text-white hover:bg-[#635BFF]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Donate via Card (International)
            </button>
          </div>
        ) : (
          <div className="mx-auto mt-6 max-w-sm space-y-4">
            <div className="rounded-lg bg-white/10 p-6">
              <p className="text-sm text-white/80 mb-3">Enter your M-Pesa phone number</p>
              <Input
                type="tel"
                placeholder="0712 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white text-gray-900 mb-3"
              />
              <button
                onClick={handleMpesaDonate}
                disabled={donating || !phone}
                className="w-full rounded-lg bg-[#4CAF50] px-6 py-3 font-medium text-white hover:bg-[#4CAF50]/90 disabled:opacity-50"
              >
                {donating ? "Sending request..." : `Pay KES ${amount.toLocaleString()} via M-Pesa`}
              </button>
              <button
                onClick={() => setShowMpesa(false)}
                className="mt-2 text-sm text-white/60 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className={`mx-auto mt-4 max-w-sm rounded-lg p-4 text-sm ${
            result.success ? "bg-green-500/20 text-green-200" : "bg-red-500/20 text-red-200"
          }`}>
            {result.message}
          </div>
        )}
      </div>
    </section>
  );
}
