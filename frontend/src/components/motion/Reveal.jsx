import React, { useEffect } from 'react';
import anime from 'animejs';
import { useInViewAnimation } from '../../hooks/useInViewAnimation';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Wrap any block to fade+rise it in when scrolled into view.
 * Usage: <Reveal delay={100}><YourJSX /></Reveal>
 */
const Reveal = ({ children, delay = 0, className = '', as: Tag = 'div' }) => {
  const [ref, inView] = useInViewAnimation();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!inView || !ref.current) return;
    if (reducedMotion) {
      ref.current.style.opacity = 1;
      return;
    }
    anime({
      targets: ref.current,
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 700,
      delay,
      easing: 'easeOutCubic',
    });
  }, [inView, reducedMotion, delay]);

  return (
    <Tag ref={ref} className={className} style={{ opacity: reducedMotion ? 1 : 0 }}>
      {children}
    </Tag>
  );
};

export default Reveal;
