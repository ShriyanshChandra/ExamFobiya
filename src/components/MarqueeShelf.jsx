import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import BookCard from './BookCard';

const SCROLL_SPEED = 55;

const MarqueeShelf = ({ books, direction = 'ltr', ariaLabel, className = '' }) => {
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const isHoveredRef = useRef(false);
  const isTouchingRef = useRef(false);
  const lastTimestampRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const items = useMemo(() => {
    if (!books || books.length === 0) return [];
    let arr = [...books];
    while (arr.length < 8) arr = [...arr, ...books];
    return arr;
  }, [books]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || prefersReducedMotion.current || items.length === 0) return;
    const timer = setTimeout(() => {
      const half = el.scrollWidth / 2;
      el.scrollLeft = direction === 'ltr' ? half : 0;
    }, 50);
    return () => clearTimeout(timer);
  }, [direction, items]);

  useEffect(() => {
    if (prefersReducedMotion.current || items.length === 0) return;
    const el = containerRef.current;
    if (!el) return;

    const tick = (timestamp) => {
      if (!isHoveredRef.current && !isTouchingRef.current && !isDraggingRef.current) {
        const dt = lastTimestampRef.current
          ? Math.min((timestamp - lastTimestampRef.current) / 1000, 0.05)
          : 0.016;
        lastTimestampRef.current = timestamp;
        const step = SCROLL_SPEED * dt;
        const half = el.scrollWidth / 2;
        if (half > 0) {
          if (direction === 'ltr') {
            el.scrollLeft -= step;
            if (el.scrollLeft <= 0) el.scrollLeft += half;
          } else {
            el.scrollLeft += step;
            if (el.scrollLeft >= half) el.scrollLeft -= half;
          }
        }
      } else {
        lastTimestampRef.current = null;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [direction, items]);

  const handleMouseEnter = useCallback(() => { isHoveredRef.current = true; }, []);

  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false;
    isDraggingRef.current = false;
    lastTimestampRef.current = null;
    if (containerRef.current) containerRef.current.style.cursor = '';
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartScrollLeftRef.current = containerRef.current.scrollLeft;
    containerRef.current.style.cursor = 'grabbing';
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    containerRef.current.scrollLeft = dragStartScrollLeftRef.current - dx;
    e.preventDefault();
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (containerRef.current) containerRef.current.style.cursor = '';
  }, []);

  const handleTouchStart = useCallback(() => { isTouchingRef.current = true; lastTimestampRef.current = null; }, []);
  const handleTouchEnd = useCallback(() => { isTouchingRef.current = false; lastTimestampRef.current = null; }, []);

  if (!books || books.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`home-marquee-shelf ${className}`.trim()}
      aria-label={ariaLabel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div className="home-marquee-group">
        {items.map((book, i) => (
          <BookCard key={`g1-${book.id}-${i}`} book={book} index={i} isMarquee={true} />
        ))}
      </div>
      <div className="home-marquee-group" aria-hidden="true">
        {items.map((book, i) => (
          <BookCard key={`g2-${book.id}-${i}`} book={book} index={i} isMarquee={true} isDuplicate={true} />
        ))}
      </div>
    </div>
  );
};

export default MarqueeShelf;
