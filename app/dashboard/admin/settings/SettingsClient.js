"use client";

import { useState, useTransition, useEffect } from "react";
import { Save, Bot, Key, RefreshCw, ServerCog, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSettings } from "@/app/actions/settings";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function SettingsClient({ initialSettings }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [availableModels, setAvailableModels] = useState([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);

  // States
  const [activeProvider, setActiveProvider] = useState(initialSettings?.ACTIVE_AI_PROVIDER || "gemini");
  const [activeModel, setActiveModel] = useState(initialSettings?.ACTIVE_AI_MODEL || "");
  const [geminiKey, setGeminiKey] = useState(initialSettings?.GEMINI_API_KEY || "");
  const [openaiKey, setOpenaiKey] = useState(initialSettings?.OPENAI_API_KEY || "");

  const handleSave = () => {
    startTransition(async () => {
      const payload = [
        { kunci: "ACTIVE_AI_PROVIDER", nilai: activeProvider, deskripsi: "Provider AI yang aktif (gemini/openai)" },
        { kunci: "ACTIVE_AI_MODEL", nilai: activeModel, deskripsi: "Model AI yang digunakan" },
        { kunci: "GEMINI_API_KEY", nilai: geminiKey, deskripsi: "API Key untuk Google Gemini" },
        { kunci: "OPENAI_API_KEY", nilai: openaiKey, deskripsi: "API Key untuk OpenAI" },
      ];

      const res = await updateSettings(payload);
      if (res.success) {
        setMessage("Pengaturan berhasil disimpan! Sistem kini menggunakan provider: " + activeProvider.toUpperCase());
      } else {
        setMessage("Gagal menyimpan pengaturan: " + res.error);
      }
    });
  };

  const handleFetchModels = async () => {
    setIsFetchingModels(true);
    setAvailableModels([]);
    setMessage("");

    try {
      if (activeProvider === "gemini") {
        if (!geminiKey) throw new Error("API Key Gemini belum diisi!");
        
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
        const data = await res.json();
        
        if (data.error) throw new Error(data.error.message);
        
        // Filter only models that support generateContent
        const textModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
        setAvailableModels(textModels.map(m => m.name.replace("models/", "")));
      } else if (activeProvider === "openai") {
        if (!openaiKey) throw new Error("API Key OpenAI belum diisi!");
        
        const res = await fetch("https://api.openai.com/v1/models", {
          headers: { "Authorization": `Bearer ${openaiKey}` }
        });
        const data = await res.json();
        
        if (data.error) throw new Error(data.error.message);
        
        const textModels = data.data.filter(m => m.id.includes("gpt"));
        setAvailableModels(textModels.map(m => m.id));
      }
    } catch (error) {
      setMessage("Gagal menarik daftar model: " + error.message);
    } finally {
      setIsFetchingModels(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pengaturan Sistem</h1>
        <p className="text-slate-500 mt-1">Kelola integrasi pihak ketiga dan konfigurasi aplikasi</p>
      </div>

      <Dialog open={!!message} onOpenChange={() => setMessage("")}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Informasi</DialogTitle>
            <DialogDescription className="py-4 text-slate-700">{message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setMessage("")}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Kecerdasan Buatan (AI)</CardTitle>
              <CardDescription>Atur Provider dan Model AI untuk seluruh fitur Smart Madrasah</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold text-slate-700">Pilih Provider AI</Label>
                <div className="flex gap-3">
                  <div 
                    onClick={() => { setActiveProvider("gemini"); setAvailableModels([]); }}
                    className={`flex-1 p-3 rounded-lg border-2 cursor-pointer flex flex-col items-center justify-center transition-all ${activeProvider === "gemini" ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <Bot className={`w-6 h-6 mb-2 ${activeProvider === "gemini" ? "text-blue-600" : "text-slate-400"}`} />
                    <span className={`text-sm font-medium ${activeProvider === "gemini" ? "text-blue-700" : "text-slate-600"}`}>Google Gemini</span>
                  </div>
                  
                  <div 
                    onClick={() => { setActiveProvider("openai"); setAvailableModels([]); }}
                    className={`flex-1 p-3 rounded-lg border-2 cursor-pointer flex flex-col items-center justify-center transition-all ${activeProvider === "openai" ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <ServerCog className={`w-6 h-6 mb-2 ${activeProvider === "openai" ? "text-emerald-600" : "text-slate-400"}`} />
                    <span className={`text-sm font-medium ${activeProvider === "openai" ? "text-emerald-700" : "text-slate-600"}`}>OpenAI (ChatGPT)</span>
                  </div>
                </div>
              </div>

              {activeProvider === "gemini" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label>API Key Google Gemini</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      type="password" 
                      value={geminiKey} 
                      onChange={(e) => setGeminiKey(e.target.value)} 
                      className="pl-10" 
                      placeholder="AIzaSy..." 
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Dapatkan key dari Google AI Studio (aistudio.google.com)</p>
                </div>
              )}

              {activeProvider === "openai" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label>API Key OpenAI</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      type="password" 
                      value={openaiKey} 
                      onChange={(e) => setOpenaiKey(e.target.value)} 
                      className="pl-10" 
                      placeholder="sk-proj-..." 
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Dapatkan key dari platform.openai.com</p>
                </div>
              )}
            </div>

            <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-200 md:pl-6 pt-6 md:pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold text-slate-700">Model yang Digunakan</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleFetchModels} disabled={isFetchingModels} className="h-7 text-xs">
                    <RefreshCw className={`w-3 h-3 mr-1 ${isFetchingModels ? "animate-spin" : ""}`} />
                    Tarik Model
                  </Button>
                </div>
                
                {availableModels.length > 0 ? (
                  <select 
                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    value={activeModel}
                    onChange={(e) => setActiveModel(e.target.value)}
                  >
                    <option value="">-- Pilih Model --</option>
                    {availableModels.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-sm text-slate-500 text-center">
                    {activeModel ? (
                      <div>
                        <p>Model aktif saat ini: <strong className="text-slate-800">{activeModel}</strong></p>
                        <p className="text-xs mt-1">Klik "Tarik Model" untuk melihat daftar model terbaru.</p>
                      </div>
                    ) : (
                      "Klik 'Tarik Model' untuk memuat daftar model dari API."
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "Menyimpan..." : (
                <><Save className="w-4 h-4 mr-2" /> Simpan Konfigurasi</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
