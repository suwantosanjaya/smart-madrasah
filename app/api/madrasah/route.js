import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { madrasah } from "@/lib/db/schema";

// GET /api/madrasah
// Endpoint API untuk mengambil data profil madrasah (biasanya digunakan oleh aplikasi Mobile atau Frontend Eksternal)
export async function GET() {
  try {
    const data = await db.select().from(madrasah).limit(1);
    
    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, message: "Data madrasah tidak ditemukan", data: null },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Berhasil mengambil data madrasah", data: data[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Error [GET /api/madrasah]:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server", error: error.message },
      { status: 500 }
    );
  }
}
