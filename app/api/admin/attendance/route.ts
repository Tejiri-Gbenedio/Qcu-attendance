import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAttendanceRecords } from "@/lib/google-sheets";

const isAuthenticated = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === (process.env.AUTH_SECRET || "qcu-secret");
};

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const records = await getAttendanceRecords();
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance records" }, { status: 500 });
  }
}
