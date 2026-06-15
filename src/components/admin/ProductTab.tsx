import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Store,
  Image,
  DollarSign,
  X,
  AlertTriangle,
  Check
} from "lucide-react";
import { Product, Category } from "../../types/api";
import { api } from "../../lib/api";

interface ProductTabProps {
  products: Product[];
  categories: Category[];
  token: string;
  loadingData: boolean;
  onRefresh: () => void;
}

export function ProductTab({ products, categories, token, loadingData, onRefresh }: ProductTabProps) {
  // Modal & Form States
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isPromo, setIsPromo] = useState(false);
  const [promoPrice, setPromoPrice] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName("");
    setDescription("");
    setPrice("");
    setCategoryId(categories[0]?.id || "");
    setIsPromo(false);
    setPromoPrice("");
    setIsFeatured(false);
    setImageUrl("");
    setError("");
    setIsOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description || "");
    setPrice(p.price.toString());
    setCategoryId(p.categoryId);
    setIsPromo(p.isPromo);
    setPromoPrice(p.promoPrice?.toString() || "");
    setIsFeatured(p.isFeatured);
    setImageUrl(p.imageUrl || "");
    setError("");
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("El nombre es requerido.");
    if (!price.trim() || isNaN(Number(price))) return setError("El precio debe ser un número válido.");
    if (!categoryId) return setError("Debes seleccionar una categoría.");
    if (isPromo && (!promoPrice.trim() || isNaN(Number(promoPrice)))) {
      return setError("Debes ingresar un precio de promoción válido.");
    }

    setSaving(true);
    const bodyData = {
      name: name.trim(),
      description: description.trim() || null,
      price: parseFloat(price),
      categoryId,
      isPromo,
      promoPrice: isPromo ? parseFloat(promoPrice) : null,
      isFeatured,
      imageUrl: imageUrl.trim() || null
    };

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, bodyData, token);
      } else {
        await api.createProduct(bodyData, token);
      }
      setIsOpen(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Error al procesar el producto.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

    try {
      await api.deleteProduct(id, token);
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Error al eliminar el producto");
    }
  };

  return (
    <div className="bg-[#130f0b] border border-[#2a241c] rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">Carta / Menú</h2>
          <p className="text-xs text-[#a39e97] mt-0.5">{products.length} productos registrados</p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs bg-[#ff1a1a] text-white hover:bg-[#ff3333] transition-all cursor-pointer shadow-[0_0_10px_rgba(255,26,26,0.2)]"
        >
          <Plus className="w-4 h-4" />
          Agregar Producto
        </button>
      </div>

      {loadingData ? (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-[#ff1a1a] mb-3" />
          <p className="text-xs text-[#a39e97]">Cargando catálogo...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-[#2a241c] rounded-2xl bg-[#1e1914]/10">
          <Store className="w-12 h-12 mx-auto text-[#6c655c] mb-3" />
          <p className="text-sm font-semibold text-white">No hay productos en la carta</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2a241c] text-xs font-bold uppercase tracking-wider text-[#6c655c]">
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4 text-right">Precio</th>
                <th className="py-3 px-4 text-center">Flags</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a241c]/50 text-sm">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-[#1e1914]/20 transition-all">
                  <td className="py-4 px-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[#1e1914] overflow-hidden flex-shrink-0 border border-[#2a241c]">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#6c655c]">
                          <Image className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate max-w-[150px] sm:max-w-[200px]">{p.name}</p>
                      <p className="text-xs text-[#6c655c] line-clamp-1 max-w-[150px] sm:max-w-[200px]">{p.description || "Sin descripción."}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[#a39e97]">
                    <span className="text-xs font-semibold uppercase bg-[#1e1914] border border-[#2a241c] px-2.5 py-1 rounded-full">
                      {p.categoryName || "Otros"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-white">
                    {p.isPromo && p.promoPrice !== null ? (
                      <div>
                        <p className="text-[#ff1a1a]">${p.promoPrice.toFixed(2)}</p>
                        <p className="text-[10px] text-[#6c655c] line-through">${p.price.toFixed(2)}</p>
                      </div>
                    ) : (
                      `$${p.price.toFixed(2)}`
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {p.isFeatured && <span className="text-[9px] font-bold text-white bg-amber-600 px-1.5 py-0.5 rounded uppercase">TOP</span>}
                      {p.isPromo && <span className="text-[9px] font-bold text-white bg-red-600 px-1.5 py-0.5 rounded uppercase">PROMO</span>}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-2 border border-[#2a241c] hover:border-white hover:text-white rounded-xl text-[#a39e97] transition-all cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
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

      {/* Product Form Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-xl bg-[#130f0b] border border-[#2a241c] rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full border border-[#2a241c] text-[#a39e97] hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold tracking-widest uppercase text-white mb-6">
              {editingProduct ? "Editar Producto" : "Agregar Producto"}
            </h3>

            <form onSubmit={handleSave} className="space-y-5">
              {error && (
                <div className="bg-[#ff1a1a]/10 border border-[#ff1a1a]/30 rounded-xl p-4 flex gap-3 text-xs text-[#ff4d4d]">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#a39e97]">Nombre del producto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: La Patrona Doble"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1e1914] border border-[#2a241c] rounded-xl text-sm focus:outline-none focus:border-[#ff1a1a] transition-all text-white placeholder:text-[#6c655c]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#a39e97]">Descripción</label>
                <textarea
                  placeholder="Ingredientes o detalles..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-[#1e1914] border border-[#2a241c] rounded-xl text-sm focus:outline-none focus:border-[#ff1a1a] transition-all text-white placeholder:text-[#6c655c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#a39e97]">Precio Base ($) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c655c]" />
                    <input
                      type="text"
                      required
                      placeholder="120"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-[#1e1914] border border-[#2a241c] rounded-xl text-sm focus:outline-none focus:border-[#ff1a1a] transition-all text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#a39e97]">Categoría *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1e1914] border border-[#2a241c] rounded-xl text-sm focus:outline-none focus:border-[#ff1a1a] transition-all text-white cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#a39e97]">Enlace de la Imagen (URL)</label>
                <div className="relative">
                  <Image className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c655c]" />
                  <input
                    type="text"
                    placeholder="https://pagina.com/foto.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#1e1914] border border-[#2a241c] rounded-xl text-sm focus:outline-none focus:border-[#ff1a1a] transition-all text-white placeholder:text-[#6c655c]"
                  />
                </div>
              </div>

              <div className="border border-[#2a241c] bg-[#1e1914]/20 p-4 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="prodIsPromo"
                    checked={isPromo}
                    onChange={(e) => setIsPromo(e.target.checked)}
                    className="rounded border-[#2a241c] text-[#ff1a1a] focus:ring-[#ff1a1a] w-4 h-4 bg-[#130f0b] cursor-pointer"
                  />
                  <label htmlFor="prodIsPromo" className="text-xs font-semibold uppercase tracking-wider text-white cursor-pointer select-none">
                    ¿Es producto en Promoción?
                  </label>
                </div>

                {isPromo && (
                  <div className="space-y-1.5 pl-7">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#a39e97]">Precio Oferta ($) *</label>
                    <div className="relative max-w-[180px]">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c655c]" />
                      <input
                        type="text"
                        required={isPromo}
                        placeholder="89"
                        value={promoPrice}
                        onChange={(e) => setPromoPrice(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-[#130f0b] border border-[#2a241c] rounded-xl text-sm focus:outline-none focus:border-[#ff1a1a] transition-all text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pl-2">
                <input
                  type="checkbox"
                  id="prodIsFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-[#2a241c] text-[#ff1a1a] focus:ring-[#ff1a1a] w-4 h-4 bg-[#130f0b] cursor-pointer"
                />
                <label htmlFor="prodIsFeatured" className="text-xs font-semibold uppercase tracking-wider text-white cursor-pointer select-none">
                  Marcar como Producto Destacado (TOP)
                </label>
              </div>

              <div className="flex gap-4 border-t border-[#2a241c] pt-5 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3.5 bg-[#ff1a1a] hover:bg-[#ff3333] font-bold text-sm uppercase tracking-widest text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" />{editingProduct ? "Guardar Cambios" : "Crear Producto"}</>}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="py-3.5 px-6 border border-[#2a241c] hover:bg-[#1e1914] font-semibold text-sm rounded-xl cursor-pointer"
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
