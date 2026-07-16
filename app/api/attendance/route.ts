import { NextResponse } from "next/server";
import { getConfig, getWhitelist, appendAttendance } from "@/lib/google-sheets";
import { calculateDistance } from "@/lib/geofencing";
import { getAttendanceEnvConfig } from "@/lib/env";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, password, latitude, longitude, browser, device } = body;

    if (!name || !password || !latitude || !longitude) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const config = await getConfig();
    const envConfig = getAttendanceEnvConfig();

    if (config.isOpen !== "true") {
      return NextResponse.json({ error: "Attendance is currently closed." }, { status: 403 });
    }

    if (!envConfig.sharedPassword) {
      return NextResponse.json({ error: "Shared password is not configured." }, { status: 500 });
    }

    if (password !== envConfig.sharedPassword) {
      return NextResponse.json({ error: "Invalid shared password." }, { status: 401 });
    }

    const whitelist = await getWhitelist();
    const inputName = name.trim().toLowerCase();
    const inputWords = inputName.split(/\s+/).filter(Boolean);

    const isWhitelisted = whitelist.some((whitelistName: string) => {
      const whitelistWords = whitelistName.split(/\s+/);
      return inputWords.every((word: string) => whitelistWords.includes(word));
    });

    if (!isWhitelisted) {
      return NextResponse.json({ error: "Member not found in whitelist." }, { status: 403 });
    }

    const churchLat = parseFloat(envConfig.churchLat || config.churchLat);
    const churchLng = parseFloat(envConfig.churchLng || config.churchLng);
    const allowedRadius = parseFloat(envConfig.allowedRadius || config.allowedRadius);

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
