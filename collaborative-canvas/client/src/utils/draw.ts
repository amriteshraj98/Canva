import { Point } from '../types/index';

type DrawOptions = {
    ctx: CanvasRenderingContext2D;
    currentPoint: Point;
    prevPoint: Point | null;
    color: string;
    width: number;
};

export const drawLine = ({ ctx, currentPoint, prevPoint, color, width }: DrawOptions) => {
    const { x: currX, y: currY } = currentPoint;
    const lineColor = color;
    const lineWidth = width;

    const startPoint = prevPoint ?? currentPoint;

    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    ctx.lineCap = 'round'; // Smooth edges
    ctx.lineJoin = 'round'; // Smooth corners
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(currX, currY);
    ctx.stroke();
};
