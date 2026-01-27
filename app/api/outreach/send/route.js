import { NextResponse } from "next/server";
import { sendEmailToProspect } from "@/lib/outreach/sendEmailToProspect";

export async function POST(req) {
  const { prospect } = await req.json();

  await sendEmailToProspect(prospect);

  return NextResponse.json({ success: true });
}
