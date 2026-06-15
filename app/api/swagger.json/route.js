import { NextResponse } from "next/server";

export async function GET() {
  const swaggerSpec = {
    openapi: "3.0.0",
    info: {
      title: "Smart Madrasah API",
      version: "1.0.0",
      description: "Dokumentasi API untuk integrasi Smart Madrasah dengan Frontend eksternal atau Aplikasi Mobile.",
      contact: {
        name: "Admin Madrasah",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development Server",
      },
    ],
    paths: {
      "/api/madrasah": {
        get: {
          summary: "Mengambil Profil Madrasah",
          description: "Mengembalikan data identitas madrasah yang aktif.",
          tags: ["Profil Madrasah"],
          responses: {
            "200": {
              description: "Berhasil mengambil data",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Berhasil mengambil data madrasah" },
                      data: {
                        type: "object",
                        properties: {
                          id: { type: "integer", example: 1 },
                          namaMadrasah: { type: "string", example: "SMP Tahfizh Cendekia Pekanbaru" },
                          npsn: { type: "string", example: "69945678" },
                          telepon: { type: "string", example: "0761-12345678" },
                          email: { type: "string", example: "info@mitahfizhcendekia.sch.id" }
                        }
                      }
                    }
                  }
                }
              }
            },
            "404": {
              description: "Data madrasah tidak ditemukan"
            }
          }
        }
      },
      "/api/ai/generate-rpp": {
        post: {
          summary: "Generate RPP menggunakan AI",
          description: "Menghasilkan rancangan RPP otomatis berdasarkan parameter yang dikirimkan.",
          tags: ["AI Tools"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    judul: { type: "string", example: "Bangun Ruang" },
                    mapel: { type: "string", example: "Matematika" },
                    tingkat: { type: "string", example: "Kelas 4" },
                    semester: { type: "string", example: "Genap" },
                    targetKognitif: { type: "string", example: "C3 - Menerapkan" }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Berhasil generate RPP",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      tujuan: { type: "string" },
                      pendahuluan: { type: "string" },
                      inti: { type: "string" },
                      penutup: { type: "string" },
                      penilaian: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  return NextResponse.json(swaggerSpec);
}
