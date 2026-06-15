import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// akses https://aistudio.google.com/ untuk mendapatkan gemini api key

export async function POST(req) {
  try {
    const { judul, mapel, tingkat, semester, targetKognitif } = await req.json();

    // Pastikan API key tersedia di .env
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API Key Gemini belum disetting di server (.env)." },
        { status: 500 }
      );
    }

    // Inisialisasi SDK Gemini dengan API Key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Instruksi Prompt untuk AI
    const prompt = `Anda adalah ahli kurikulum pendidikan di Indonesia (Kurikulum Merdeka). 
Buatlah kerangka Rencana Pelaksanaan Pembelajaran (RPP) / Modul Ajar singkat untuk:
- Mata Pelajaran: ${mapel}
- Materi Pokok / Judul: ${judul}
- Kelas / Fase: ${tingkat} (Semester ${semester})
- Target Kognitif Taksonomi Bloom: ${targetKognitif}

Berikan output murni dalam format JSON yang tepat dan bisa di-parse (tanpa tag markdown \`\`\`json). Struktur JSON yang diminta:
{
  "tujuan": "Tujuan Pembelajaran secara spesifik...",
  "pendahuluan": "Langkah-langkah kegiatan pendahuluan (dalam bentuk numbered list dengan \\n)...",
  "inti": "Langkah-langkah kegiatan inti (dalam bentuk numbered list dengan \\n)...",
  "penutup": "Langkah-langkah kegiatan penutup (dalam bentuk numbered list dengan \\n)...",
  "penilaian": "Teknik dan instrumen penilaian (dalam bentuk numbered list dengan \\n)...",
  "alokasiWaktu": "Contoh: 2 x 40 Menit"
}`;

    // Jalankan request ke AI
    const result = await model.generateContent(prompt);
    let aiResponseText = result.response.text();

    // Hapus backticks markdown jika AI masih menyertakannya (sanitasi)
    aiResponseText = aiResponseText.replace(/```json/g, "").replace(/```/g, "").trim();

    // Parsing hasil jawaban JSON AI ke dalam objek JavaScript
    const rppData = JSON.parse(aiResponseText);

    return NextResponse.json({
      tujuan: rppData.tujuan || "",
      pendahuluan: rppData.pendahuluan || "",
      inti: rppData.inti || "",
      penutup: rppData.penutup || "",
      penilaian: rppData.penilaian || "",
      alokasiWaktu: rppData.alokasiWaktu || "2 x 40 Menit",
    });

  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json(
      { error: "Gagal men-generate RPP dari AI: " + error.message },
      { status: 500 }
    );
  }
}
