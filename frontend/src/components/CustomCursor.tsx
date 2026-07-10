import React, { useEffect, useRef, useState } from 'react';

const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);
  const cursorContainerRef = useRef<HTMLDivElement>(null);
  
  const [isVisible, setIsVisible] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // LERP state
  const mouse = useRef({ x: 0, y: 0 });
  const outlinePos = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number>();

  useEffect(() => {
    // Only show on desktop devices (non-touch)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }
      
      // Ensure cursor is visible if it went out of bounds
      if (cursorContainerRef.current) {
        cursorContainerRef.current.style.opacity = '1';
      }
    };

    const animate = () => {
      const speed = 0.18;
      outlinePos.current.x += (mouse.current.x - outlinePos.current.x) * speed;
      outlinePos.current.y += (mouse.current.y - outlinePos.current.y) * speed;

      if (outlineRef.current) {
        outlineRef.current.style.left = `${outlinePos.current.x}px`;
        outlineRef.current.style.top = `${outlinePos.current.y}px`;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    const handleMouseLeave = () => {
      if (cursorContainerRef.current) {
        cursorContainerRef.current.style.opacity = '0';
      }
    };

    const handleMouseEnter = () => {
      if (cursorContainerRef.current) {
        cursorContainerRef.current.style.opacity = '1';
      }
    };

    const interactables = 'a, button, .clickable, input, select, textarea, [role="button"], .group, .ripple-card, .cursor-pointer';

    const handleMouseOverInteractable = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(interactables)) {
        cursorContainerRef.current?.classList.add('cursor-hover');
      }
    };

    const handleMouseOutInteractable = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(interactables)) {
        cursorContainerRef.current?.classList.remove('cursor-hover');
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Add ripple
      const id = Date.now();
      setRipples((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
      
      // Cleanup ripple
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 700);

      if (dotRef.current) dotRef.current.style.transform = 'translate(-50%, -50%) scale(0.7)';
      if (outlineRef.current) outlineRef.current.style.transform = 'translate(-50%, -50%) scale(0.8)';
    };

    const handleMouseUp = () => {
      if (dotRef.current) dotRef.current.style.transform = 'translate(-50%, -50%) scale(1)';
      if (outlineRef.current) outlineRef.current.style.transform = 'translate(-50%, -50%) scale(1)';
    };

    const handleInput = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        cursorContainerRef.current?.classList.remove('cursor-pulse');
        // trigger reflow
        void cursorContainerRef.current?.offsetWidth;
        cursorContainerRef.current?.classList.add('cursor-pulse');
        
        setTimeout(() => {
          cursorContainerRef.current?.classList.remove('cursor-pulse');
        }, 300);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseover', handleMouseOverInteractable);
    document.addEventListener('mouseout', handleMouseOutInteractable);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('input', handleInput);

    // Initial animation call
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseover', handleMouseOverInteractable);
      document.removeEventListener('mouseout', handleMouseOutInteractable);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('input', handleInput);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <div 
        id="custom-cursor" 
        ref={cursorContainerRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference hidden md:block transition-opacity duration-300"
      >
        <div ref={dotRef} className="cursor-dot"></div>
        <div ref={outlineRef} className="cursor-outline"></div>
      </div>
      
      {/* Ripples */}
      {ripples.map(ripple => (
        <div 
          key={ripple.id}
          className="click-ripple"
          style={{ left: ripple.x, top: ripple.y }}
        />
      ))}
    </>
  );
};

export default CustomCursor;
