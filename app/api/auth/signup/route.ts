import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { setAuthCookie } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { validateEmail, validatePassword } from "@/lib/validators";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = validateEmail(body.email || "");
    const password = validatePassword(body.password || "");

    await connectToDatabase();

    const existingUser = (await User.findOne({ email }).lean()) as
      | { googleId?: string | null }
      | null;

    if (existingUser) {
      return NextResponse.json(
        {
          error: existingUser.googleId
            ? "An account with this email already exists. Please continue with Google."
            : "An account with this email already exists.",
        },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
      password: hashedPassword,
    });

    await setAuthCookie({
      userId: user._id.toString(),
      email: user.email,
    });

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create account.",
      },
      { status: 400 },
    );
  }
}
