import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  FolderOpen,
  X,
  AlertTriangle,
  Check
} from "lucide-react";
import { Category } from "../../types/api";
import { api } from "../../lib/api";

interface CategoryTabProps {
  categories: Category[];
  token: string;
  loadingData: boolean;
  onRefresh: () => void;
}

export function CategoryTab({ categories, token, loadingData, onRefresh }: CategoryTabProps) {
  // Modal & Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Category Complements Modal State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setError("");
    setIsFormOpen(true);
  };

  const openEditModal = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setError("");
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("El nombre es requerido.");

    setSaving(true);
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, name.trim(), token);
      } else {
        await api.createCategory(name.trim(), token);
      }
      setIsFormOpen(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Error al guardar la categoría.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar esta categoría? Esto no eliminará los productos pero ya no estarán agrupados en ella."
      )
    )
      return;

    try {
      await api.deleteCategory(id, token);
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Error al eliminar la categoría");
    }
  };

  const handleUnassign = async (complementId: string, categoryId: string) => {
    if (!window.confirm("¿Estás seguro de que deseas desvincular este complemento de esta categoría?")) return;

    try {
      await api.unassignComplement(complementId, categoryId, token);
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Error al desvincular el complemento");
    }
  };

  // Find the selected category from the updated categories array
  const activeCategory = selectedCategoryId ? categories.find((c) => c.id === selectedCategoryId) : null;

  return (
    <div className="bg-[#130f0b] border border-[#2a241c] rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">Categorías de la Carta</h2>
          <p className="text-xs text-[#a39e97] mt-0.5">{categories.length} categorías registradas</p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs bg-[#ff1a1a] text-white hover:bg-[#ff3333] transition-all cursor-pointer shadow-[0_0_10px_rgba(255,26,26,0.2)]"
        >
          <Plus className="w-4 h-4" />
          Agregar Categoría
        </button>
      </div>

      {loadingData ? (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-[#ff1a1a] mb-3" />
          <p className="text-xs text-[#a39e97]">Cargando categorías...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-[#2a241c] rounded-2xl bg-[#1e1914]/10">
          <FolderOpen className="w-12 h-12 mx-auto text-[#6c655c] mb-3" />
          <p className="text-sm font-semibold text-white">No hay categorías cargadas</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2a241c] text-xs font-bold uppercase tracking-wider text-[#6c655c]">
                <th className="py-3 px-4">Nombre de Categoría</th>
                <th className="py-3 px-4 text-center">Complementos Vinculados</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a241c]/50 text-sm">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-[#1e1914]/20 transition-all">
                  <td className="py-4 px-4 font-semibold text-white">{c.name}</td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => setSelectedCategoryId(c.id)}
                      className="text-xs bg-[#1e1914] hover:bg-[#2a241c] hover:text-[#ff1a1a] border border-[#2a241c] px-3 py-1 rounded-full text-white/80 cursor-pointer transition-all flex items-center gap-1.5 mx-auto"
                    >
                      <span>{c.complementsCategories?.length || 0} complementos</span>
                    </button>
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

      {/* Category Edit/Create Form Modal */}
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
              {editingCategory ? "Editar Categoría" : "Agregar Categoría"}
            </h3>

            <form onSubmit={handleSave} className="space-y-5">
              {error && (
                <div className="bg-[#ff1a1a]/10 border border-[#ff1a1a]/30 rounded-xl p-4 flex gap-3 text-xs text-[#ff4d4d]">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#a39e97]">Nombre de la Categoría *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Hamburguesas, Bebidas, Postres..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1e1914] border border-[#2a241c] rounded-xl text-sm focus:outline-none focus:border-[#ff1a1a] transition-all text-white placeholder:text-[#6c655c]"
                />
              </div>

              <div className="flex gap-4 border-t border-[#2a241c] pt-5 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3.5 bg-[#ff1a1a] hover:bg-[#ff3333] font-bold text-xs uppercase tracking-widest text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" />{editingCategory ? "Guardar Cambios" : "Crear Categoría"}</>}
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

      {/* Category Complements List Modal */}
      {activeCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-md bg-[#130f0b] border border-[#2a241c] rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className="absolute top-6 right-6 p-2 rounded-full border border-[#2a241c] text-[#a39e97] hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold tracking-widest uppercase text-white mb-2">Complementos Vinculados</h3>
            <p className="text-xs text-[#a39e97] mb-6">
              Categoría: <span className="text-white font-semibold">{activeCategory.name}</span>
            </p>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {!activeCategory.complementsCategories || activeCategory.complementsCategories.length === 0 ? (
                <p className="text-sm text-[#6c655c] text-center py-4">No hay complementos vinculados a esta categoría.</p>
              ) : (
                activeCategory.complementsCategories.map((cc: any) => {
                  const comp = cc.complement;
                  if (!comp) return null;
                  return (
                    <div key={comp.id} className="flex items-center justify-between p-3.5 bg-[#1e1914] border border-[#2a241c] rounded-2xl">
                      <div>
                        <p className="font-semibold text-white text-sm">{comp.name}</p>
                        <p className="text-xs text-[#ff1a1a] font-medium">+${comp.price.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => handleUnassign(comp.id, activeCategory.id)}
                        className="p-2 border border-[#2a241c] hover:border-[#ff1a1a] hover:text-[#ff1a1a] rounded-xl text-[#a39e97] transition-all cursor-pointer flex items-center justify-center"
                        title="Desvincular de la categoría"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end border-t border-[#2a241c] pt-5 mt-6">
              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className="w-full sm:w-auto px-6 py-2.5 border border-[#2a241c] hover:bg-[#1e1914] font-semibold text-xs uppercase tracking-wider rounded-xl cursor-pointer text-center text-white"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
