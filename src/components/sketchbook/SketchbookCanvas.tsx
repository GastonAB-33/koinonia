import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSketchbookStore } from '../../store/useSketchbookStore';
import { useStudyStore } from '../../store/useStudyStore';
import { SketchDrawingPoint, SketchDrawingStroke } from '../../types/sketchbook';

interface SketchbookCanvasProps {
  pan: { x: number; y: number };
  zoom: number;
  onPanChange: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  onZoomChange: React.Dispatch<React.SetStateAction<number>>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const SketchbookCanvas: React.FC<SketchbookCanvasProps> = ({
  pan,
  zoom,
  onPanChange,
  onZoomChange,
  containerRef
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { activeStudyId } = useStudyStore();
  const {
    getActivePage,
    activeDrawingTool,
    activeStrokeColor,
    activeStrokeWidth,
    addStroke,
    eraseStrokesAtPoint
  } = useSketchbookStore();

  const activePage = getActivePage(activeStudyId);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentPointsRef = useRef<SketchDrawingPoint[]>([]);

  // Pointers activos para gestos táctiles multitouch (pinch-to-zoom y pan a dos dedos)
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number>(1);
  const pinchStartCenterRef = useRef<{ x: number; y: number } | null>(null);
  const pinchStartPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Estado de arrastre manual (Pan)
  const isPanningRef = useRef(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panInitialRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Detección de tecla Espacio para paneo temporal
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Función para dibujar un trazo individual suavizado
  const drawSingleStroke = (ctx: CanvasRenderingContext2D, stroke: SketchDrawingStroke) => {
    const points = stroke.points;
    if (!points || points.length === 0) return;

    ctx.save();

    if (stroke.tool === 'highlighter') {
      ctx.globalAlpha = 0.38;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width || 18;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'round';
    } else {
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width || 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    ctx.beginPath();

    if (points.length === 1) {
      ctx.arc(points[0].x, points[0].y, (stroke.width || 3) / 2, 0, Math.PI * 2);
      ctx.fillStyle = stroke.color;
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }

    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);

    ctx.stroke();
    ctx.restore();
  };

  // Repintar todos los trazos en el canvas teniendo en cuenta pan y zoom
  const renderStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Aplicar escala de alta densidad de pantalla (Retina / 4K) y transformación de la pizarra infinita
    ctx.scale(dpr, dpr);
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // 1. Trazos guardados de la página
    if (activePage?.strokes) {
      activePage.strokes.forEach((stroke) => {
        drawSingleStroke(ctx, stroke);
      });
    }

    // 2. Trazo en progreso en tiempo real
    if (
      isDrawing &&
      currentPointsRef.current.length > 0 &&
      activeDrawingTool !== 'eraser' &&
      activeDrawingTool !== 'select' &&
      activeDrawingTool !== 'hand'
    ) {
      const liveWidth = activeDrawingTool === 'highlighter' ? 18 : activeStrokeWidth;
      const liveStroke: SketchDrawingStroke = {
        id: 'live',
        tool: activeDrawingTool,
        color: activeStrokeColor,
        width: liveWidth,
        points: currentPointsRef.current
      };
      drawSingleStroke(ctx, liveStroke);
    }

    ctx.restore();
  }, [
    activePage?.strokes,
    isDrawing,
    activeDrawingTool,
    activeStrokeColor,
    activeStrokeWidth,
    pan.x,
    pan.y,
    zoom
  ]);

  // Redimensionar el canvas adaptándolo dinámicamente al contenedor
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      const w = Math.round(rect.width) || window.innerWidth;
      const h = Math.round(rect.height) || window.innerHeight;

      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }
      renderStrokes();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    const observer = new ResizeObserver(updateCanvasSize);
    observer.observe(container);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      observer.disconnect();
    };
  }, [containerRef, renderStrokes]);

  // Redibujar ante cambios de trazos o cámara
  useEffect(() => {
    renderStrokes();
  }, [renderStrokes]);

  // Manejo de rueda de ratón (Mouse Wheel) para zoom hacia el cursor y desplazamiento
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Desplazamiento horizontal con trackpad (two-finger scroll)
      if (Math.abs(e.deltaX) > 0 && !e.ctrlKey) {
        onPanChange((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY
        }));
        return;
      }

      // Zoom hacia la posición del cursor
      const rect = container.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      const factor = e.deltaY < 0 ? 1.09 : 0.91;
      onZoomChange((prevZoom) => {
        const newZoom = Math.min(Math.max(prevZoom * factor, 0.2), 3.0);
        if (newZoom === prevZoom) return prevZoom;

        onPanChange((prevPan) => {
          const worldX = (cursorX - prevPan.x) / prevZoom;
          const worldY = (cursorY - prevPan.y) / prevZoom;
          return {
            x: cursorX - worldX * newZoom,
            y: cursorY - worldY * newZoom
          };
        });
        return newZoom;
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [containerRef, onPanChange, onZoomChange]);

  // Evento Pointer Down
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Si hay 2 dedos en pantalla: Iniciar gesto de pinch-to-zoom y pan a 2 dedos
    if (activePointersRef.current.size === 2) {
      if (isDrawing) {
        setIsDrawing(false);
        currentPointsRef.current = [];
        renderStrokes();
      }
      isPanningRef.current = false;
      const pts = Array.from(activePointersRef.current.values());
      const dx = pts[1].x - pts[0].x;
      const dy = pts[1].y - pts[0].y;
      pinchStartDistRef.current = Math.hypot(dx, dy);
      pinchStartZoomRef.current = zoom;
      pinchStartCenterRef.current = {
        x: (pts[0].x + pts[1].x) / 2,
        y: (pts[0].y + pts[1].y) / 2
      };
      pinchStartPanRef.current = { ...pan };
      return;
    }

    if (activePointersRef.current.size > 2) return;

    // Detectar si el usuario quiere mover la vista (Modo Pizarra)
    const isPanButton = e.button === 1 || e.button === 2; // Rueda o clic derecho
    const isPanMode = activeDrawingTool === 'hand' || isSpacePressed;

    if (isPanButton || isPanMode) {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX, y: e.clientY };
      panInitialRef.current = { ...pan };
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // Ignorar
      }
      return;
    }

    // Modo puntero: si no se hace clic sobre un bloque de texto, permite arrastrar la vista
    if (activeDrawingTool === 'select') {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX, y: e.clientY };
      panInitialRef.current = { ...pan };
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // Ignorar
      }
      return;
    }

    // Dibujo libre o borrador con clic izquierdo / stylus / dedo
    if (e.button !== 0) return;

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Ignorar
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    // Conversión matemática a coordenadas del espacio infinito de trabajo
    const wx = (sx - pan.x) / zoom;
    const wy = (sy - pan.y) / zoom;

    if (activeDrawingTool === 'eraser') {
      eraseStrokesAtPoint(activeStudyId, wx, wy, 24 / zoom);
      setIsDrawing(true);
      return;
    }

    setIsDrawing(true);
    currentPointsRef.current = [{ x: wx, y: wy }];
    renderStrokes();
  };

  // Evento Pointer Move
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointersRef.current.has(e.pointerId)) {
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // Gesto de 2 dedos (Pinch-to-zoom y desplazamiento táctil)
    if (
      activePointersRef.current.size === 2 &&
      pinchStartDistRef.current &&
      pinchStartCenterRef.current &&
      containerRef.current
    ) {
      const pts = Array.from(activePointersRef.current.values());
      const dx = pts[1].x - pts[0].x;
      const dy = pts[1].y - pts[0].y;
      const currentDist = Math.hypot(dx, dy);
      const scale = currentDist / pinchStartDistRef.current;
      const newZoom = Math.min(Math.max(pinchStartZoomRef.current * scale, 0.2), 3.0);

      const currentCenter = {
        x: (pts[0].x + pts[1].x) / 2,
        y: (pts[0].y + pts[1].y) / 2
      };

      const containerRect = containerRef.current.getBoundingClientRect();
      const focalX = pinchStartCenterRef.current.x - containerRect.left;
      const focalY = pinchStartCenterRef.current.y - containerRect.top;

      const worldX = (focalX - pinchStartPanRef.current.x) / pinchStartZoomRef.current;
      const worldY = (focalY - pinchStartPanRef.current.y) / pinchStartZoomRef.current;

      const deltaCenterX = currentCenter.x - pinchStartCenterRef.current.x;
      const deltaCenterY = currentCenter.y - pinchStartCenterRef.current.y;

      const newPanX = focalX - worldX * newZoom + deltaCenterX;
      const newPanY = focalY - worldY * newZoom + deltaCenterY;

      onZoomChange(newZoom);
      onPanChange({ x: newPanX, y: newPanY });
      return;
    }

    // Desplazamiento activo (Pan)
    if (isPanningRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      onPanChange({
        x: panInitialRef.current.x + dx,
        y: panInitialRef.current.y + dy
      });
      return;
    }

    // Dibujado o borrado en tiempo real
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const wx = (sx - pan.x) / zoom;
    const wy = (sy - pan.y) / zoom;

    if (activeDrawingTool === 'eraser') {
      eraseStrokesAtPoint(activeStudyId, wx, wy, 24 / zoom);
      return;
    }

    currentPointsRef.current.push({ x: wx, y: wy });
    renderStrokes();
  };

  // Evento Pointer Up / Cancel
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    activePointersRef.current.delete(e.pointerId);

    if (activePointersRef.current.size < 2) {
      pinchStartDistRef.current = null;
      pinchStartCenterRef.current = null;
    }

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignorar
    }

    if (isPanningRef.current) {
      isPanningRef.current = false;
    }

    if (isDrawing) {
      setIsDrawing(false);

      if (
        activeDrawingTool !== 'eraser' &&
        activeDrawingTool !== 'select' &&
        activeDrawingTool !== 'hand' &&
        currentPointsRef.current.length > 0
      ) {
        const strokeWidth = activeDrawingTool === 'highlighter' ? 18 : activeStrokeWidth;
        const newStroke: SketchDrawingStroke = {
          id: `stroke-${Date.now()}`,
          tool: activeDrawingTool,
          color: activeStrokeColor,
          width: strokeWidth,
          points: [...currentPointsRef.current]
        };
        addStroke(activeStudyId, newStroke);
      }

      currentPointsRef.current = [];
      renderStrokes();
    }
  };

  // Determinar cursor dinámico
  const getCursorClass = () => {
    if (isSpacePressed || activeDrawingTool === 'hand') {
      return isPanningRef.current ? 'cursor-grabbing' : 'cursor-grab';
    }
    if (activeDrawingTool === 'eraser') return 'cursor-cell';
    if (activeDrawingTool === 'pen' || activeDrawingTool === 'highlighter') return 'cursor-crosshair';
    return 'cursor-default';
  };

  // En modo select, permitir interacción transparente con los textos salvo cuando se arrastra con barra espaciadora
  const isPointerInteractive =
    activeDrawingTool !== 'select' || isSpacePressed || isPanningRef.current;

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={(e) => e.preventDefault()}
      className={`absolute inset-0 z-20 touch-none ${getCursorClass()} ${
        isPointerInteractive ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    />
  );
};
