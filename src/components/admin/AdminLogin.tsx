import { useState } from "react";
import { User, Lock, RefreshCw, AlertTriangle } from "lucide-react";
import { api } from "../../lib/api";

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void;
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoadingLogin(true);

    try {
      const data = await api.login(username, password);
      if (data.access_token) {
        localStorage.setItem("admin_token", data.access_token);
        onLoginSuccess(data.access_token);
      }
    } catch (err: any) {
      setLoginError(err.message || "Usuario o contraseña incorrectos.");
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0d0905] text-[#f7f5f2] flex items-center justify-center px-4 font-sans">
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#ff1a1a]/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-[#130f0b]/90 backdrop-blur-xl border border-[#2a241c] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#ff1a1a] to-transparent shadow-[0_0_15px_#ff1a1a]" />

        <div className="flex flex-col items-center mb-8">
          <img src="/logo-traga-nomas.png" alt="Traga Nomas" className="h-16 w-auto mb-4" />
          <h1 className="text-2xl font-bold tracking-widest uppercase text-center text-white [text-shadow:0_0_8px_rgba(255,26,26,0.6)]">
            Panel Administrativo
          </h1>
          <p className="text-xs text-[#a39e97] mt-1">Traga Nomas — Muerde sin respeto</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {loginError && (
            <div className="bg-[#ff1a1a]/10 border border-[#ff1a1a]/30 rounded-xl p-4 flex gap-3 text-sm text-[#ff4d4d]">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p>{loginError}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#a39e97]">Usuario</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6c655c]" />
              <input
                type="text"
                required
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#1e1914] border border-[#2a241c] rounded-xl text-sm focus:outline-none focus:border-[#ff1a1a] transition-all text-white placeholder:text-[#6c655c]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#a39e97]">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6c655c]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#1e1914] border border-[#2a241c] rounded-xl text-sm focus:outline-none focus:border-[#ff1a1a] transition-all text-white placeholder:text-[#6c655c]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingLogin}
            className="w-full py-4 rounded-xl font-bold uppercase tracking-wider text-sm bg-[#ff1a1a] text-white hover:bg-[#ff3333] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,26,26,0.3)] disabled:opacity-50"
          >
            {loadingLogin ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              "Ingresar"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
