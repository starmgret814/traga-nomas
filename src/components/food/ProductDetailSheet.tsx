"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Plus, Minus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, hasSuspiciousWords } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Product, Extra } from "@/data/menu";
import { extras as allExtras } from "@/data/menu";

interface ProductDetailSheetProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (product: Product, extras: Extra[], qty: number, note?: string) => void;
  isEditing?: boolean;
  initialExtras?: Extra[];
  initialQty?: number;
  initialNote?: string;
}

export function ProductDetailSheet({
  product,
  open,
  onOpenChange,
  onAddToCart,
  isEditing = false,
  initialExtras = [],
  initialQty = 1,
  initialNote = "",
}: ProductDetailSheetProps) {
  const isMobile = useIsMobile();
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  const showProductWarning = useMemo(() => hasSuspiciousWords(note), [note]);

  const isOpenedRef = useRef(false);

  useEffect(() => {
    if (open) {
      if (!isOpenedRef.current && product) {
        isOpenedRef.current = true;
        if (isEditing) {
          setSelectedExtras(initialExtras.map((e) => e.id));
          setQty(initialQty);
          setNote(initialNote);
        } else {
          setSelectedExtras([]);
          setQty(1);
          setNote("");
        }
      }
    } else {
      isOpenedRef.current = false;
    }
  }, [open, product, isEditing, initialExtras, initialQty, initialNote]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedExtras([]);
      setQty(1);
      setNote("");
    }
    onOpenChange(isOpen);
  };

  const toggleExtra = (extraId: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extraId)
        ? prev.filter((id) => id !== extraId)
        : [...prev, extraId]
    );
  };

  const extrasTotal = useMemo(() => {
    return selectedExtras.reduce((sum, id) => {
      const extra = allExtras.find((e) => e.id === id);
      return sum + (extra?.price ?? 0);
    }, 0);
  }, [selectedExtras]);

  const total = useMemo(() => {
    if (!product) return 0;
    return (product.price + extrasTotal) * qty;
  }, [product, extrasTotal, qty]);

  const handleAddToCart = () => {
    if (!product) return;
    const extras = allExtras.filter((e) => selectedExtras.includes(e.id));
    onAddToCart(product, extras, qty, note);
    handleOpenChange(false);
  };

  if (!product) return null;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "flex flex-col p-0 overflow-hidden",
          isMobile
            ? "rounded-t-[2rem] max-h-[92vh]"
            : "rounded-l-[2rem] sm:max-w-md md:max-w-lg lg:max-w-xl"
        )}
      >
        {isMobile && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 rounded-full bg-[var(--muted)]" />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-8 sm:pt-14 pb-6">
          <SheetHeader className="sr-only">
            <SheetTitle>{product.name}</SheetTitle>
            <SheetDescription>Product details and customization</SheetDescription>
          </SheetHeader>

          <div className="mt-4 rounded-3xl bg-[var(--muted)] p-2 sm:p-4 overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full aspect-[16/10] sm:aspect-[4/3] object-cover rounded-2xl"
            />
          </div>

          <div className="mt-6">
            <h2 className=" font-bold text-2xl text-[var(--foreground)]">
              {product.name}
            </h2>
            <p className="mt-2 text-[var(--muted-foreground)]">
              {product.description}
            </p>
            <p className="mt-3 font-display font-bold text-2xl text-[var(--primary)]">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <div className="mt-6 sm:mt-8">
            <h3 className="font-display font-semibold text-lg text-[var(--foreground)] mb-4">
              Adicionales
            </h3>
            <div className="space-y-2.5 sm:space-y-3">
              {allExtras.map((extra) => {
                const isSelected = selectedExtras.includes(extra.id);
                return (
                  <label
                    key={extra.id}
                    className={cn(
                      "flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl cursor-pointer",
                      "border transition-all duration-200",
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 shadow-[0_0_12px_rgba(211,14,21,0.15)]"
                        : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--muted-foreground)]/40 hover:bg-[var(--secondary)]/40"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleExtra(extra.id)}
                    />
                    <span className="flex-1 font-medium text-[var(--foreground)] text-sm sm:text-base">
                      {extra.name}
                    </span>
                    <span className="text-[var(--muted-foreground)] text-sm sm:text-base">
                      +${extra.price.toFixed(2)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mt-6 sm:mt-8">
            <h3 className="font-display font-semibold text-lg text-[var(--foreground)] mb-3">
              Cantidad
            </h3>
            <div className="inline-flex items-center gap-4 bg-[var(--secondary)] rounded-full px-2 py-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full",
                  "bg-[var(--muted)] text-[var(--foreground)]",
                  "hover:bg-[var(--border)] transition-[background-color,transform] duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "active:scale-95"
                )}
                aria-label="Decrease quantity"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="w-8 text-center font-display font-bold text-xl text-[var(--foreground)]">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full",
                  "gradient-primary text-[var(--primary-foreground)]",
                  "hover:opacity-90 transition-[opacity,transform] duration-200",
                  "active:scale-95"
                )}
                aria-label="Increase quantity"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mt-6 sm:mt-8">
            <h3 className="font-display font-semibold text-lg text-[var(--foreground)] mb-1">
              Indicaciones especiales
            </h3>
            <p className="text-[11px] text-[var(--muted-foreground)] mb-2">
              ⚠️ No escribas adicionales con costo aquí (como queso o tocino extra).
            </p>
            <textarea
              placeholder="Ej. Sin cebolla, cremas aparte, bien cocido... (No escribir adicionales con costo aquí)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)] rounded-2xl p-3 text-sm focus:outline-none focus:border-[var(--primary)] resize-none"
              rows={2}
            />
            {showProductWarning && (
              <p className="mt-1.5 text-xs text-amber-500 font-medium">
                ⚠️ Parece que estás pidiendo un adicional. Recuerda seleccionarlo desde las opciones del producto para que el precio se calcule correctamente.
              </p>
            )}
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)] leading-relaxed">
              Usa este espacio para indicaciones como sin cebolla, poca salsa o cremas aparte. Los adicionales con costo deben seleccionarse desde las opciones del producto.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 px-4 sm:px-6 py-4 bg-[var(--background)] border-t border-[var(--border)] safe-area-pb">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[var(--muted-foreground)]">Total</span>
            <span className="font-display font-bold text-2xl text-[var(--foreground)]">
              ${total.toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            className={cn(
              "w-full py-4 rounded-full font-display font-bold text-lg",
              "gradient-primary text-[var(--primary-foreground)]",
              "shadow-cta hover:opacity-95 transition-all duration-200",
              "active:scale-[0.98]"
            )}
          >
            {isEditing ? "Guardar cambios" : "Agregar al carrito"} · ${total.toFixed(2)}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
