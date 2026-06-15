import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// akses https://aistudio.google.com/ untuk mendapatkan gemini api key

export async function POST(req) {
  try {
    const { judul, mapel, tingkat, semester, targetKognitif } = await req.json();

    // Pastikan API key tersedia di .env
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API Key Gemini belum disetting di server." },
        { status: 500 }
      );
    }

    // Inisialisasi SDK Gemini dengan API Key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = process.env.GEMINI_MODEL_NAME || "gemini-flash-latest";
    const model = genAI.getGenerativeModel({ model: modelName });

    // Instruksi Prompt untuk AI
    const prompt = `Anda adalah ahli kurikulum pendidikan di Indonesia (Kurikulum Merdeka). 
Buatlah kerangka Rencana Pelaksanaan Pembelajaran (RPP) / Modul Ajar singkat untuk:
- Mata Pelajaran: ${mapel}
- Materi Pokok / Judul: ${judul}
- Kelas / Fase: ${tingkat} (Semester ${semester})
- Target Kognitif Taksonomi Bloom: ${targetKognitif}

Berikan output murni dalam format JSON yang tepat dan bisa di-parse (tanpa tag markdown \`\`\`json). Struktur JSON yang diminta (Gunakan format HTML murni seperti <ul>, <ol>, <li>, <strong>, dll. di dalam nilai setiap kunci untuk *styling* paragraf dan penomoran list):
{
  "tujuan": "Tujuan Pembelajaran secara spesifik (Gunakan HTML)...",
  "pendahuluan": "Langkah-langkah kegiatan pendahuluan (Gunakan tag <ol> dan <li> untuk penomoran)...",
  "inti": "Langkah-langkah kegiatan inti (Gunakan tag <ol> dan <li> untuk penomoran)...",
  "penutup": "Langkah-langkah kegiatan penutup (Gunakan tag <ol> dan <li> untuk penomoran)...",
  "penilaian": "Teknik dan instrumen penilaian (Gunakan tag <ul> atau <ol>)...",
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
    
    let errorMessage = "Gagal men-generate RPP dari AI: " + error.message;
    if (error.message.includes("503 Service Unavailable") || error.message.includes("high demand")) {
      errorMessage = "Server AI Google Gemini sedang sangat sibuk karena permintaan yang tinggi (Overload). Silakan tunggu beberapa detik dan coba klik tombol 'AI Generate' lagi.";
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
