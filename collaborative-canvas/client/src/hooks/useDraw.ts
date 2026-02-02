import { useState, useEffect, useCallback } from 'react';
import { Point } from '../types/index';

export const useDraw = (onDraw: (draw: { currentPoint: Point; prevPoint: Point | null; ctx: CanvasRenderingContext2D }) => void) => {
    const [mouseDown, setMouseDown] = useState(false);
    const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
    const [prevPoint, setPrevPoint] = useState<Point | null>(null);

    const onMouseDown = useCallback((point: Point) => {
        setMouseDown(true);
        setCurrentPoint(point);
        // Don't set prevPoint yet, or set it to same?
    }, []);

    const onMouseUp = useCallback(() => {
        setMouseDown(false);
        setPrevPoint(null);
        setCurrentPoint(null);
    }, []);

    const onMouseMove = useCallback((point: Point, ctx: CanvasRenderingContext2D) => {
        if (mouseDown && onDraw) {
            onDraw({ currentPoint: point, prevPoint: prevPoint, ctx });
            setPrevPoint(point);
            setCurrentPoint(point);
        }
    }, [mouseDown, onDraw, prevPoint]);

    return { onMouseDown, onMouseUp, onMouseMove };
};
