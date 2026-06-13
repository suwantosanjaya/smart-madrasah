import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { judul, mapel, tingkat, semester } = await req.json();

    // Simulasi delay AI generate (2.5 detik) agar terasa nyata
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Menghasilkan RPP berdasarkan parameter (Mock AI Logic yang sangat cerdas)
    let tujuan = "";
    let pendahuluan = "";
    let inti = "";
    let penutup = "";
    let penilaian = "";

    const lowerJudul = judul.toLowerCase();
    
    if (mapel.toLowerCase().includes("matematika")) {
      tujuan = `Peserta didik mampu memahami konsep dasar ${judul} dan memecahkan soal cerita yang berkaitan dengan ${judul} dalam kehidupan sehari-hari secara mandiri dan kritis.`;
      pendahuluan = `1. Guru mengucapkan salam dan memimpin doa bersama.\n2. Guru mengecek kehadiran siswa.\n3. Apersepsi: Guru mengaitkan konsep ${judul} dengan pengalaman siswa saat berbelanja atau menghitung benda.\n4. Guru menyampaikan tujuan pembelajaran hari ini.`;
      inti = `1. Stimulation: Guru menampilkan gambar/alat peraga terkait ${judul}.\n2. Problem Statement: Siswa diminta merumuskan pertanyaan dari peraga tersebut.\n3. Data Collection: Siswa dibagi dalam kelompok 4 orang untuk bereksplorasi dengan benda konkret/LKS.\n4. Data Processing: Kelompok menyelesaikan permasalahan tentang ${judul}.\n5. Verification: Perwakilan kelompok mempresentasikan hasil perhitungan di depan kelas.\n6. Generalization: Guru memberikan penguatan konsep yang benar.`;
      penutup = `1. Refleksi: Guru bertanya apa kesulitan terbesar saat menghitung ${judul}.\n2. Evaluasi: Kuis singkat 3 soal esai.\n3. Tindak Lanjut: Pemberian PR dan informasi materi selanjutnya.\n4. Doa penutup.`;
      penilaian = `1. Sikap: Lembar observasi (Gotong royong dan Bernalar Kritis saat diskusi).\n2. Pengetahuan: Tes Tertulis (Soal cerita).\n3. Keterampilan: Unjuk Kerja (Ketepatan mempresentasikan hasil hitungan).`;
    } else if (mapel.toLowerCase().includes("bahasa") || mapel.toLowerCase().includes("indonesia")) {
      tujuan = `Peserta didik mampu mengidentifikasi struktur, ciri kebahasaan, dan makna dari ${judul} yang dibaca/didengar secara teliti, serta mampu menyajikan gagasan terkait ${judul} secara lisan/tulis.`;
      pendahuluan = `1. Pembukaan dengan salam dan doa.\n2. Apersepsi: Guru memancing ingatan siswa dengan menampilkan contoh singkat ${judul}.\n3. Motivasi: Guru menjelaskan manfaat terampil menyusun ${judul}.`;
      inti = `1. Literasi: Siswa membaca teks contoh ${judul} secara bergantian.\n2. Identifikasi: Secara berpasangan, siswa menggarisbawahi ciri-ciri dan kosakata baru.\n3. Diskusi: Membedah struktur dan pesan yang tersirat.\n4. Berkarya: Siswa mencoba membuat draft ${judul} secara mandiri.\n5. Presentasi: Membacakan hasil karya di depan kelas untuk ditanggapi teman.`;
      penutup = `1. Refleksi: Menulis "Satu hal yang kupelajari hari ini" di sticky notes.\n2. Penguatan: Guru menyimpulkan kaidah kebahasaan yang tepat.\n3. Penugasan: Memperbaiki draft menjadi karya final di rumah.\n4. Doa dan salam penutup.`;
      penilaian = `1. Sikap: Jurnal pengamatan (Percaya diri dan Kreatif).\n2. Pengetahuan: Tes Pilihan Ganda (Struktur teks).\n3. Keterampilan: Produk (Portofolio tulisan/Bercerita).`;
    } else if (mapel.toLowerCase().includes("ipa") || mapel.toLowerCase().includes("sains")) {
      tujuan = `Peserta didik mampu menjelaskan proses, bagian-bagian, atau konsep dari ${judul} melalui kegiatan eksperimen atau pengamatan dengan rasa ingin tahu yang tinggi.`;
      pendahuluan = `1. Guru memberi salam dan memimpin doa.\n2. Apersepsi: Guru menunjukkan fenomena alam sehari-hari yang berkaitan dengan ${judul}.\n3. Guru menyampaikan skenario pembelajaran eksperimen.`;
      inti = `1. Merumuskan Masalah: Siswa mengamati video/fenomena tentang ${judul}.\n2. Hipotesis: Siswa menduga apa yang akan terjadi.\n3. Eksperimen: Melakukan percobaan sederhana secara berkelompok sesuai panduan LKS.\n4. Mengolah Data: Mencatat hasil pengamatan ke dalam tabel.\n5. Kesimpulan: Mendiskusikan apakah hasil sesuai hipotesis dan mempresentasikannya.`;
      penutup = `1. Refleksi: Guru meluruskan miskonsepsi (jika ada).\n2. Evaluasi: Tes formatif tertulis.\n3. Tindak Lanjut: Meminta siswa mengamati kejadian terkait ${judul} di sekitar rumah.\n4. Doa penutup.`;
      penilaian = `1. Sikap: Observasi (Rasa ingin tahu dan Objektif).\n2. Pengetahuan: Laporan tertulis (Post-test).\n3. Keterampilan: Praktik (Cara menggunakan alat dan bahan eksperimen).`;
    } else {
      tujuan = `Peserta didik mampu memahami konsep pokok dari materi ${judul} sesuai dengan standar pencapaian fase ini secara komprehensif.`;
      pendahuluan = `1. Mengkondisikan kelas (salam, doa, absensi).\n2. Apersepsi singkat.\n3. Menyampaikan tujuan belajar.`;
      inti = `1. Guru memaparkan materi inti terkait ${judul}.\n2. Siswa dibagi ke dalam kelompok diskusi.\n3. Tanya jawab interaktif antara guru dan siswa.\n4. Pengerjaan LKPD (Lembar Kerja Peserta Didik).`;
      penutup = `1. Membuat kesimpulan bersama.\n2. Mengerjakan kuis/post-test.\n3. Doa penutup.`;
      penilaian = `1. Sikap: Observasi Keaktifan.\n2. Pengetahuan: Tes Formatif.\n3. Keterampilan: Penugasan kelompok.`;
    }

    return NextResponse.json({
      tujuan,
      pendahuluan,
      inti,
      penutup,
      penilaian,
      alokasiWaktu: "2 x 40 Menit (1 Pertemuan)",
    });

  } catch (error) {
    return NextResponse.json({ error: "Gagal men-generate RPP" }, { status: 500 });
  }
}
