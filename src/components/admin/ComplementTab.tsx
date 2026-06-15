import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  PlusCircle,
  Link,
  X,
  AlertTriangle,
  Check
} from "lucide-react";
import { Complement, Category } from "../../types/api";
import { api } from "../../lib/api";

interface ComplementTabProps {
  complements: Complement[];
  categories: Category[];
  token: string;
  loadingData: boolean;
  onRefresh: () => void;
}

export function ComplementTab({ complements, categories, token, loadingData, onRefresh }: ComplementTabProps) {
  // Modal & Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingComplement, setEditingComplement] = useState<Complement | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Assignment States
  const [assignCompId, setAssignCompId] = useState("");
  const [assignCatId, setAssignCatId] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Set default assign IDs when data is loaded
  useEffect(() => {
    if (complements.length > 0 && !assignCompId) {
      setAssignCompId(complements[0].id);
    }
  }, [complements, assignCompId]);

  useEffect(() => {
    if (categories.length > 0 && !assignCatId) {
      setAssignCatId(categories[0].id);
    }
  }, [categories, assignCatId]);

  const openCreateModal = () => {
    setEditingComplement(null);
    setName("");
    setPrice("");
    setError("");
    setIsFormOpen(true);
  };

  const openEditModal = (c: Complement) => {
    setEditingComplement(c);
    setName(c.name);
    setPrice(c.price.toString());
    setError("");
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("El nombre es requerido.");
    if (!price.trim() || isNaN(Number(price))) return setError("El precio debe ser un número válido.");

    setSaving(true);
    const bodyData = {
      name: name.trim(),
      price: parseFloat(price),
    };

    try {
      if (editingComplement) {
        await api.updateComplement(editingComplement.id, bodyData, token);
      } else {
        await api.createComplement(bodyData, token);
      }
      setIsFormOpen(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Error al guardar el complemento.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este complemento?")) return;

    try {
      await api.deleteComplement(id, token);
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Error al eliminar el complemento");
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetCompId = assignCompId || complements[0]?.id;
    const targetCatId = assignCatId || categories[0]?.id;

    if (!targetCompId || !targetCatId) return;

    setAssigning(true);
    try {
      await api.assignComplement(targetCompId, targetCatId, token);
      alert("¡Vínculo creado con éxito!");
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Este complemento ya está vinculado a esa categoría o hubo un error.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Complements CRUD */}
      <div className="bg-[#130f0b] border border-[#2a241c] rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              Complementos (Adicionales / Extras)
            </h2>
            <p className="text-xs text-[#a39e97] mt-0.5">{complements.length} complementos registrados</p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs bg-[#ff1a1a] text-white hover:bg-[#ff3333] transition-all cursor-pointer shadow-[0_0_10px_rgba(255,26,26,0.2)]"
          >
            <Plus className="w-4 h-4" />
            Agregar Adicional
          </button>
        </div>

        {loadingData ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-[#ff1a1a] mb-3" />
            <p className="text-xs text-[#a39e97]">Cargando complementos...</p>
          </div>
        ) : complements.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-[#2a241c] rounded-2xl bg-[#1e1914]/10">
            <PlusCircle className="w-12 h-12 mx-auto text-[#6c655c] mb-3" />
            <p className="text-sm font-semibold text-white">No hay complementos creados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2a241c] text-xs font-bold uppercase tracking-wider text-[#6c655c]">
                  <th className="py-3 px-4">Adicional</th>
                  <th className="py-3 px-4 text-right">Precio Extra</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a241c]/50 text-sm">
                {complements.map((c) => (
                  <tr key={c.id} className="hover:bg-[#1e1914]/20 transition-all">
                    <td className="py-4 px-4 font-semibold text-white">{c.name}</td>
                    <td className="py-4 px-4 text-right font-semibold text-[#ff1a1a]">
                      +${c.price.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-2 border border-[#2a241c] hover:border-white hover:text-white rounded-xl text-[#a39e97] transition-all cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-2 border border-[#2a241c] hover:border-[#ff1a1a] hover:text-[#ff1a1a] rounded-xl text-[#a39e97] transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assignment Form */}
      <div className="bg-[#130f0b] border border-[#2a241c] rounded-3xl p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
          <Link className="w-4 h-4 text-[#ff1a1a]" />
          Vincular Extra a una Categoría del Menú
        </h3>

        <form onSubmit={handleAssign} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#a39e97]">
                Seleccionar Adicional
              </label>
              <select
                value={assignCompId}
                onChange={(e) => setAssignCompId(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1e1914] border border-[#2a241c] rounded-xl text-sm text-white focus:outline-none cursor-pointer"
              >
                {complements.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (+${c.price})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#a39e97]">
                Seleccionar Categoría
              </label>
              <select
                value={assignCatId}
                onChange={(e) => setAssignCatId(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1e1914] border border-[#2a241c] rounded-xl text-sm text-white focus:outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={assigning || complements.length === 0 || categories.length === 0}
            className="w-full sm:w-auto px-6 py-3 bg-[#ff1a1a] hover:bg-[#ff3333] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
          >
            {assigning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
            Crear Vínculo
          </button>
        </form>
      </div>

      {/* Complement Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-md bg-[#130f0b] border border-[#2a241c] rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full border border-[#2a241c] text-[#a39e97] hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold tracking-widest uppercase text-white mb-6">
              {editingComplement ? "Editar Adicional" : "Agregar Adicional"}
            </h3>

            <form onSubmit={handleSave} className="space-y-5">
              {error && (
                <div className="bg-[#ff1a1a]/10 border border-[#ff1a1a]/30 rounded-xl p-4 flex gap-3 text-xs text-[#ff4d4d]">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#a39e97]">Nombre del Adicional *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Queso Cheddar Extra, Tocino, Papas..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1e1914] border border-[#2a241c] rounded-xl text-sm focus:outline-none focus:border-[#ff1a1a] transition-all text-white placeholder:text-[#6c655c]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#a39e97]">Precio Extra ($) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c655c]" />
                  <input
                    type="text"
                    required
                    placeholder="25"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-[#1e1914] border border-[#2a241c] rounded-xl text-sm focus:outline-none focus:border-[#ff1a1a] transition-all text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4 border-t border-[#2a241c] pt-5 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3.5 bg-[#ff1a1a] hover:bg-[#ff3333] font-bold text-xs uppercase tracking-widest text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" />{editingComplement ? "Guardar Cambios" : "Crear Adicional"}</>}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="py-3.5 px-6 border border-[#2a241c] hover:bg-[#1e1914] font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
