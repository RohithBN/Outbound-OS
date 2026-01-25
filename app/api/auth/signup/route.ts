import dbConnect from "@/lib/dbConnect";
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth";
import { User } from "@/models";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Email, password, and name are required", success: false },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters", success: false },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists", success: false },
        { status: 409 }
      );
    }

    // Hash password and create user
    const password_hash = await hashPassword(password);
    const user = await User.create({
      email: email.toLowerCase(),
      password_hash,
      name,
    });

    // Create JWT token and set cookie
    const token = await createToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    await setAuthCookie(token);

    return NextResponse.json(
      {
        message: "User created successfully",
        success: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during signup:", error);
    return NextResponse.json(
      {
        message: "Failed to create user",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
