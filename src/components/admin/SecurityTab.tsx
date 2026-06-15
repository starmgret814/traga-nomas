import { useState } from "react";
import { Lock, User, KeyRound, RefreshCw, Save, ShieldAlert, Check } from "lucide-react";
import { api } from "../../lib/api";

interface SecurityTabProps {
  token: string;
  onLogout: () => void;
}

export function SecurityTab({ token, onLogout }: SecurityTabProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUser, setNewUser] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword) {
      return setError("Debes escribir tu contraseña actual por motivos de seguridad.");
    }
    if (!newUser.trim() && !newPassword.trim()) {
      return setError("Debes ingresar al menos un valor nuevo (Usuario o Contraseña).");
    }

    setUpdating(true);
    const bodyData: any = { currentPassword };
    if (newUser.trim()) bodyData.newUser = newUser.trim();
    if (newPassword.trim()) bodyData.newPassword = newPassword.trim();

    try {
      await api.updateCredentials(bodyData, token);
      setSuccess("¡Credenciales actualizadas exitosamente!");
      setCurrentPassword("");
      setNewUser("");
      setNewPassword("");

      // Force relog with new credentials after 2 seconds
      setTimeout(() => {
        onLogout();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Error al procesar la solicitud.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-[#130f0b] border border-[#2a241c] rounded-3xl p-6">
      <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-2">Seguridad y Credenciales</h2>
      <p className="text-xs text-[#a39e97] mb-6">Actualiza tu nombre de usuario administrador o cambia tu contraseña de acceso.</p>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
        {error && (
          <div className="bg-[#ff1a1a]/10 border border-[#ff1a1a]/30 rounded-xl p-4 flex gap-3 text-xs text-[#ff4d4d]">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/35 rounded-xl p-4 flex gap-3 text-xs text-emerald-500 font-bold">
            <Check className="w-5 h-5 flex-shrink-0" />
            <p>{success} Se cerrará sesión para aplicar los cambios...</p>
          </div>
        )}

        {/* Current Password */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#a39e97]">Contraseña Actual *</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c655c]" />
            <input
              type="password"
              required
              placeholder="Contraseña de administrador actual"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-[#1e1914] border border-[#2a241c] rounded-xl text-sm focus:outline-none focus:border-[#ff1a1a] transition-all text-white"
            />
          </div>
        </div>

        <div className="border-t border-[#2a241c] pt-4 my-4" />

        {/* New Username */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#a39e97]">Nuevo Nombre de Usuario</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c655c]" />
            <input
              type="text"
              placeholder="Nuevo usuario (deja vacío si no deseas cambiarlo)"
              value={newUser}
              onChange={(e) => setNewUser(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-[#1e1914] border border-[#2a241c] rounded-xl text-sm focus:outline-none focus:border-[#ff1a1a] transition-all text-white placeholder:text-[#6c655c]"
            />
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#a39e97]">Nueva Contraseña</label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c655c]" />
            <input
              type="password"
              placeholder="Nueva contraseña (deja vacío si no deseas cambiarla)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-[#1e1914] border border-[#2a241c] rounded-xl text-sm focus:outline-none focus:border-[#ff1a1a] transition-all text-white placeholder:text-[#6c655c]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={updating}
          className="w-full py-3.5 bg-[#ff1a1a] hover:bg-[#ff3333] font-bold text-xs uppercase tracking-widest text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(255,26,26,0.15)] disabled:opacity-50 transition-all"
        >
          {updating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Actualizar Credenciales
        </button>
      </form>
    </div>
  );
}
