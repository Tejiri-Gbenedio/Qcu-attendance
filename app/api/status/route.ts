import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getConfig, updateConfig } from "@/lib/google-sheets";

const isAuthenticated = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === (process.env.AUTH_SECRET || "qcu-secret");
};

export async function GET() {
  try {
    const config = await getConfig();
    return NextResponse.json({ isOpen: config.isOpen === "true" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { isOpen } = await req.json();
    const config = await getConfig();
    config.isOpen = isOpen ? "true" : "false";
    await updateConfig(config);
    return NextResponse.json({ success: true, isOpen: config.isOpen === "true" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
