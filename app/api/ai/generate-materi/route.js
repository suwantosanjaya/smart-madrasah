import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { judulMateri, rppJudul, rppTujuan, rppInti } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API Key Gemini belum disetting di server." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = process.env.GEMINI_MODEL_NAME || "gemini-flash-latest";
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `Anda adalah seorang penulis buku teks dan materi ajar profesional untuk tingkat sekolah (Kurikulum Merdeka).
Tugas Anda adalah menulis Modul Bahan Ajar (Konten Bacaan) yang lengkap, menarik, dan mudah dipahami oleh siswa.
Materi ajar ini harus merujuk 100% pada konteks Rencana Pelaksanaan Pembelajaran (RPP) berikut:

- Judul Materi yang Akan Dibuat: ${judulMateri}
- RPP Referensi: ${rppJudul}
- Tujuan Pembelajaran RPP: ${rppTujuan}
- Kegiatan Inti RPP: ${rppInti}

Syarat Penulisan:
1. Gunakan gaya bahasa yang interaktif, seolah-olah Anda sedang menyapa dan berdialog dengan siswa (misal: "Halo anak-anak hebat!"). Jangan gunakan Emoji yang terlalu banyak, cukup beberapa yang relevan.
2. VISUALISASI OTOMATIS: Setiap kali Anda menjelaskan tentang suatu bentuk, benda, atau konsep visual (misal: bangun datar, gaya gesek, dll), Anda WAJIB menyertakan blok gambar placeholder menggunakan tag HTML <img>. Gunakan layanan placehold.co dengan warna cerah. Contoh format wajib: <img src="https://placehold.co/400x200/f8fafc/0f172a?text=Ilustrasi+[Nama+Benda]" alt="Ilustrasi" />.
3. Jelaskan konsep materi secara terstruktur. Gunakan analogi atau contoh kehidupan sehari-hari jika perlu.
4. Berikan penekanan (Bold) pada kata-kata kunci penting.
5. Akhiri modul dengan 3 soal pertanyaan pemahaman singkat (Latihan Mandiri).
6. Berikan output murni dalam format HTML yang valid (gunakan <h1>, <h2>, <p>, <ul>, <li>, <strong>, <img>, dll.) yang siap untuk dimasukkan ke dalam Rich Text Editor. Jangan bungkus output dengan markdown blok seperti \`\`\`html.

Mulai penulisan modul:`;

    const result = await model.generateContent(prompt);
    let aiResponseText = result.response.text();

    // Clean up markdown wrapping if present
    aiResponseText = aiResponseText.replace(/```html/g, "").replace(/```/g, "").trim();

    return NextResponse.json({
      konten: aiResponseText
    });

  } catch (error) {
    console.error("Gemini Error:", error);
    
    let errorMessage = "Terjadi kesalahan pada server AI Google Gemini. Silakan coba beberapa saat lagi.";
    if (error.message.includes("429") || error.message.includes("quota")) {
      errorMessage = "Kuota API Gemini Anda telah habis untuk saat ini. Silakan tunggu beberapa menit dan coba lagi.";
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
