"use client";

import { useMemo } from "react";
import { ShoppingBag, Plus, Minus, MessageCircle, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { CartLine } from "@/routes/index";

interface CartSheetProps {
  lines: CartLine[];
  onIncrement: (key: string) => void;
  onDecrement: (key: string) => void;
  onRemove: (key: string) => void;
  children?: React.ReactNode;
}

export function CartSheet({
  lines,
  onIncrement,
  onDecrement,
  onRemove,
  children,
}: CartSheetProps) {
  const isMobile = useIsMobile();
  const total = useMemo(() => {
    return lines.reduce((sum, line) => {
      const extrasTotal = line.extras.reduce((e, ex) => e + ex.price, 0);
      return sum + (line.product.price + extrasTotal) * line.qty;
    }, 0);
  }, [lines]);

  const handleOrder = () => {
    const message = lines
      .map((line) => {
        const extrasStr =
          line.extras.length > 0
            ? ` (${line.extras.map((e) => e.name).join(", ")})`
            : "";
        const lineTotal =
          (line.product.price +
            line.extras.reduce((s, e) => s + e.price, 0)) *
          line.qty;
        return `${line.qty}x ${line.product.name}${extrasStr} - $${lineTotal.toFixed(2)}`;
      })
      .join("\n");

    const fullMessage = `¡Hola! Quiero hacer un pedido:\n\n${message}\n\nTotal: $${total.toFixed(2)}`;
    const encoded = encodeURIComponent(fullMessage);
    window.open(`https://wa.me/15551234567?text=${encoded}`, "_blank");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "flex flex-col p-0",
          isMobile
            ? "rounded-t-[2rem] max-h-[90vh]"
            : "rounded-l-[2rem] sm:max-w-md md:max-w-lg"
        )}
      >
        {isMobile && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 rounded-full bg-[var(--muted)]" />
          </div>
        )}
        <SheetHeader className="px-6 pt-4 pb-4 border-b border-[var(--border)]">
          <SheetTitle className="font-display font-bold text-xl text-[var(--foreground)] flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[var(--primary)]" />
            Tu pedido
          </SheetTitle>
          <SheetDescription className="text-[var(--muted-foreground)]">
            {lines.length === 0
              ? "Tu carrito está vacío"
              : `${lines.reduce((s, l) => s + l.qty, 0)} platos en tu carrito`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 rounded-full bg-[var(--muted)] flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-[var(--muted-foreground)]" />
              </div>
              <p className="text-[var(--muted-foreground)]">
                ¡Agregá algo rico para empezar!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {lines.map((line) => {
                const extrasTotal = line.extras.reduce((s, e) => s + e.price, 0);
                const lineTotal = (line.product.price + extrasTotal) * line.qty;

                return (
                  <div
                    key={line.key}
                    className="flex gap-4 p-3 bg-[var(--card)] rounded-2xl shadow-soft"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-[var(--muted)] flex-shrink-0">
                      <img
                        src={line.product.image}
                        alt={line.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-[var(--foreground)] text-sm line-clamp-1">
                          {line.product.name}
                        </h4>
                        <button
                          onClick={() => onRemove(line.key)}
                          className="p-1 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
                          aria-label={`Remove ${line.product.name}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {line.extras.length > 0 && (
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                          {line.extras.map((e) => e.name).join(", ")}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-[var(--secondary)] rounded-full px-1 py-1">
                          <button
                            onClick={() => onDecrement(line.key)}
                            className={cn(
                              "flex items-center justify-center w-7 h-7 rounded-full",
                              "bg-[var(--muted)] text-[var(--foreground)]",
                              "hover:bg-[var(--border)] transition-colors",
                              "active:scale-95"
                            )}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-5 text-center font-semibold text-sm text-[var(--foreground)]">
                            {line.qty}
                          </span>
                          <button
                            onClick={() => onIncrement(line.key)}
                            className={cn(
                              "flex items-center justify-center w-7 h-7 rounded-full",
                              "gradient-primary text-[var(--primary-foreground)]",
                              "hover:opacity-90 transition-opacity",
                              "active:scale-95"
                            )}
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="font-display font-bold text-[var(--primary)]">
                          ${lineTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {lines.length > 0 && (
          <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--background)] safe-area-pb">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[var(--muted-foreground)]">Total</span>
              <span className="font-display font-bold text-2xl text-[var(--foreground)]">
                ${total.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleOrder}
              className={cn(
                "w-full py-4 rounded-full font-display font-bold text-lg",
                "bg-[var(--primary)] text-[var(--primary-foreground)]",
                "shadow-cta hover:opacity-95 transition-all duration-200",
                "active:scale-[0.98] flex items-center justify-center gap-2"
              )}
            >
              <MessageCircle className="w-5 h-5" />
              Pedir por WhatsApp
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
