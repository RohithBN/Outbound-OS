import { removeAuthCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await removeAuthCookie();

    return NextResponse.json(
      { message: "Logged out successfully", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json(
      {
        message: "Failed to logout",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
