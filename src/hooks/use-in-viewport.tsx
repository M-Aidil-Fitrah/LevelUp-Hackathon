import React, { useEffect, useRef, useState } from 'react';

// useInViewport: tracks if an element is inside the viewport using IntersectionObserver
export function useInViewport<T extends HTMLElement = HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      // Fallback: consider visible to avoid blocking rendering on unsupported browsers
      setIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setIntersecting(entry.isIntersecting);
      },
      { root: options?.root ?? null, rootMargin: options?.rootMargin ?? '0px', threshold: options?.threshold ?? 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options?.root, options?.rootMargin, options?.threshold]);

  return { ref, isIntersecting } as const;
}

// LazyVisible: only renders children when they become visible; keeps them mounted afterwards
export function LazyVisible(props: {
  children: React.ReactNode;
  placeholderHeight?: number;
  className?: string;
  options?: IntersectionObserverInit;
}) {
  const { placeholderHeight = 200, className, options } = props;
  const { ref, isIntersecting } = useInViewport<HTMLDivElement>(options);
  const [hasRendered, setHasRendered] = useState(false);

  useEffect(() => {
    if (isIntersecting) setHasRendered(true);
  }, [isIntersecting]);

  const baseStyle: React.CSSProperties = { contentVisibility: 'auto' };
  const pendingStyle: React.CSSProperties | undefined = !hasRendered ? { minHeight: placeholderHeight } : undefined;

  return (
    <div ref={ref} className={className} style={{ ...baseStyle, ...(pendingStyle || {}) }}>
      {hasRendered ? props.children : null}
    </div>
  );
}
