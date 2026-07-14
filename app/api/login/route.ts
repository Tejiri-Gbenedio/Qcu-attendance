import { NextResponse } from "next/server";
import { isValidAdminPassword, setAdminSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    if (isValidAdminPassword(password)) {
      const sessionSet = await setAdminSession();

      if (!sessionSet) {
        return NextResponse.json({ error: "Admin password is not configured" }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
