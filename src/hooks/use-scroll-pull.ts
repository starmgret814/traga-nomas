import { useEffect, useRef, useState, type CSSProperties } from "react";

interface UseScrollPullOptions {
  /** Max vertical offset (px) the block is pulled down from before settling. */
  distance?: number;
  /**
   * Fraction of the viewport (0–1) over which the pull resolves. Larger values
   * make the element settle sooner (it finishes higher on screen).
   */
  settle?: number;
}

/**
 * Scroll-linked "pull from below" effect.
 *
 * As the element scrolls up into view, it is translated upward in real time
 * (so it feels like you are dragging the whole section up with the scroll) and
 * fades in. Crucially, once the element is fully in view the transform settles
 * back to exactly 0 — this keeps any `position: sticky` descendants (like the
 * category nav) working, since a non-zero transform would create a containing
 * block and break sticky behaviour.
 */
export function useScrollPull<T extends HTMLElement = HTMLDivElement>({
  distance = 120,
  settle = 0.85,
}: UseScrollPullOptions = {}) {
  const ref = useRef<T | null>(null);
  const [style, setStyle] = useState<CSSProperties>({
    transform: `translate3d(0, ${distance}px, 0)`,
    opacity: 0,
  });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Respect reduced motion: render settled, no movement.
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setStyle({ transform: "none", opacity: 1 });
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;

      // progress: 0 when the element's top is at the bottom of the viewport,
      // 1 once it has travelled `settle` of the viewport height upward.
      const start = vh;
      const end = vh * (1 - settle);
      const raw = (start - rect.top) / (start - end);
      const progress = Math.min(1, Math.max(0, raw));

      // Ease-out so the pull decelerates as it settles.
      const eased = 1 - Math.pow(1 - progress, 3);
      const offset = (1 - eased) * distance;

      setStyle({
        transform: offset < 0.5 ? "none" : `translate3d(0, ${offset}px, 0)`,
        opacity: eased,
      });
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [distance, settle]);

  return { ref, style };
}
