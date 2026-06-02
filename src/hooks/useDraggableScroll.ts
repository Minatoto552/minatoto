import { useRef, useEffect } from 'react';

export function useDraggableScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const dragInfo = useRef({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
    hasMovedSignificant: false
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      
      dragInfo.current.isDragging = true;
      dragInfo.current.startX = e.pageX;
      dragInfo.current.scrollLeft = el.scrollLeft;
      dragInfo.current.hasMovedSignificant = false;
      
      el.style.cursor = 'grabbing';
      el.style.userSelect = 'none';

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragInfo.current.isDragging) return;
      
      const x = e.pageX;
      const walk = (x - dragInfo.current.startX) * 1.5;
      
      if (Math.abs(x - dragInfo.current.startX) > 20) {
        dragInfo.current.hasMovedSignificant = true;
      }

      if (dragInfo.current.hasMovedSignificant) {
        el.scrollLeft = dragInfo.current.scrollLeft - walk;
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      dragInfo.current.isDragging = false;
      el.style.cursor = '';
      el.style.userSelect = '';
      
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    // Use a captured click listener to prevent the click event if we dragged
    const onClickCapture = (e: MouseEvent) => {
      if (dragInfo.current.hasMovedSignificant) {
        e.preventDefault();
        e.stopPropagation();
        dragInfo.current.hasMovedSignificant = false;
      }
    };

    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('click', onClickCapture, true);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('click', onClickCapture, true);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return ref;
}
