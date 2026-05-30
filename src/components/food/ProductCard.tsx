import { memo } from "react";
import { Plus, Minus, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";
import type { Product } from "@/data/menu";

interface ProductCardProps {
  product: Product;
  qty: number;
  onOpen: () => void;
  onQuickAdd: () => void;
  onQuickRemove: () => void;
  /** Stagger delay (ms) for the scroll-reveal animation. */
  revealDelay?: number;
}

export const ProductCard = memo(function ProductCard({
  product,
  qty,
  onOpen,
  onQuickAdd,
  onQuickRemove,
  revealDelay = 0,
}: ProductCardProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      onClick={onOpen}
      style={{ "--reveal-delay": `${revealDelay}ms` } as React.CSSProperties}
      className={cn(
        "reveal-card group relative flex flex-col overflow-hidden cursor-pointer",
        "bg-[var(--card)] rounded-3xl border border-[var(--border)]",
        "shadow-card hover:border-[var(--primary)]/60 hover:shadow-float hover:-translate-y-1",
        inView && "is-visible"
      )}
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-black">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-transparent to-transparent" />

        {product.badge && (
          <span
            className={cn(
              "absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full",
              "font-display font-bold text-[11px] tracking-widest uppercase",
              product.badge === "POPULAR" &&
              "bg-[var(--secondary)]/90 text-[var(--foreground)] backdrop-blur-sm",
              product.badge === "TOP" &&
              "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-cta",
              product.badge === "NUEVO" &&
              "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-cta",
              product.badge === "SIGNATURE" &&
              "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-cta"
            )}
          >
            {product.badge === "POPULAR" && (
              <Flame className="w-3 h-3 text-[var(--primary)]" />
            )}
            {product.badge === "POPULAR" ? "Popular" : product.badge}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 pt-3">
        <h3 className="font-logo font-bold text-2xl tracking-wide uppercase text-[var(--card-foreground)] leading-tight">
          {product.name}
        </h3>
        <p className="mt-1.5 text-sm text-[var(--muted-foreground)] leading-relaxed line-clamp-2 flex-1">
          {product.description}
        </p>

        <div className="mt-4 flex items-end justify-between gap-2">
          <p className="font-display font-extrabold text-2xl text-[var(--primary)] leading-none">
            ${product.price}
            <span className="ml-1 text-xs font-semibold text-[var(--muted-foreground)] align-baseline">
              USD
            </span>
          </p>

          <div onClick={(e) => e.stopPropagation()}>
            {qty === 0 ? (
              <button
                onClick={onQuickAdd}
                className={cn(
                  "flex items-center justify-center w-11 h-11 rounded-full",
                  "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-cta",
                  "hover:opacity-90 active:scale-95 transition-all duration-200"
                )}
                aria-label={`Agregar ${product.name} al carrito`}
              >
                <Plus className="w-5 h-5" />
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-[var(--secondary)] rounded-full p-1 animate-scale-in">
                <button
                  onClick={onQuickRemove}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full",
                    "bg-[var(--muted)] text-[var(--foreground)]",
                    "hover:bg-[var(--border)] active:scale-95 transition-[background-color,transform] duration-200"
                  )}
                  aria-label={`Quitar un ${product.name}`}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center font-display font-bold text-[var(--foreground)]">
                  {qty}
                </span>
                <button
                  onClick={onQuickAdd}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full",
                    "bg-[var(--primary)] text-[var(--primary-foreground)]",
                    "hover:opacity-90 active:scale-95 transition-[opacity,transform] duration-200"
                  )}
                  aria-label={`Agregar otro ${product.name}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
