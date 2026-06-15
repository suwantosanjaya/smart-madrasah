"use client";

import { useState } from "react";
import { forceChangePassword } from "@/app/actions/userActions";
import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GantiPasswordPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (status === "loading") return <div className="p-8 text-center">Memuat...</div>;
  if (!session) {
    if (typeof window !== 'undefined') router.push("/login");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Password dan Konfirmasi Password tidak cocok.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    setError("");
    
    const res = await forceChangePassword(session.user.id, password);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        signOut({ callbackUrl: "/login" });
      }, 2000);
    } else {
      setError(res.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-amber-600" />
          </div>
          <CardTitle className="text-2xl">Ganti Password</CardTitle>
          <CardDescription className="text-slate-500">
            Demi keamanan, Anda wajib mengubah password default Anda saat ini sebelum melanjutkan ke Dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-4 text-emerald-600">
              <p className="font-medium mb-2">Berhasil!</p>
              <p className="text-sm">Password Anda telah diubah. Silakan masuk kembali dengan password baru.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">Password Baru</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white mt-6" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Password & Masuk"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
