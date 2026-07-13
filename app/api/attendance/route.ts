import { NextResponse } from "next/server";
import { getConfig, getWhitelist, appendAttendance } from "@/lib/google-sheets";
import { calculateDistance } from "@/lib/geofencing";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, password, latitude, longitude, browser, device } = body;

    if (!name || !password || !latitude || !longitude) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const config = await getConfig();

    if (config.isOpen !== "true") {
      return NextResponse.json({ error: "Attendance is currently closed." }, { status: 403 });
    }

    if (password !== config.sharedPassword) {
      return NextResponse.json({ error: "Invalid shared password." }, { status: 401 });
    }

    const whitelist = await getWhitelist();
    if (!whitelist.includes(name.trim().toLowerCase())) {
      return NextResponse.json({ error: "Member not found in whitelist." }, { status: 403 });
    }

    const churchLat = parseFloat(config.churchLat);
    const churchLng = parseFloat(config.churchLng);
    const allowedRadius = parseFloat(config.allowedRadius);

    const distance = calculateDistance(latitude, longitude, churchLat, churchLng);
    const isInside = distance <= allowedRadius;

    const now = new Date();
    const record = {
      date: now.toLocaleDateString(),
      service: "Main Service",
      memberName: name,
      time: now.toLocaleTimeString(),
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      distance: distance.toFixed(2),
      status: isInside ? "Approved" : "Rejected",
      reason: isInside ? "Inside geofence" : "Outside geofence",
      browser: browser || "Unknown",
      device: device || "Unknown"
    };

    await appendAttendance(record);

    if (!isInside) {
      return NextResponse.json({ error: "Attendance rejected: You are outside the church geofence." }, { status: 403 });
    }

    return NextResponse.json({ success: true, message: "Attendance signed successfully!" });
  } catch (error) {
    console.error("Attendance Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}