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

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    if (!user.password) {
      return NextResponse.json(
        {
          error:
            "This account uses Google sign-in. Please continue with Google.",
        },
        { status: 401 },
      );
    }

    const matches = await bcrypt.compare(password, user.password);

    if (!matches) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

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
        error: error instanceof Error ? error.message : "Unable to login.",
      },
      { status: 400 },
    );
  }
}
