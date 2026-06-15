import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

// Load env
const envContent = fs.readFileSync(".env", "utf8");
const match = envContent.match(/GEMINI_API_KEY=(.*)/);
if (!match) process.exit(1);

const genAI = new GoogleGenerativeAI(match[1].trim());
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const prompt = `Anda adalah ahli kurikulum pendidikan di Indonesia (Kurikulum Merdeka). 
Buatlah kerangka Rencana Pelaksanaan Pembelajaran (RPP) / Modul Ajar singkat untuk:
- Mata Pelajaran: Matematika
- Materi Pokok / Judul: Bilangan Pecahan
- Kelas / Fase: Kelas 4 (Fase B) (Semester Ganjil)
- Target Kognitif Taksonomi Bloom: C1 - Mengingat

Berikan output murni dalam format JSON yang tepat dan bisa di-parse (tanpa tag markdown \`\`\`json). Struktur JSON yang diminta (Gunakan format HTML murni seperti <ul>, <ol>, <li>, <strong>, dll. di dalam nilai setiap kunci untuk *styling* paragraf dan penomoran list):
{
  "tujuan": "Tujuan Pembelajaran secara spesifik (Gunakan HTML)...",
  "pendahuluan": "Langkah-langkah kegiatan pendahuluan (Gunakan tag <ol> dan <li> untuk penomoran)...",
  "inti": "Langkah-langkah kegiatan inti (Gunakan tag <ol> dan <li> untuk penomoran)...",
  "penutup": "Langkah-langkah kegiatan penutup (Gunakan tag <ol> dan <li> untuk penomoran)...",
  "penilaian": "Teknik dan instrumen penilaian (Gunakan tag <ul> atau <ol>)...",
  "alokasiWaktu": "Contoh: 2 x 40 Menit"
}`;

async function run() {
  const result = await model.generateContent(prompt);
  let text = result.response.text();
  console.log("Raw:\n", text);
  text = text.replace(/```json/g, "").replace(/```html/g, "").replace(/```/g, "").trim();
  console.log("Parsed:\n", JSON.parse(text));
}
run();
