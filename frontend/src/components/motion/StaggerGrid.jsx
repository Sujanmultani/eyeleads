import React, { useEffect, useRef } from 'react';
import anime from 'animejs';
import { useInViewAnimation } from '../../hooks/useInViewAnimation';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const StaggerGrid = ({ children, className = '', staggerMs = 80 }) => {
  const [containerRef, inView] = useInViewAnimation();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!inView || !containerRef.current) return;
    const items = containerRef.current.children;
    if (reducedMotion) {
      Array.from(items).forEach((el) => (el.style.opacity = 1));
      return;
    }
    anime({
      targets: items,
      opacity: [0, 1],
      translateY: [20, 0],
      scale: [0.97, 1],
      delay: anime.stagger(staggerMs),
      duration: 600,
      easing: 'easeOutQuad',
    });
  }, [inView, reducedMotion, staggerMs]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

export default StaggerGrid;
