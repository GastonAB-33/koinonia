import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useFreeBookStore } from '../../store/useFreeBookStore';
import { useStudyStore } from '../../store/useStudyStore';
import { DrawingPoint, DrawingStroke } from '../../types/freebook';

interface FreeBookCanvasProps {
  containerWidth: number;
  containerHeight: number;
}

export const FreeBookCanvas: React.FC<FreeBookCanvasProps> = ({
  containerWidth,
  containerHeight
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { activeStudyId } = useStudyStore();
  const {
    activeTool,
    strokeColor,
    penWidth,
    highlighterWidth,
    getStudyData,
    addStroke,
    eraseStrokesAtPoint
  } = useFreeBookStore();

  const studyData = getStudyData(activeStudyId);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentPointsRef = useRef<DrawingPoint[]>([]);

  // Función para dibujar trazos suavizados en el contexto 2D
  const renderStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar trazos guardados
    studyData.strokes.forEach((stroke) => {
      drawSingleStroke(ctx, stroke);
    });

    // Dibujar el trazo en progreso si el usuario está dibujando
    if (isDrawing && currentPointsRef.current.length > 0 && activeTool !== 'eraser' && activeTool !== 'select') {
      const activeWidth = activeTool === 'highlighter' ? highlighterWidth : penWidth;
      const liveStroke: DrawingStroke = {
        id: 'live',
        tool: activeTool,
        color: strokeColor,
        width: activeWidth,
        points: currentPointsRef.current
      };
      drawSingleStroke(ctx, liveStroke);
    }
  }, [studyData.strokes, isDrawing, activeTool, strokeColor, penWidth, highlighterWidth]);

  // Dibujar un trazo individual con suavizado
  const drawSingleStroke = (ctx: CanvasRenderingContext2D, stroke: DrawingStroke) => {
    const points = stroke.points;
    if (points.length === 0) return;

    ctx.save();

    if (stroke.tool === 'highlighter') {
      ctx.globalAlpha = 0.38;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'round';
    } else {
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    ctx.beginPath();

    if (points.length === 1) {
      ctx.arc(points[0].x, points[0].y, stroke.width / 2, 0, Math.PI * 2);
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

    // Último punto
    const lastPoint = points[points.length - 1];
    ctx.lineTo(lastPoint.x, lastPoint.y);

    ctx.stroke();
    ctx.restore();
  };

  // Redimensionar canvas manteniendo resolución nítida
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = Math.max(containerWidth, 800);
    const height = Math.max(containerHeight, 1200);

    canvas.width = width;
    canvas.height = height;

    renderStrokes();
  }, [containerWidth, containerHeight, renderStrokes]);

  // Redibujar cuando cambian los trazos
  useEffect(() => {
    renderStrokes();
  }, [renderStrokes]);

  // Manejo de eventos de puntero (ratón, táctil, lápiz stylus)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool === 'select') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'eraser') {
      eraseStrokesAtPoint(activeStudyId, x, y, 24);
      setIsDrawing(true);
      return;
    }

    setIsDrawing(true);
    currentPointsRef.current = [{ x, y, pressure: e.pressure }];
    renderStrokes();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'eraser') {
      eraseStrokesAtPoint(activeStudyId, x, y, 24);
      return;
    }

    currentPointsRef.current.push({ x, y, pressure: e.pressure });
    renderStrokes();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // Ignorar si el puntero ya se liberó
      }
    }

    setIsDrawing(false);

    if (activeTool !== 'eraser' && activeTool !== 'select' && currentPointsRef.current.length > 0) {
      const activeWidth = activeTool === 'highlighter' ? highlighterWidth : penWidth;
      const newStroke: DrawingStroke = {
        id: `stroke-${Date.now()}`,
        tool: activeTool,
        color: strokeColor,
        width: activeWidth,
        points: [...currentPointsRef.current]
      };
      addStroke(activeStudyId, newStroke);
      currentPointsRef.current = [];
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`absolute inset-0 z-20 touch-none ${
        activeTool === 'select'
          ? 'pointer-events-none'
          : activeTool === 'eraser'
          ? 'cursor-cell'
          : 'cursor-crosshair'
      }`}
      style={{
        width: `${Math.max(containerWidth, 800)}px`,
        height: `${Math.max(containerHeight, 1200)}px`
      }}
    />
  );
};
