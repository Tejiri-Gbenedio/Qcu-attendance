import { NextResponse } from "next/server";
import { deleteRejectedAttendance } from "@/lib/google-sheets";
import { isAdminAuthenticated } from "@/lib/auth";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deleted = await deleteRejectedAttendance();
    return NextResponse.json({
      success: true,
      deleted,
      message: deleted === 0
        ? "No rejected records found."
        : Successfully deleted  rejected record.,
    });
  } catch (error) {
    console.error("Cleanup Error:", error);
    return NextResponse.json({ error: "Failed to clean up rejected attendance records" }, { status: 500 });
  }
}
