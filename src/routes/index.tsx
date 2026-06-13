"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, ShoppingBag, MessageCircle, MapPin, Star, Truck, Clock, ArrowRight, Flame } from "lucide-react";
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
}

function lineKey(productId: string, extras: Extra[]): string {
  return `${productId}::${extras
    .map((e) => e.id)
    .sort()
    .join(",")}`;
}

function HomePage() {
  const [activeCat, setActiveCat] = useState<Category>(categories[0]);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = p.category === activeCat;
      const matchesQuery =
        query === "" || p.name.toLowerCase().includes(query.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [activeCat, query]);

  const groupedProducts = useMemo(() => {
    return [{ category: activeCat, items: filteredProducts }];
  }, [activeCat, filteredProducts]);

  const defaultQtyById = useMemo(() => {
    const map: Record<string, number> = {};
    for (const line of cart) {
      if (line.extras.length === 0) {
        map[line.product.id] = (map[line.product.id] || 0) + line.qty;
      }
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

  const addLine = useCallback((product: Product, extras: Extra[], qty: number) => {
    setCart((prev) => {
      const key = lineKey(product.id, extras);
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) =>
          l.key === key ? { ...l, qty: l.qty + qty } : l
        );
      }
      return [...prev, { key, product, extras, qty }];
    });
  }, []);

  const quickAdd = useCallback((product: Product) => {
    addLine(product, [], 1);
  }, [addLine]);

  const quickRemove = useCallback((product: Product) => {
    setCart((prev) => {
      const key = lineKey(product.id, []);
      const existing = prev.find((l) => l.key === key);
      if (!existing) return prev;
      if (existing.qty <= 1) {
        return prev.filter((l) => l.key !== key);
      }
      return prev.map((l) =>
        l.key === key ? { ...l, qty: l.qty - 1 } : l
      );
    });
  }, []);

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

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--background)]/80">
        <div className="relative mx-auto max-w-md md:max-w-3xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] px-4 py-4">
          <div className="absolute inset-0 -left-[50vw] -right-[50vw] bg-[var(--background)]/80 backdrop-blur-xl -z-10 hidden lg:block" />

          <div className="flex items-center justify-between gap-4">
            <a href="#" className="flex items-center" aria-label="Traga Nomas — Muerde sin respeto">
              <img
                src="/logo-traga-nomas.png"
                alt="Traga Nomas — Muerde sin respeto"
                className="h-28 md:h-20 w-auto"
              />
            </a>

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
              <CartSheet
                lines={cart}
                onIncrement={incrementLine}
                onDecrement={decrementLine}
                onRemove={removeLine}
              >
                <button
                  aria-label="Ver carrito"
                  className="relative w-11 h-11 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] hover:border-[var(--primary)] transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-bold flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </CartSheet>
            </div>
          </div>
        </div>
      </header>

      <div className="hero-bg pb-12">
        <div className="mx-auto max-w-md md:max-w-3xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] px-4 md:px-8 lg:px-12">
          {/* Hero */}
          <section className="mt-6 max-w-4xl">
            <div>
              <div className="relative inline-flex items-center gap-2 px-5 py-2 overflow-visible mb-5 md:mb-7 bg-[#ff1a1a]/12 backdrop-blur-sm rounded-[8px]">
                {/* Borde neón real con SVG y filtros */}
                <svg className="absolute -inset-[10px] w-[calc(100%+20px)] h-[calc(100%+20px)] pointer-events-none overflow-visible">
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

                <span className="w-2 h-2 rounded-full bg-white animate-pulse-dot [filter:drop-shadow(0_0_3px_#ff1a1a)] shadow-[0_0_4px_#ff1a1a] z-10" />
                <span className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-white [text-shadow:0_0_2px_#fff,0_0_6px_#ff1a1a] z-10">
                  Abierto ahora · Entrega 30-45 min
                </span>
              </div>

              <h1 className="mt-4 font-logo leading-[1.0] text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl tracking-tight">
                <span className="block text-[var(--lightforeground)] mb-2 md:mb-3">Haz que</span>
                <span className="relative inline-block text-[var(--primary)] pb-2">
                  {"valga"}
                </span>
              </h1>

              <p className="mt-4 max-w-md text-[var(--lightforeground)] font-medium text-base md:text-lg leading-relaxed opacity-90">
                Smash burgers hechas con carne de res 100% fresca, queso americano
                fundido y salsas de la casa. Sin congelados. Sin pretextos.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-4 sm:gap-8">
                {/* Botón neón ROJO */}
                <button
                  onClick={() => openDetail(featuredProduct)}
                  className={cn(
                    "group relative inline-flex items-center justify-center gap-2 px-7 py-4 rounded-[16px] cursor-pointer",
                    "font-display font-bold text-base tracking-wide uppercase",
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
                  <div className="absolute inset-0 bg-[#ff1a1a]/15 group-hover:bg-[#ff1a1a]/28 blur-xl rounded-[16px] pointer-events-none -z-10 transition-[background-color] duration-300" />

                  {/* Borde neón real con SVG y filtros de vibración/cristal */}
                  <svg className="absolute -inset-[12px] w-[calc(100%+24px)] h-[calc(100%+24px)] pointer-events-none overflow-visible">
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
                  <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform [filter:drop-shadow(0_0_1px_#fff)_drop-shadow(0_0_5px_#ff1a1a)_drop-shadow(0_0_12px_#ff1a1a)]" />
                </button>

                {/* Botón neón BLANCO */}
                <a
                  href="#menu"
                  className={cn(
                    "group relative inline-flex items-center justify-center gap-2 px-7 py-4 rounded-[16px] cursor-pointer",
                    "font-display font-bold text-base tracking-wide uppercase",
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
                  <div className="absolute inset-0 bg-[#ff1a1a]/6 group-hover:bg-[#ff1a1a]/12 blur-xl rounded-[16px] pointer-events-none -z-10 transition-[background-color] duration-300" />

                  {/* Borde neón real con SVG y filtros (Blanco) */}
                  <svg className="absolute -inset-[12px] w-[calc(100%+24px)] h-[calc(100%+24px)] pointer-events-none overflow-visible">
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

              <div className="mt-6 grid grid-cols-3 gap-3 sm:flex sm:flex-wrap sm:gap-6 border-t border-[var(--border)] pt-6">
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
          </section>
        </div>
      </div>

      <div className="pb-32 md:pb-8">
        {/* Promo Ticker — full bleed */}
        <div className="mt-6 overflow-hidden bg-[var(--primary)] py-2.5 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
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
          <div ref={menuReveal.ref} id="menu" className="mt-16 scroll-mt-24">
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
                <h2 className="font-logo mt-6 font-extrabold text-5xl md:text-6xl tracking-tight text-[var(--lightforeground)] leading-[1.15] py-2">
                  Nuestro menu
                </h2>
              </div>
            </div>

            {/* Category Nav (layer 2 — opacity-only so sticky keeps working) */}
            <nav
              style={{ "--reveal-delay": "180ms" } as React.CSSProperties}
              className={cn(
                "reveal-fade sticky top-[72px] z-30 py-4 backdrop-blur-xl bg-[var(--background)]/80 -mx-4 px-4",
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
              {groupedProducts.map((group, groupIdx) => (
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
                        onQuickAdd={() => quickAdd(product)}
                        onQuickRemove={() => quickRemove(product)}
                        revealDelay={(idx % 4) * 90}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-50 md:hidden safe-area-pb">
          <div className="mx-4 mb-4">
            <CartSheet
              lines={cart}
              onIncrement={incrementLine}
              onDecrement={decrementLine}
              onRemove={removeLine}
            >
              <button
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
            </CartSheet>
          </div>
        </div>
      )}

      {/* Desktop Floating Cart */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 hidden md:block">
          <CartSheet
            lines={cart}
            onIncrement={incrementLine}
            onDecrement={decrementLine}
            onRemove={removeLine}
          >
            <button
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
          </CartSheet>
        </div>
      )}

      {/* Product Detail Sheet */}
      <ProductDetailSheet
        product={selectedProduct}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onAddToCart={addLine}
      />
    </main>
  );
}





















