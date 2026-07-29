import { useEffect, useRef, useState } from 'react';

// Anime l'apparition d'un élément (cartes/sections de dashboard) quand il entre dans le viewport.
export default function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, className: `reveal${visible ? ' is-visible' : ''}` };
}
