import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getConfig, updateConfig } from "@/lib/google-sheets";

const isAuthenticated = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === (process.env.AUTH_SECRET || "qcu-secret");
};

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const config = await getConfig();
    // Don't send the admin password back to the client
    delete config.adminPassword;
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const newSettings = await req.json();
    const config = await getConfig();

    // Update config, but don't allow overwriting admin password with empty string
    config.churchLat = newSettings.churchLat || config.churchLat;
    config.churchLng = newSettings.churchLng || config.churchLng;
    config.allowedRadius = newSettings.allowedRadius || config.allowedRadius;
    config.sharedPassword = newSettings.sharedPassword || config.sharedPassword;
    
    if (newSettings.adminPassword && newSettings.adminPassword.trim() !== "") {
      config.adminPassword = newSettings.adminPassword;
    }

    await updateConfig(config);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
