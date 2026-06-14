"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, ShoppingBag, MessageCircle, MapPin, Star, Truck, Clock, ArrowRight, Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/food/ProductCard";
import { ProductDetailSheet } from "@/components/food/ProductDetailSheet";
import { CartSheet } from "@/components/food/CartSheet";
import { useInView } from "@/hooks/use-in-view";
import { products, categories, promos, type Product, type Extra, type Category } from "@/data/menu";

export const Route = createFileRoute("/")({
  component: HomePage,
});

export interface CartLine {
  key: string;
  product: Product;
  extras: Extra[];
  qty: number;
  note?: string;
}

function lineKey(productId: string, extras: Extra[], note?: string): string {
  const notePart = note ? note.trim().toLowerCase() : "";
  return `${productId}::${extras
    .map((e) => e.id)
    .sort()
    .join(",")}::${notePart}`;
}

function HomePage() {
  // Carousel of burger products
  const carouselBurgers = useMemo(() => {
    return products.filter((p) => p.category === "Hamburguesas");
  }, []);

  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setActiveImgIndex((prev) => (prev + 1) % carouselBurgers.length);
  }, [carouselBurgers.length]);

  const prevSlide = useCallback(() => {
    setActiveImgIndex((prev) => (prev - 1 + carouselBurgers.length) % carouselBurgers.length);
  }, [carouselBurgers.length]);

  useEffect(() => {
    const id = setInterval(nextSlide, 5000);
    return () => clearInterval(id);
  }, [nextSlide]);

  const activeBurger = carouselBurgers[activeImgIndex];
  const [activeCat, setActiveCat] = useState<Category>(categories[0]);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingCartKey, setEditingCartKey] = useState<string | null>(null);
  const [generalNote, setGeneralNote] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const isSearching = query.trim() !== "";
    return products.filter((p) => {
      const matchesCat = isSearching || p.category === activeCat;
      const matchesQuery =
        !isSearching || p.name.toLowerCase().includes(query.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [activeCat, query]);

  const groupedProducts = useMemo(() => {
    const isSearching = query.trim() !== "";
    const categoryName = isSearching ? "Resultados de búsqueda" : activeCat;
    return [{ category: categoryName, items: filteredProducts }];
  }, [activeCat, filteredProducts, query]);

  const defaultQtyById = useMemo(() => {
    const map: Record<string, number> = {};
    for (const line of cart) {
      map[line.product.id] = (map[line.product.id] || 0) + line.qty;
    }
    return map;
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, line) => sum + line.qty, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, line) => {
      const extrasTotal = line.extras.reduce((e, ex) => e + ex.price, 0);
      return sum + (line.product.price + extrasTotal) * line.qty;
    }, 0);
  }, [cart]);

  const addLine = useCallback((product: Product, extras: Extra[], qty: number, note?: string) => {
    setCart((prev) => {
      const newKey = lineKey(product.id, extras, note);
      if (editingCartKey) {
        const duplicateIndex = prev.findIndex((l) => l.key === newKey && l.key !== editingCartKey);
        if (duplicateIndex !== -1) {
          return prev
            .map((l, idx) =>
              idx === duplicateIndex
                ? { ...l, qty: l.qty + qty, note: note || l.note }
                : l
            )
            .filter((l) => l.key !== editingCartKey);
        } else {
          return prev.map((l) =>
            l.key === editingCartKey
              ? { ...l, key: newKey, extras, qty, note }
              : l
          );
        }
      } else {
        const existing = prev.find((l) => l.key === newKey);
        if (existing) {
          return prev.map((l) =>
            l.key === newKey ? { ...l, qty: l.qty + qty, note: note || l.note } : l
          );
        }
        return [...prev, { key: newKey, product, extras, qty, note }];
      }
    });
    setEditingCartKey(null);
  }, [editingCartKey]);

  const openEdit = useCallback((line: CartLine) => {
    setEditingCartKey(line.key);
    setSelectedProduct(line.product);
    setDetailOpen(true);
  }, []);

  const quickAdd = useCallback((product: Product) => {
    addLine(product, [], 1);
  }, [addLine]);

  const quickRemove = useCallback((product: Product) => {
    setCart((prev) => {
      const productLines = prev.filter((l) => l.product.id === product.id);
      if (productLines.length === 0) return prev;

      if (productLines.length > 1) {
        setCartOpen(true);
        return prev;
      }

      // Prefer a plain line (no extras, no notes)
      const plainKey = lineKey(product.id, [], "");
      const plainLine = productLines.find((l) => l.key === plainKey);

      let lineToDecrement = plainLine;

      if (!lineToDecrement) {
        // Next preference: line with no extras but has notes
        lineToDecrement = productLines.find((l) => l.extras.length === 0);
      }

      if (!lineToDecrement) {
        // Last preference: the last added line
        lineToDecrement = productLines[productLines.length - 1];
      }

      const targetKey = lineToDecrement.key;
      if (lineToDecrement.qty <= 1) {
        return prev.filter((l) => l.key !== targetKey);
      }
      return prev.map((l) =>
        l.key === targetKey ? { ...l, qty: l.qty - 1 } : l
      );
    });
  }, [setCartOpen]);

  const incrementLine = useCallback((key: string) => {
    setCart((prev) =>
      prev.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l))
    );
  }, []);

  const decrementLine = useCallback((key: string) => {
    setCart((prev) => {
      const line = prev.find((l) => l.key === key);
      if (!line) return prev;
      if (line.qty <= 1) {
        return prev.filter((l) => l.key !== key);
      }
      return prev.map((l) =>
        l.key === key ? { ...l, qty: l.qty - 1 } : l
      );
    });
  }, []);

  const removeLine = useCallback((key: string) => {
    setCart((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const openDetail = (product: Product) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  };

  const featuredProduct = products[0];

  // Rotating "promo of the moment" shown in the hero.
  const [promoIndex, setPromoIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setPromoIndex((i) => (i + 1) % promos.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);
  const activePromo = promos[promoIndex];

  // Scroll to menu section when user starts typing a search query
  useEffect(() => {
    if (query.trim() !== "") {
      const menuSection = document.getElementById("menu");
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [query]);

  // Layered "pull from below" reveal: when the menu scrolls into view the
  // heading rises first with a long, smooth glide, the category nav fades in
  // just after, and the product cards follow with their own per-card stagger.
  const menuReveal = useInView<HTMLDivElement>({ threshold: 0.12, rootMargin: "0px 0px -12% 0px" });

  return (
    <main className="min-h-screen overflow-x-clip flex flex-col">
      {/* Filtros SVG globales para efecto Neón real (cristal y vibración de gas) */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="neon-glow-red" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur1" />
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur2" />
            <feMerge>
              <feMergeNode in="coloredBlur1" />
              <feMergeNode in="coloredBlur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="neon-glow-white" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="coloredBlur1" />
            <feGaussianBlur stdDeviation="2" result="coloredBlur2" />
            <feMerge>
              <feMergeNode in="coloredBlur1" />
              <feMergeNode in="coloredBlur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="neon-wobble" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--background)]/80">
        <div className="relative mx-auto max-w-md md:max-w-3xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] px-4">
          <div className="absolute inset-0 -left-[50vw] -right-[50vw] bg-[var(--background)]/80 backdrop-blur-xl -z-10 hidden lg:block" />

          {/* Row 1: Logo, Search (desktop), Location, Cart */}
          <div className="flex items-center justify-between gap-4 h-14 md:h-auto">
            <a href="#" className="flex items-center" aria-label="Traga Nomas — Muerde sin respeto">
              <img
                src="/logo-traga-nomas.png"
                alt="Traga Nomas — Muerde sin respeto"
                className="h-10 sm:h-12 md:h-20 w-auto"
              />
            </a>

            {/* Desktop Search Bar */}
            <div className="hidden md:block relative w-72 lg:w-[700px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Buscar en el menú..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={cn(
                  "w-full pl-12 pr-4 py-2.5 rounded-full text-left",
                  "bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)]",
                  "placeholder:text-[var(--muted-foreground)]",
                  "focus:outline-none focus:border-[var(--primary)]",
                  "transition-all duration-200"
                )}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-[var(--muted-foreground)]">
                <MapPin className="w-4 h-4 text-[var(--primary)]" />
                <span className="text-sm font-medium">Col. Centro</span>
              </div>
              <button
                onClick={() => setCartOpen(true)}
                aria-label="Ver carrito"
                className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] hover:border-[var(--primary)] transition-colors"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-[10px] sm:text-xs font-bold flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Row 2: Mobile Search Bar */}
          <div className="md:hidden pb-3 pt-1">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Buscar en el menú..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={cn(
                  "w-full pl-11 pr-4 py-2 rounded-full text-left text-xs bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)]",
                  "placeholder:text-[var(--muted-foreground)]",
                  "focus:outline-none focus:border-[var(--primary)]",
                  "transition-all duration-200"
                )}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="hero-bg pb-3 sm:pb-12">
        <div className="mx-auto max-w-md md:max-w-3xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] px-4 md:px-8 lg:px-12">
          {/* Hero */}
          <section className="mt-4 sm:mt-6 flex flex-col lg:flex-row gap-4 lg:gap-12 items-center justify-between max-w-none">
            <div className="flex-1 max-w-xl lg:max-w-2xl flex flex-col items-center md:items-start text-center md:text-left">

              <div className="relative inline-flex items-center gap-1 sm:gap-2 px-2.5 py-1 sm:px-5 sm:py-2 overflow-visible mb-3 sm:mb-5 md:mb-7 bg-[#ff1a1a]/12 backdrop-blur-sm rounded-[5px] sm:rounded-[8px]">
                {/* Mobile Neon Border */}
                <svg className="absolute -inset-[4px] w-[calc(100%+8px)] h-[calc(100%+8px)] pointer-events-none overflow-visible sm:hidden">
                  <g>
                    {/* Brillo rojo exterior grueso */}
                    <rect
                      x="4" y="4"
                      width="calc(100% - 8px)" height="calc(100% - 8px)"
                      rx="5"
                      fill="none"
                      stroke="#ff1a1a"
                      strokeWidth="2.0"
                      filter="url(#neon-glow-red)"
                      opacity="0.85"
                    />
                    {/* Borde interior blanco fino (núcleo de luz) */}
                    <rect
                      x="4" y="4"
                      width="calc(100% - 8px)" height="calc(100% - 8px)"
                      rx="5"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="1.0"
                      opacity="0.95"
                    />
                  </g>
                </svg>

                {/* Desktop Neon Border */}
                <svg className="absolute -inset-[10px] w-[calc(100%+20px)] h-[calc(100%+20px)] pointer-events-none overflow-visible hidden sm:block">
                  <g>
                    {/* Brillo rojo exterior grueso */}
                    <rect
                      x="10" y="10"
                      width="calc(100% - 20px)" height="calc(100% - 20px)"
                      rx="8"
                      fill="none"
                      stroke="#ff1a1a"
                      strokeWidth="3.5"
                      filter="url(#neon-glow-red)"
                      opacity="0.85"
                    />
                    {/* Borde interior blanco fino (núcleo de luz) */}
                    <rect
                      x="10" y="10"
                      width="calc(100% - 20px)" height="calc(100% - 20px)"
                      rx="8"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="1.0"
                      opacity="0.95"
                    />
                  </g>
                </svg>

                <span className="w-1 h-1 sm:w-2 sm:h-2 rounded-full bg-white animate-pulse-dot [filter:drop-shadow(0_0_3px_#ff1a1a)] shadow-[0_0_4px_#ff1a1a] z-10" />
                <span className="text-[8px] sm:text-xs font-semibold tracking-widest uppercase text-white [text-shadow:0_0_2px_#fff,0_0_6px_#ff1a1a] z-10">
                  Abierto ahora · Entrega 30-45 min
                </span>
              </div>

              <h1 className="mt-3 md:mt-4 font-logo leading-[1.0] text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl tracking-tight">
                <span className="block text-[var(--lightforeground)] mb-1.5 sm:mb-2 md:mb-3">Haz que</span>
                <span className="relative inline-block text-[var(--primary)] pb-1.5 sm:pb-2">
                  {"valga"}
                </span>
              </h1>

              <p className="mt-3 md:mt-4 max-w-[280px] md:max-w-md text-[var(--lightforeground)] font-medium text-[11px] sm:text-sm md:text-base lg:text-lg leading-snug md:leading-relaxed opacity-85 md:opacity-90">
                Smash burgers hechas con carne de res 100% fresca, queso americano
                fundido y salsas de la casa. Sin congelados. Sin pretextos.
              </p>

              <div className="mt-5 md:mt-6 flex flex-row md:flex-wrap justify-center md:justify-start items-center gap-3 md:gap-8 w-full md:w-auto max-w-xs md:max-w-none">
                {/* Botón neón ROJO */}
                <button
                  onClick={() => openDetail(featuredProduct)}
                  className={cn(
                    "group relative inline-flex items-center justify-center gap-1.5 px-4 py-1.5 sm:px-7 sm:py-4 rounded-[8px] sm:rounded-[16px] cursor-pointer",
                    "font-display font-bold text-xs sm:text-base tracking-wide uppercase",
                    "overflow-visible",

                    // Fondo totalmente fuera
                    "!bg-transparent hover:!bg-transparent active:!bg-transparent",

                    // Quitar borde/halo negro del componente base
                    "!outline-none !ring-0 !ring-offset-0 focus:!outline-none focus:!ring-0 focus:!ring-offset-0 focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0",

                    // Texto neón (núcleo blanco con brillo rojo)
                    "text-white",
                    "[text-shadow:0_0_2px_#fff,0_0_8px_#ff1a1a,0_0_18px_#ff1a1a,0_0_30px_rgba(255,26,26,0.8)]",

                    // Hover neón para texto
                    "hover:[text-shadow:0_0_3px_#fff,0_0_12px_#ff1a1a,0_0_22px_#ff1a1a,0_0_35px_rgba(255,26,26,0.9)]",

                    "active:scale-[0.98] transition-[transform,text-shadow] duration-200"
                  )}
                >
                  {/* Resplandor rojo ambiente sutil de fondo */}
                  <div className="absolute inset-0 bg-[#ff1a1a]/15 group-hover:bg-[#ff1a1a]/28 blur-xl rounded-[8px] sm:rounded-[16px] pointer-events-none -z-10 transition-[background-color] duration-300" />

                  {/* Mobile Neon Border */}
                  <svg className="absolute -inset-[5px] w-[calc(100%+10px)] h-[calc(100%+10px)] pointer-events-none overflow-visible sm:hidden">
                    <g>
                      <rect
                        x="5" y="5"
                        width="calc(100% - 10px)" height="calc(100% - 10px)"
                        rx="8"
                        fill="none"
                        stroke="#ff1a1a"
                        strokeWidth="2.5"
                        filter="url(#neon-glow-red)"
                        className="opacity-75 group-hover:opacity-100 group-hover:stroke-[#ff4d4d] transition-all duration-200"
                      />
                      <rect
                        x="5" y="5"
                        width="calc(100% - 10px)" height="calc(100% - 10px)"
                        rx="8"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="1.0"
                        className="opacity-80 group-hover:opacity-100 transition-opacity duration-200"
                      />
                    </g>
                  </svg>

                  {/* Desktop Neon Border */}
                  <svg className="absolute -inset-[12px] w-[calc(100%+24px)] h-[calc(100%+24px)] pointer-events-none overflow-visible hidden sm:block">
                    <g>
                      {/* Brillo rojo exterior grueso */}
                      <rect
                        x="12" y="12"
                        width="calc(100% - 24px)" height="calc(100% - 24px)"
                        rx="16"
                        fill="none"
                        stroke="#ff1a1a"
                        strokeWidth="4"
                        filter="url(#neon-glow-red)"
                        className="opacity-75 group-hover:opacity-100 group-hover:stroke-[#ff4d4d] transition-all duration-200"
                      />
                      {/* Borde interior blanco fino (núcleo de luz) */}
                      <rect
                        x="12" y="12"
                        width="calc(100% - 24px)" height="calc(100% - 24px)"
                        rx="16"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="1.0"
                        className="opacity-80 group-hover:opacity-100 transition-opacity duration-200"
                      />
                    </g>
                  </svg>

                  Ordenar ahora
                  <ArrowRight className="w-3 h-3 sm:w-5 h-5 text-white group-hover:translate-x-1 transition-transform [filter:drop-shadow(0_0_1px_#fff)_drop-shadow(0_0_5px_#ff1a1a)_drop-shadow(0_0_12px_#ff1a1a)]" />
                </button>

                {/* Botón neón BLANCO */}
                <a
                  href="#menu"
                  className={cn(
                    "group relative inline-flex items-center justify-center gap-1.5 px-4 py-1.5 sm:px-7 sm:py-4 rounded-[8px] sm:rounded-[16px] cursor-pointer",
                    "font-display font-bold text-xs sm:text-base tracking-wide uppercase",
                    "overflow-visible",

                    // Fondo totalmente fuera
                    "!bg-transparent hover:!bg-transparent active:!bg-transparent",

                    // Quitar borde/halo negro del componente base
                    "!outline-none !ring-0 !ring-offset-0 focus:!outline-none focus:!ring-0 focus:!ring-offset-0",

                    // Texto neón blanco
                    "text-white",
                    "[text-shadow:0_0_8px_rgba(255,255,255,0.45),0_0_18px_rgba(255,255,255,0.18)]",

                    // Hover neón blanco
                    "hover:[text-shadow:0_0_10px_rgba(255,255,255,0.6),0_0_20px_rgba(255,255,255,0.3)]",

                    "active:scale-[0.98] transition-[transform,text-shadow] duration-200"
                  )}
                >
                  {/* Resplandor rojo ambiente sutil de fondo para hacer juego */}
                  <div className="absolute inset-0 bg-[#ff1a1a]/6 group-hover:bg-[#ff1a1a]/12 blur-xl rounded-[8px] sm:rounded-[16px] pointer-events-none -z-10 transition-[background-color] duration-300" />

                  {/* Mobile Neon Border (White) */}
                  <svg className="absolute -inset-[5px] w-[calc(100%+10px)] h-[calc(100%+10px)] pointer-events-none overflow-visible sm:hidden">
                    <g>
                      <rect
                        x="5" y="5"
                        width="calc(100% - 10px)" height="calc(100% - 10px)"
                        rx="8"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2"
                        filter="url(#neon-glow-white)"
                        className="opacity-40 group-hover:opacity-70 transition-opacity duration-200"
                      />
                      <rect
                        x="5" y="5"
                        width="calc(100% - 10px)" height="calc(100% - 10px)"
                        rx="8"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="1.0"
                        className="opacity-60 group-hover:opacity-80 transition-opacity duration-200"
                      />
                    </g>
                  </svg>

                  {/* Desktop Neon Border (White) */}
                  <svg className="absolute -inset-[12px] w-[calc(100%+24px)] h-[calc(100%+24px)] pointer-events-none overflow-visible hidden sm:block">
                    <g>
                      {/* Brillo blanco exterior grueso */}
                      <rect
                        x="12" y="12"
                        width="calc(100% - 24px)" height="calc(100% - 24px)"
                        rx="16"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        filter="url(#neon-glow-white)"
                        className="opacity-40 group-hover:opacity-70 transition-opacity duration-200"
                      />
                      {/* Borde interior blanco fino (núcleo de luz) */}
                      <rect
                        x="12" y="12"
                        width="calc(100% - 24px)" height="calc(100% - 24px)"
                        rx="16"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="1.0"
                        className="opacity-60 group-hover:opacity-80 transition-opacity duration-200"
                      />
                    </g>
                  </svg>

                  Ver menú
                </a>
              </div>

              {/* Stats for Desktop (hidden on mobile) */}
              <div className="hidden md:flex mt-6 md:flex-wrap md:gap-6 border-t border-[var(--border)] pt-6">
                {[
                  { icon: Star, title: "4.9 / 5", sub: "+2,400 reseñas" },
                  { icon: Truck, title: "Envío $35", sub: "En toda la zona" },
                  { icon: Clock, title: "30-45 min", sub: "Entrega estimada" },
                ].map((stat) => (
                  <div key={stat.title} className="flex items-center gap-2">
                    <stat.icon className="w-6 h-6 flex-shrink-0 text-white [filter:drop-shadow(0_0_1px_#fff)_drop-shadow(0_0_5px_#ff1a1a)_drop-shadow(0_0_12px_#ff1a1a)]" />
                    <div className="leading-tight min-w-0">
                      <p className="font-display font-bold text-sm sm:text-base text-white">
                        {stat.title}
                      </p>
                      <p className="text-[11px] sm:text-xs text-white/80 font-medium truncate">
                        {stat.sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. La segunda columna - Carrusel de Hamburguesas */}
            <div className="flex-1 w-full lg:max-w-2xl flex flex-col items-center justify-center relative min-h-[260px] md:min-h-[350px] lg:min-h-[450px] mt-[30px] md:mt-8 lg:mt-0 lg:-translate-x-8 xl:-translate-x-16 2xl:-translate-x-24 lg:scale-105 xl:scale-115 2xl:scale-120 transition-all duration-300">
              {/* Contenedor del Carrusel con la composición predefinida */}
              <div className="hero-composition w-full relative">
                {/* Hamburguesas del carrusel */}
                {carouselBurgers.map((burger, idx) => (
                  <img
                    key={burger.id}
                    src={burger.image}
                    alt={burger.name}
                    className={cn(
                      "layer-foreground transition-all duration-750 ease-in-out cursor-pointer !bottom-[4%] md:!bottom-[-4%] !w-[100%] !max-h-[90%]",
                      idx === activeImgIndex
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-90 pointer-events-none"
                    )}
                    onClick={() => openDetail(burger)}
                  />
                ))}

                {/* Flecha Izquierda */}
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-[45%] -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-[#ff1a1a]/60 bg-black/60 hover:bg-[#ff1a1a]/20 flex items-center justify-center text-white transition-all duration-300 shadow-[0_0_15px_rgba(255,26,26,0.3)] active:scale-95"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>

                {/* Flecha Derecha */}
                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-[45%] -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-[#ff1a1a]/60 bg-black/60 hover:bg-[#ff1a1a]/20 flex items-center justify-center text-white transition-all duration-300 shadow-[0_0_15px_rgba(255,26,26,0.3)] active:scale-95"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>

                {/* Tarjeta de Información (Abajo a la izquierda, estilo glassmorphic del mockup) */}
                {activeBurger && (
                  <div
                    onClick={() => openDetail(activeBurger)}
                    className="hidden md:block absolute bottom-[-10%] left-[-16%] z-20 max-w-[200px] sm:max-w-[240px] p-3 bg-black/15 backdrop-blur-md border border-[#2a241c] hover:border-[var(--primary)] rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.9)] text-left animate-fade-in cursor-pointer transition-colors duration-300"
                  >
                    <h4 className="font-display font-bold text-base sm:text-lg text-[var(--lightforeground)] tracking-wide uppercase leading-tight">
                      {activeBurger.name}
                    </h4>
                    <p className="mt-1 text-[10px] sm:text-[11px] text-[var(--muted-foreground)] leading-relaxed line-clamp-3">
                      {activeBurger.description}
                    </p>
                    <p className="mt-2 font-display font-extrabold text-lg sm:text-xl text-[var(--primary)] leading-none">
                      ${activeBurger.price}
                    </p>
                  </div>
                )}
              </div>

              {/* Controles del Carrusel (Puntos) */}
              <div className="flex items-center gap-2 mt-4 z-10">
                {carouselBurgers.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIndex(idx)}
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-all duration-300",
                      idx === activeImgIndex
                        ? "bg-[var(--primary)] w-6"
                        : "bg-[#2a241c] hover:bg-[var(--muted-foreground)]"
                    )}
                    aria-label={`Ver imagen ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Stats for Mobile (hidden on desktop, placed below the carousel) */}
            <div className="md:hidden mt-4 grid grid-cols-3 gap-1 w-full max-w-sm">
              {[
                { icon: Star, title: "4.9 / 5", sub: "+2,400 reseñas" },
                { icon: Truck, title: "Envío $35", sub: "En toda la zona" },
                { icon: Clock, title: "30-45 min", sub: "Entrega estimada" },
              ].map((stat) => (
                <div key={stat.title} className="flex items-center justify-center gap-1.5">
                  <stat.icon className="w-5 h-5 flex-shrink-0 text-white [filter:drop-shadow(0_0_1px_#fff)_drop-shadow(0_0_5px_#ff1a1a)_drop-shadow(0_0_12px_#ff1a1a)]" />
                  <div className="leading-tight min-w-0 text-left">
                    <p className="font-display font-bold text-xs text-white">
                      {stat.title}
                    </p>
                    <p className="text-[10px] text-white/80 font-medium truncate">
                      {stat.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className={cn(cartItemCount > 0 ? "pb-32" : "pb-8")}>
        {/* Promo Ticker — full bleed */}
        <div className="mt-0 sm:mt-6 overflow-hidden bg-[var(--primary)] py-2.5 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <div className="flex w-max animate-marquee whitespace-nowrap">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
                {[
                  "Martes 2x1 en clásicas",
                  "Envío gratis en pedidos +$250",
                  "Abierto hasta las 11pm",
                ].map((promo) => (
                  <span
                    key={promo}
                    className="flex items-center font-display font-bold text-sm tracking-widest uppercase text-[var(--primary-foreground)]"
                  >
                    {promo}
                    <span className="mx-6 opacity-60">•</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-md md:max-w-3xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] px-4 md:px-8 lg:px-12">
          {/* Menu Section — layers in from below: heading first, then nav, then cards */}
          <div ref={menuReveal.ref} id="menu" className="mt-4 sm:mt-16 scroll-mt-24">
            {/* Menu Heading (layer 1) */}
            <div
              className={cn(
                "reveal-pull flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between",
                menuReveal.inView && "is-visible"
              )}
            >
              <div>
                <p className="font-display font-bold text-sm tracking-[0.25em] uppercase text-[var(--accent)]">
                  Lo que tenemos
                </p>
                <h2 className="font-logo tracking-logo mt-6 font-extrabold text-5xl md:text-6xl text-[var(--lightforeground)] leading-[1.15] py-2">
                  Nuestro menu
                </h2>
              </div>
            </div>

            {/* Category Nav (layer 2 — opacity-only so sticky keeps working) */}
            <nav
              style={{ "--reveal-delay": "180ms" } as React.CSSProperties}
              className={cn(
                "reveal-fade sticky top-[104px] md:top-[80px] z-30 py-4 backdrop-blur-xl bg-[var(--background)]/80 -mx-4 px-4",
                menuReveal.inView && "is-visible"
              )}
            >
              <div className="absolute inset-0 -left-[50vw] -right-[50vw] bg-[var(--background)]/80 backdrop-blur-xl -z-10 hidden lg:block" />

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCat(cat)}
                    className={cn(
                      "flex-shrink-0 px-5 py-2.5 rounded-full font-display font-bold text-sm tracking-widest uppercase transition-all duration-200",
                      activeCat === cat
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-cta scale-105"
                        : "bg-[var(--secondary)] text-[var(--muted-foreground)] border border-[var(--border)] hover:text-[var(--foreground)] hover:border-[var(--primary)]/60"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </nav>

            {/* Product Grid */}
            <div key={activeCat} className="mt-4 space-y-8">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-[var(--border)] rounded-[2rem] bg-[var(--secondary)]/15 animate-fade-in min-h-[55vh]">
                  <Search className="w-12 h-12 text-[var(--primary)] mb-4 animate-bounce-soft" />
                  <h3 className="font-display font-black text-2xl text-[var(--lightforeground)] uppercase tracking-wider">
                    No hay resultados para tu búsqueda
                  </h3>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)] max-w-sm mx-auto font-medium">
                    No encontramos platos en esta categoría que coincidan con tu búsqueda. Probá buscando en otra categoría o con otro nombre.
                  </p>
                </div>
              ) : (
                groupedProducts.map((group, groupIdx) => (
                  <section key={group.category}>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="h-6 w-1.5 rounded-full bg-[var(--primary)]" />
                      <h2 className="font-display font-extrabold text-base tracking-wide uppercase text-[var(--foreground)]">
                        {group.category}
                      </h2>
                      <span className="text-sm font-medium text-[var(--muted-foreground)]">
                        {group.items.length} platos
                      </span>
                    </div>
                    <div className="font-montserrat font-medium grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                      {group.items.map((product, idx) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          qty={defaultQtyById[product.id] || 0}
                          onOpen={() => openDetail(product)}
                          onQuickAdd={() => openDetail(product)}
                          onQuickRemove={() => quickRemove(product)}
                          revealDelay={(idx % 4) * 90}
                        />
                      ))}
                    </div>
                  </section>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-50 md:hidden safe-area-pb">
          <div className="mx-4 mb-4">
            <button
              onClick={() => setCartOpen(true)}
              className={cn(
                "w-full py-4 px-6 rounded-full",
                "gradient-primary text-[var(--primary-foreground)]",
                "shadow-cta flex items-center justify-between",
                "active:scale-[0.98] transition-transform"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag className="w-6 h-6" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[var(--background)] text-[var(--primary)] text-xs font-bold flex items-center justify-center">
                    {cartItemCount}
                  </span>
                </div>
                <span className="font-display font-bold">Pedir por WhatsApp</span>
              </div>
              <span className="font-display font-bold text-lg">
                ${cartTotal.toFixed(2)}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Floating Cart */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 hidden md:block">
          <button
            onClick={() => setCartOpen(true)}
            className={cn(
              "flex items-center gap-4 px-6 py-3 rounded-full",
              "bg-[var(--foreground)] text-[var(--background)]",
              "shadow-float hover:shadow-cta transition-all duration-300"
            )}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full gradient-primary text-[var(--primary-foreground)] text-xs font-bold flex items-center justify-center animate-bounce-soft">
                {cartItemCount}
              </span>
            </div>
            <span className="font-display font-semibold">Ver pedido</span>
            <span className="font-display font-bold">${cartTotal.toFixed(2)}</span>
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Product Detail Sheet */}
      <ProductDetailSheet
        product={selectedProduct}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setEditingCartKey(null);
        }}
        onAddToCart={addLine}
        isEditing={!!editingCartKey}
        initialExtras={editingCartKey ? cart.find((l) => l.key === editingCartKey)?.extras : []}
        initialQty={editingCartKey ? cart.find((l) => l.key === editingCartKey)?.qty : 1}
        initialNote={editingCartKey ? cart.find((l) => l.key === editingCartKey)?.note : ""}
      />

      {/* Global Cart Sheet */}
      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        lines={cart}
        onIncrement={incrementLine}
        onDecrement={decrementLine}
        onRemove={removeLine}
        onEdit={openEdit}
        generalNote={generalNote}
        onGeneralNoteChange={setGeneralNote}
      />
    </main>
  );
}





















