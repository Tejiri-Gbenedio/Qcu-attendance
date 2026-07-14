import { NextResponse } from "next/server";
import { getConfig, updateConfig } from "@/lib/google-sheets";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const config = await getConfig();
    return NextResponse.json({ isOpen: config.isOpen === "true" });
  } catch (error) {
    console.error("Failed to fetch attendance status:", error);
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { isOpen } = await req.json();
    const config = await getConfig();
    config.isOpen = isOpen ? "true" : "false";
    await updateConfig(config);
    return NextResponse.json({ success: true, isOpen: config.isOpen === "true" });
  } catch (error) {
    console.error("Failed to update attendance status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
