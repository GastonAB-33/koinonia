import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSketchbookStore } from '../../store/useSketchbookStore';
import { useStudyStore } from '../../store/useStudyStore';
import { SketchDrawingPoint, SketchDrawingStroke } from '../../types/sketchbook';

interface SketchbookCanvasProps {
  width: number;
  height: number;
}

export const SketchbookCanvas: React.FC<SketchbookCanvasProps> = ({ width, height }) => {
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

  // Repintar trazos
  const renderStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (activePage?.strokes) {
      activePage.strokes.forEach((stroke) => {
        drawSingleStroke(ctx, stroke);
      });
    }

    // Trazo en vivo
    if (isDrawing && currentPointsRef.current.length > 0 && activeDrawingTool !== 'eraser' && activeDrawingTool !== 'select') {
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
  }, [activePage?.strokes, isDrawing, activeDrawingTool, activeStrokeColor, activeStrokeWidth]);

  const drawSingleStroke = (ctx: CanvasRenderingContext2D, stroke: SketchDrawingStroke) => {
    const points = stroke.points;
    if (points.length === 0) return;

    ctx.save();

    if (stroke.tool === 'highlighter') {
      ctx.globalAlpha = 0.35;
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasWidth = Math.max(width, 800);
    const canvasHeight = Math.max(height, 1400);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    renderStrokes();
  }, [width, height, renderStrokes]);

  useEffect(() => {
    renderStrokes();
  }, [renderStrokes]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeDrawingTool === 'select') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeDrawingTool === 'eraser') {
      eraseStrokesAtPoint(activeStudyId, x, y, 22);
      setIsDrawing(true);
      return;
    }

    setIsDrawing(true);
    currentPointsRef.current = [{ x, y }];
    renderStrokes();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeDrawingTool === 'eraser') {
      eraseStrokesAtPoint(activeStudyId, x, y, 22);
      return;
    }

    currentPointsRef.current.push({ x, y });
    renderStrokes();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // Ignorar
      }
    }

    setIsDrawing(false);

    if (activeDrawingTool !== 'eraser' && activeDrawingTool !== 'select' && currentPointsRef.current.length > 0) {
      const strokeWidth = activeDrawingTool === 'highlighter' ? 18 : activeStrokeWidth;
      const newStroke: SketchDrawingStroke = {
        id: `stroke-${Date.now()}`,
        tool: activeDrawingTool,
        color: activeStrokeColor,
        width: strokeWidth,
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
        activeDrawingTool === 'select'
          ? 'pointer-events-none'
          : activeDrawingTool === 'eraser'
          ? 'cursor-cell'
          : 'cursor-crosshair'
      }`}
      style={{
        width: `${Math.max(width, 800)}px`,
        height: `${Math.max(height, 1400)}px`
      }}
    />
  );
};
