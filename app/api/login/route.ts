import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getConfig } from "@/lib/google-sheets";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const config = await getConfig();

    if (password === config.adminPassword) {
      // Set a simple session cookie
      const cookieStore = await cookies();
      cookieStore.set("admin_session", process.env.AUTH_SECRET || "qcu-secret", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
