import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { resolveUserRole, setAuthCookie } from "@/lib/auth";
import { addBillingInterval } from "@/lib/billing";
import { connectToDatabase } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/services/email-service";
import { ensureUserForSupabaseUser } from "@/lib/services/user-service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveAppOrigin } from "@/lib/request-origin";
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

    if (isSupabaseConfigured()) {
      const appOrigin = resolveAppOrigin(request);
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${appOrigin}/api/auth/supabase/callback?next=/dashboard`,
        },
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      if (!data.user) {
        return NextResponse.json(
          { error: "Unable to create Supabase account." },
          { status: 400 },
        );
      }

      const { user, created } = await ensureUserForSupabaseUser(data.user);
      const role = resolveUserRole(user);

      if (created) {
        try {
          await sendWelcomeEmail(email);
        } catch {
          // Email should not block account creation.
        }
      }

      if (data.session) {
        await setAuthCookie({
          userId: user._id.toString(),
          email: user.email,
          role,
        });
      }

      return NextResponse.json(
        {
          user: {
            id: user._id.toString(),
            email: user.email,
            role,
          },
          redirectTo: data.session
            ? "/dashboard"
            : `/login?message=${encodeURIComponent("Check your email to confirm your account.")}`,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

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
    const now = new Date();
    const user = await User.create({
      email,
      password: hashedPassword,
      role: "client",
      subscriptionTier: "free",
      subscriptionInterval: "monthly",
      subscriptionStatus: "active",
      subscriptionAutoRenew: false,
      subscriptionCurrentPeriodStart: now,
      subscriptionCurrentPeriodEnd: addBillingInterval(now, "monthly"),
      cashfreeSubscriptionStatus: "FREE_ACTIVE",
    });

    try {
      await sendWelcomeEmail(email);
    } catch {
      // Email should not block account creation.
    }

    await setAuthCookie({
      userId: user._id.toString(),
      email: user.email,
      role: "client",
    });

    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          email: user.email,
          role: "client",
        },
        redirectTo: "/dashboard",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create account.",
      },
      { status: 400 },
    );
  }
}
