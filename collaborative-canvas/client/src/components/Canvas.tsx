import { useRef, useEffect, useState } from 'react';
import { drawLine } from '../utils/draw';
import { Point, Stroke } from '../types/index';
import { v4 as uuidv4 } from 'uuid';
import { socket } from '../socket';

// const socket = io('http://localhost:3001'); // Removed


type CanvasProps = {
    color: string;
    width: number;
};

export const Canvas: React.FC<CanvasProps> = ({ color, width }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [prevPoint, setPrevPoint] = useState<Point | null>(null);

    // Local stroke buffer to send on draw_end
    const strokeBuffer = useRef<Point[]>([]);

    useEffect(() => {
        // const ctx = canvasRef.current?.getContext('2d'); // Removed unused


        // Initial join
        socket.emit('join_room', { username: 'User-' + Math.floor(Math.random() * 1000), color });

        // --- Socket Listeners ---

        // 1. Draw Point (Real-time from others)
        socket.on('draw_point', ({ userId, x, y, color: sColor, width: sWidth }) => {
            // Need prevPoint for other users? 
            // Simplified: Just draw a small line or dot. 
            // Better: We need to track *other users'* previous points to draw smooth lines for them too.
            // For this assignment, assuming high frequency, points might be close enough.
            // But ideally we should store `peerPrevPoints` map.
            // Let's rely on 'draw_point' sending start of line? No, it sends current point.
            // Implementing a simple map for peers.
        });

        // We need a more robust way to handle peer drawing.
        // Redefining proper socket listeners below in a cleaner way.

        return () => {
            socket.off('draw_point');
            // ... cleanup
        };
    }, []);

    // --- Better Implementation with Peer Tracking ---

    const peersRef = useRef<Map<string, Point>>(new Map()); // userId -> lastPoint

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Helper to clear and redraw history
        const redrawAll = (history: Stroke[]) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            history.forEach(stroke => {
                const { points, color, width } = stroke;
                if (points.length < 2) return;

                ctx.beginPath();
                ctx.lineWidth = width;
                ctx.strokeStyle = color;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                ctx.stroke();
            });
        };

        socket.on('room_joined', ({ history }) => {
            redrawAll(history);
        });

        socket.on('history_sync', ({ history }) => {
            redrawAll(history);
        });

        socket.on('draw_started', ({ userId, x, y }) => {
            peersRef.current.set(userId, { x, y });
        });

        socket.on('draw_point', ({ userId, x, y, color, width }) => {
            const prev = peersRef.current.get(userId);
            if (prev) {
                drawLine({ ctx, currentPoint: { x, y }, prevPoint: prev, color, width });
            }
            peersRef.current.set(userId, { x, y });
        });

        socket.on('draw_ended', ({ userId }) => {
            peersRef.current.delete(userId);
        });

        // Cleanup shared listeners
        return () => {
            socket.off('room_joined');
            socket.off('history_sync');
            socket.off('draw_started');
            socket.off('draw_point');
            socket.off('draw_ended');
        };
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        setIsDrawing(true);
        const point = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
        setPrevPoint(point);
        strokeBuffer.current = [point];

        socket.emit('draw_start', { x: point.x, y: point.y, color, width });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        // Broadcast cursor
        socket.emit('cursor_move', { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });

        if (!isDrawing) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx || !prevPoint) return;

        const point = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };

        // Draw locally immediately
        drawLine({ ctx, currentPoint: point, prevPoint, color, width });

        // Emit
        socket.emit('draw_point', { x: point.x, y: point.y, color, width }); // Optimized: Send color/width if server needs it to broadcast

        setPrevPoint(point);
        strokeBuffer.current.push(point);
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
        setPrevPoint(null);

        if (strokeBuffer.current.length > 0) {
            socket.emit('draw_end', {
                id: uuidv4(),
                points: strokeBuffer.current,
                color,
                width
            });
        }
        strokeBuffer.current = [];
    };

    return (
        <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            style={{ border: '1px solid #333', cursor: 'none' }} // Hide default cursor? Or custom
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        />
    );
};
