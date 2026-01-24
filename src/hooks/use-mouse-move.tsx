"use client";

import React, { useRef } from "react";

export default function useMouseMove<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  React.useEffect(() => {
    let ticking = false;
    let scale = 1;

    // Cache scale to avoid layout thrashing during mouse move
    function updateScale() {
       if (window.visualViewport) {
         scale = window.visualViewport.scale;
       }
    }

    // Initial scale
    updateScale();

    function mouseMoveEvent(e: MouseEvent) {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // disable mouse movement on viewport zoom - causes page to slow down
          if (scale === 1 && ref.current) {
            const targetX = e.clientX;
            const targetY = e.clientY;

            // Apply custom properties to the specific element instead of body
            // This reduces the scope of style invalidation and prevents global reflows
            ref.current.style.setProperty("--x", `${targetX}px`);
            ref.current.style.setProperty("--y", `${targetY}px`);
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    document.addEventListener("mousemove", mouseMoveEvent);
    if (window.visualViewport) {
       window.visualViewport.addEventListener("resize", updateScale);
    }
    
    return () => {
      document.removeEventListener("mousemove", mouseMoveEvent);
      if (window.visualViewport) {
         window.visualViewport.removeEventListener("resize", updateScale);
      }
    };
  }, []);

  return ref;
}
