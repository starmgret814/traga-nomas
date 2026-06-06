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
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--background)]/80 border-b border-[var(--border)]/50">
        <div className="relative mx-auto max-w-md md:max-w-3xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] px-4 py-4">
          <div className="absolute inset-0 -left-[50vw] -right-[50vw] bg-[var(--background)]/80 backdrop-blur-xl -z-10 hidden lg:block" />

          <div className="flex items-center justify-between gap-4">
            <a href="#" className="flex items-center" aria-label="Traga Nomas — Muerde sin respeto">
              <img
                src="/logo-traga-nomas.png"
                alt="Traga Nomas — Muerde sin respeto"
                className="h-24 md:h-20 w-auto"
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
          <section className="mt-6 grid lg:grid-cols-2 gap-8 lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--secondary)]">
                <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse-dot" />
                <span className="text-[10px] sm:text-xs font-medium tracking-widest uppercase text-[var(--muted-foreground)]">
                  Abierto ahora · Entrega 30-45 min
                </span>
              </div>

              <h1 className="mt-4 font-logo font-display font-extrabold leading-[0.85] text-[clamp(3.25rem,16vw,4.5rem)] md:text-7xl lg:text-9xl tracking-tight">
                <span className="block text-[var(--lightforeground)]">Haz que</span>
                <span className="block text-[var(--primary)]">valga</span>
              </h1>

              <p className="mt-4 max-w-md text-[var(--muted-foreground)] text-base md:text-lg leading-relaxed">
                Smash burgers hechas con carne de res 100% fresca, queso americano
                fundido y salsas de la casa. Sin congelados. Sin pretextos.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
                <button
                  onClick={() => openDetail(featuredProduct)}
                  className={cn(
                    "group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full",
                    "font-display font-bold text-base tracking-wide uppercase",
                    "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-cta",
                    "hover:opacity-95 active:scale-[0.98] transition-all duration-200"
                  )}
                >
                  Ordenar ahora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="#menu"
                  className={cn(
                    "inline-flex items-center justify-center px-7 py-4 rounded-full",
                    "font-display font-bold text-base tracking-wide uppercase",
                    "bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)]",
                    "hover:border-[var(--primary)] active:scale-[0.98] transition-all duration-200"
                  )}
                >
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
                    <stat.icon className="w-5 h-5 flex-shrink-0 text-[var(--primary)]" />
                    <div className="leading-tight min-w-0">
                      <p className="font-display font-bold text-sm sm:text-base text-[var(--foreground)]">
                        {stat.title}
                      </p>
                      <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] truncate">
                        {stat.sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo of the moment */}
            <a
              href="#menu"
              className="order-1 lg:order-2 relative aspect-[3/2] w-full overflow-hidden rounded-3xl group block lg:translate-y-[100px] lg:-translate-x-[208px]"
              aria-label={`Promoción: ${activePromo.title}`}
            >
              {promos.map((promo, i) => (
                <img
                  key={promo.id}
                  src={promo.image || "/placeholder.svg"}
                  alt={promo.title}
                  aria-hidden={i !== promoIndex}
                  className={cn(
                    "absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out",
                    i === promoIndex ? "opacity-100" : "opacity-0"
                  )}
                />
              ))}

              {/* Dark gradient for text legibility */}
              <div className="absolute inset-0 from-black/90 via-black/30 to-black/10" />

              <div key={activePromo.id} className="absolute inset-x-0 bottom-0 p-6 animate-fade-in">
                <p className="font-display font-bold text-sm tracking-widest uppercase text-[var(--primary-glow)]">
                  {activePromo.tag}
                </p>
                <h3 className="mt-1 font-display font-extrabold text-3xl md:text-4xl tracking-tight text-[var(--foreground)] leading-none">
                  {activePromo.title}
                </h3>
                <p className="mt-2 max-w-sm text-sm text-[var(--foreground)]/80 leading-relaxed">
                  {activePromo.description}
                </p>

                {/* Progress dots */}
                <div className="mt-4 flex items-center gap-1.5">
                  {promos.map((promo, i) => (
                    <button
                      key={promo.id}
                      onClick={(e) => {
                        e.preventDefault();
                        setPromoIndex(i);
                      }}
                      aria-label={`Ver promo ${i + 1}`}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        i === promoIndex
                          ? "w-8 bg-[var(--primary)]"
                          : "w-1.5 bg-[var(--foreground)]/40 hover:bg-[var(--foreground)]/70"
                      )}
                    />
                  ))}
                </div>
              </div>
            </a>
          </section>
        </div>
      </div>

      <div className="pb-32 md:pb-8">
        <div className="mx-auto max-w-md md:max-w-3xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] px-4 md:px-8 lg:px-12">
          {/* Promo Ticker */}
          <div className="mt-6 -mx-4 overflow-hidden bg-[var(--primary)] py-2.5">
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
                <h2 className="font-logo mt-6 font-extrabold text-5xl md:text-6xl tracking-tight text-[var(--lightforeground)] leading-[0.85]">
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
                  <div className="font-montserrat font-medium grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
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
