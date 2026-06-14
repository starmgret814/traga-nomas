"use client";

import { useState, useMemo } from "react";
import { ShoppingBag, Plus, Minus, MessageCircle, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn, hasSuspiciousWords, wrapText } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { CartLine } from "@/routes/index";

interface CartSheetProps {
  lines: CartLine[];
  onIncrement: (key: string) => void;
  onDecrement: (key: string) => void;
  onRemove: (key: string) => void;
  onEdit?: (line: CartLine) => void;
  generalNote: string;
  onGeneralNoteChange: (note: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function CartSheet({
  lines,
  onIncrement,
  onDecrement,
  onRemove,
  onEdit,
  generalNote,
  onGeneralNoteChange,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  children,
}: CartSheetProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : localOpen;
  const onOpenChange = isControlled ? controlledOnOpenChange : setLocalOpen;

  const isMobile = useIsMobile();
  const total = useMemo(() => {
    return lines.reduce((sum, line) => {
      const extrasTotal = line.extras.reduce((e, ex) => e + ex.price, 0);
      return sum + (line.product.price + extrasTotal) * line.qty;
    }, 0);
  }, [lines]);

  const showGeneralWarning = useMemo(() => hasSuspiciousWords(generalNote), [generalNote]);

  const handleOrder = () => {
    const productsList = lines
      .map((line, index) => {
        const itemNumber = String(index + 1).padStart(2, "0");
        const extrasTotal = line.extras.reduce((s, e) => s + e.price, 0);
        const lineTotal = (line.product.price + extrasTotal) * line.qty;

        // Wrap the product name to 24 characters (to fit within 28 chars with "01. " prefix)
        const wrappedName = wrapText(line.product.name, 24);
        const nameLines = wrappedName.split("\n");
        let productStr = `${itemNumber}. ${nameLines[0]}\n`;
        for (let i = 1; i < nameLines.length; i++) {
          productStr += `   ${nameLines[i]}\n`;
        }

        productStr += `   Cantidad: ${line.qty}\n`;

        if (line.extras.length > 0) {
          productStr += `   Adicionales:\n`;
          line.extras.forEach((extra) => {
            // Wrap the extra name to 23 characters (to fit within 28 chars with "   • " prefix)
            const wrappedExtra = wrapText(extra.name, 23);
            const extraLines = wrappedExtra.split("\n");
            productStr += `   • ${extraLines[0]}\n`;
            for (let i = 1; i < extraLines.length; i++) {
              productStr += `     ${extraLines[i]}\n`;
            }
          });
        }

        productStr += `   Subtotal: $${lineTotal.toFixed(2)}\n`;

        // Wrap the product note to 18 characters (to fit within 28 chars with "   _Nota: " and "_" wrapping)
        const noteText = line.note?.trim() ? line.note.trim() : "Sin indicaciones.";
        const wrappedNote = wrapText(noteText, 18);
        const noteLines = wrappedNote.split("\n");
        productStr += `   _Nota: ${noteLines[0]}_`;
        for (let i = 1; i < noteLines.length; i++) {
          productStr += `\n   _${noteLines[i]}_`;
        }

        return productStr;
      })
      .join("\n\n");

    const generalNoteText = generalNote.trim() ? generalNote.trim() : "Sin indicaciones adicionales.";
    const wrappedGeneralNote = wrapText(generalNoteText, 28);

    const fullMessage = [
      "Hola, quiero realizar un pedido.",
      "",
      "*RESUMEN DEL PEDIDO*",
      "",
      productsList,
      "",
      "*INDICACIONES GENERALES*",
      "",
      wrappedGeneralNote,
      "",
      `*TOTAL: $${total.toFixed(2)}*`,
    ].join("\n");

    const encoded = encodeURIComponent(fullMessage);
    window.open(`https://wa.me/16319183984?text=${encoded}`, "_blank");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {children && <SheetTrigger asChild>{children}</SheetTrigger>}
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
        <SheetHeader className="px-4 sm:px-6 pt-4 pb-4 border-b border-[var(--border)]">
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

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
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
                    className="flex gap-3 sm:gap-4 p-3 bg-[var(--card)] rounded-2xl shadow-soft"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[var(--muted)] flex-shrink-0">
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

                      {line.note && (
                        <p className="text-[11px] italic text-[var(--accent)] bg-[var(--accent)]/5 border border-[var(--accent)]/10 px-2 py-0.5 rounded-lg mt-1.5 inline-block">
                          Nota: {line.note}
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

                        {onEdit && (
                          <button
                            onClick={() => onEdit(line)}
                            className="text-xs text-[var(--accent)] hover:text-white font-bold tracking-wider uppercase underline transition-colors cursor-pointer"
                          >
                            Modificar
                          </button>
                        )}

                        <span className="font-display font-bold text-[var(--primary)]">
                          ${lineTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* General Order Notes Section */}
              <div className="pt-4 border-t border-[var(--border)] mt-6">
                <h4 className="font-display font-semibold text-base text-[var(--foreground)] mb-1">
                  Notas del pedido
                </h4>
                <p className="text-[11px] text-[var(--muted-foreground)] mb-2">
                  ⚠️ Solo indicaciones generales. <strong>No escribir adicionales con costo aquí.</strong>
                </p>
                <textarea
                  placeholder="Ej. Llamar al llegar, no tocar el timbre... (No escribir adicionales con costo aquí)"
                  value={generalNote}
                  onChange={(e) => onGeneralNoteChange(e.target.value)}
                  className="w-full bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)] rounded-2xl p-3 text-sm focus:outline-none focus:border-[var(--primary)] resize-none"
                  rows={2}
                />
                {showGeneralWarning && (
                  <p className="mt-1.5 text-xs text-amber-500 font-medium">
                    ⚠️ Parece que estás pidiendo un adicional. Recuerda seleccionarlo desde las opciones del producto para que el precio se calcule correctamente.
                  </p>
                )}
                <p className="mt-1.5 text-xs text-[var(--muted-foreground)] leading-relaxed">
                  Usa este espacio para indicaciones generales del pedido, como llamar al llegar o no tocar el timbre. No incluyas adicionales de productos aquí.
                </p>
              </div>
            </div>
          )}
        </div>

        {lines.length > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t border-[var(--border)] bg-[var(--background)] safe-area-pb">
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
