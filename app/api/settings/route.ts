import { NextResponse } from "next/server";
import { getConfig, updateConfig } from "@/lib/google-sheets";
import { isAdminAuthenticated } from "@/lib/auth";
import { getLocationEnvConfig } from "@/lib/env";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const config = await getConfig();
    const envConfig = getLocationEnvConfig();

    return NextResponse.json({
      churchLat: envConfig.churchLat || config.churchLat || "",
      churchLng: envConfig.churchLng || config.churchLng || "",
      allowedRadius: envConfig.allowedRadius || config.allowedRadius || "",
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const newSettings = await req.json();
    const config = await getConfig();

    config.churchLat = newSettings.churchLat || config.churchLat;
    config.churchLng = newSettings.churchLng || config.churchLng;
    config.allowedRadius = newSettings.allowedRadius || config.allowedRadius;

    await updateConfig(config);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
