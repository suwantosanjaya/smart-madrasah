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
1. Gunakan gaya bahasa yang interaktif, seolah-olah Anda sedang menyapa dan berdialog dengan siswa (misal: "Halo anak-anak hebat!"). Gunakan banyak Emoji yang relevan untuk membuat teks berwarna dan menyenangkan.
2. VISUALISASI OTOMATIS: Setiap kali Anda menjelaskan tentang suatu bentuk (misal: bangun datar, bangun ruang, pecahan, dll), Anda WAJIB menggambarkannya menggunakan kode HTML <svg> murni secara langsung. Pastikan <svg> memiliki atribut width, height, viewBox, dan warna fill yang cerah (misal: merah, biru, hijau, kuning pastel). Bungkus <svg> tersebut di dalam <div style="text-align: center; margin: 15px 0;">.
3. Jelaskan konsep materi secara terstruktur. Gunakan analogi atau contoh kehidupan sehari-hari jika perlu.
4. Berikan penekanan (Bold) pada kata-kata kunci penting.
5. Akhiri modul dengan 3 soal pertanyaan pemahaman singkat (Latihan Mandiri).
6. Berikan output murni dalam format HTML yang valid (gunakan <h1>, <h2>, <p>, <ul>, <li>, <strong>, <svg>, dll.) yang siap untuk dimasukkan ke dalam Rich Text Editor. Jangan bungkus output dengan markdown blok seperti \`\`\`html.

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
    
    let errorMessage = "Gagal men-generate Bahan Ajar dari AI: " + error.message;
    if (error.message.includes("503 Service Unavailable") || error.message.includes("high demand")) {
      errorMessage = "Server AI Google Gemini sedang sangat sibuk. Silakan tunggu beberapa detik dan coba klik tombol 'AI Generate' lagi.";
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
