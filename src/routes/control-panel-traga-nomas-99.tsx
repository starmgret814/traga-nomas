import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Store,
  FolderOpen,
  PlusCircle,
  KeyRound,
  RefreshCw,
  Save,
  LogOut,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Product, Category, Complement, Company } from "@/types/api";
import { api } from "@/lib/api";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { ProductTab } from "@/components/admin/ProductTab";
import { CategoryTab } from "@/components/admin/CategoryTab";
import { ComplementTab } from "@/components/admin/ComplementTab";
import { SecurityTab } from "@/components/admin/SecurityTab";

export const Route = createFileRoute("/control-panel-traga-nomas-99")({
  component: AdminPage,
});

function AdminPage() {
  const [token, setToken] = useState<string | null>(null);

  // Active Tab: "products" | "categories" | "complements" | "security"
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "complements" | "security">("products");

  // Data states
  const [company, setCompany] = useState<Company | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [complements, setComplements] = useState<Complement[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Edit Company states
  const [editingCompany, setEditingCompany] = useState(false);
  const [compName, setCompName] = useState("");
  const [compPhone, setCompPhone] = useState("");
  const [savingCompany, setSavingCompany] = useState(false);

  // Load token from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Fetch all database information once authenticated
  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      // 1. Fetch Company details
      const companyData = await api.getCompany();
      setCompany(companyData);
      setCompName(companyData.name);
      setCompPhone(companyData.number);

      // 2. Fetch categories
      const catData = await api.getCategories();
      if (Array.isArray(catData)) {
        setCategories(catData);

        // Extract products and map their category name
        const allProducts: Product[] = [];
        catData.forEach(c => {
          if (Array.isArray(c.products)) {
            c.products.forEach((p: any) => {
              allProducts.push({
                ...p,
                categoryName: c.name
              });
            });
          }
        });
        setProducts(allProducts);
      }

      // 3. Fetch complements
      const complementsData = await api.getComplements();
      if (Array.isArray(complementsData)) {
        setComplements(complementsData);
      }
    } catch (error) {
      console.error("Error al cargar datos del API:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
    setCompany(null);
    setProducts([]);
    setCategories([]);
    setComplements([]);
  };

  const toggleOpenStatus = async () => {
    if (!company || !token) return;
    const newStatus = !company.isOpen;

    // optimistic update
    setCompany({ ...company, isOpen: newStatus });

    try {
      const updated = await api.updateCompany(company.id, { isOpen: newStatus }, token);
      setCompany(updated);
    } catch (error) {
      // revert on error
      setCompany({ ...company, isOpen: !newStatus });
      alert("Error al actualizar el estado del local");
    }
  };

  const handleSaveCompany = async () => {
    if (!company || !token) return;
    setSavingCompany(true);

    try {
      const updated = await api.updateCompany(company.id, { name: compName, number: compPhone }, token);
      setCompany(updated);
      setEditingCompany(false);
    } catch (error) {
      alert("No se pudo actualizar los datos del local");
    } finally {
      setSavingCompany(false);
    }
  };

  // LOGIN SCREEN
  if (!token) {
    return <AdminLogin onLoginSuccess={(tok) => setToken(tok)} />;
  }

  // MAIN ADMIN DASHBOARD
  return (
    <main className="min-h-screen bg-[#0d0905] text-[#f7f5f2] font-sans pb-16">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#ff1a1a]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0d0905]/80 backdrop-blur-xl border-b border-[#2a241c] py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo-traga-nomas.png" alt="Traga Nomas" className="h-10 sm:h-12 w-auto" />
            <span className="hidden sm:inline h-6 w-[1px] bg-[#2a241c]" />
            <h1 className="hidden sm:block text-lg font-bold tracking-widest uppercase [text-shadow:0_0_5px_#ff1a1a] text-white">
              Panel Administrativo
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 border border-[#2a241c] hover:border-white hover:text-white rounded-xl text-sm transition-all font-semibold cursor-pointer text-[#a39e97]"
            >
              <ExternalLink className="w-4 h-4" />
              Ver Sitio Web
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-[#2a241c] hover:border-[#ff1a1a] hover:text-[#ff1a1a] rounded-xl text-sm transition-all font-semibold cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Store Info and Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Store details & Tab Navigation */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status card */}
          <div className="bg-[#130f0b] border border-[#2a241c] rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Store className="w-24 h-24 text-white" />
            </div>

            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#a39e97] mb-4">
              Estado de la Tienda
            </h2>

            {loadingData && !company ? (
              <div className="flex items-center justify-center py-6">
                <RefreshCw className="w-6 h-6 animate-spin text-[#ff1a1a]" />
              </div>
            ) : company ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xl text-white">{company.name}</h3>
                    <p className="text-xs text-[#a39e97] mt-1">Pedidos: +{company.number}</p>
                  </div>

                  <button
                    onClick={toggleOpenStatus}
                    className={cn(
                      "relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      company.isOpen ? "bg-[#ff1a1a] shadow-[0_0_10px_#ff1a1a]" : "bg-[#2a241c]"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        company.isOpen ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                <div className="border-t border-[#2a241c] pt-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "w-3.5 h-3.5 rounded-full z-10",
                        company.isOpen
                          ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"
                          : "bg-[#ff1a1a] shadow-[0_0_8px_#ff1a1a]"
                      )}
                    />
                    <span className="text-sm font-bold uppercase tracking-wider">
                      {company.isOpen ? (
                        <span className="text-emerald-500">Abierto (Recibiendo pedidos)</span>
                      ) : (
                        <span className="text-[#ff1a1a]">Cerrado Temporalmente</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Edit Company details */}
                <div className="border-t border-[#2a241c] pt-4">
                  {editingCompany ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#a39e97]">Nombre del local</label>
                        <input
                          type="text"
                          value={compName}
                          onChange={(e) => setCompName(e.target.value)}
                          className="w-full px-3 py-2 bg-[#1e1914] border border-[#2a241c] rounded-xl text-sm text-white focus:outline-none focus:border-[#ff1a1a] mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#a39e97]">WhatsApp pedidos (con prefijo)</label>
                        <input
                          type="text"
                          value={compPhone}
                          onChange={(e) => setCompPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-[#1e1914] border border-[#2a241c] rounded-xl text-sm text-white focus:outline-none focus:border-[#ff1a1a] mt-1"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveCompany}
                          disabled={savingCompany}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingCompany(false)}
                          className="py-2 px-4 border border-[#2a241c] hover:bg-[#1e1914] font-semibold text-xs rounded-xl cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingCompany(true)}
                      className="w-full py-2.5 border border-[#2a241c] hover:border-[#ff1a1a] hover:text-[#ff1a1a] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Editar Datos de la Tienda
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#6c655c]">No se pudieron obtener datos del local.</p>
            )}
          </div>

          {/* Navigation Menu Tabs */}
          <div className="bg-[#130f0b] border border-[#2a241c] rounded-3xl p-4 space-y-2">
            {[
              { id: "products", label: "Productos", icon: Store },
              { id: "categories", label: "Categorías", icon: FolderOpen },
              { id: "complements", label: "Complementos / Extras", icon: PlusCircle },
              { id: "security", label: "Seguridad / Acceso", icon: KeyRound }
            ].map((tab) => {
              const IconComp = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold tracking-wider uppercase transition-all cursor-pointer",
                    isSelected
                      ? "bg-[#ff1a1a] text-white shadow-[0_0_12px_rgba(255,26,26,0.3)]"
                      : "text-[#a39e97] hover:bg-[#1e1914] hover:text-white"
                  )}
                >
                  <IconComp className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Tab View content */}
        <div className="lg:col-span-2">
          {activeTab === "products" && (
            <ProductTab
              products={products}
              categories={categories}
              token={token}
              loadingData={loadingData}
              onRefresh={fetchData}
            />
          )}

          {activeTab === "categories" && (
            <CategoryTab
              categories={categories}
              token={token}
              loadingData={loadingData}
              onRefresh={fetchData}
            />
          )}

          {activeTab === "complements" && (
            <ComplementTab
              complements={complements}
              categories={categories}
              token={token}
              loadingData={loadingData}
              onRefresh={fetchData}
            />
          )}

          {activeTab === "security" && (
            <SecurityTab
              token={token}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </main>
  );
}
