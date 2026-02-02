import React from 'react';
import { socket } from '../socket';

type ToolbarProps = {
    color: string;
    setColor: (c: string) => void;
    width: number;
    setWidth: (w: number) => void;
};

export const Toolbar: React.FC<ToolbarProps> = ({ color, setColor, width, setWidth }) => {
    const handleUndo = () => socket.emit('undo');
    const handleRedo = () => socket.emit('redo');

    return (
        <div className="toolbar" style={{
            position: 'absolute',
            top: 20,
            left: 20,
            backgroundColor: '#333',
            padding: 10,
            borderRadius: 8,
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            zIndex: 100
        }}>
            <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
            />

            <input
                type="range"
                min="1"
                max="20"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value))}
            />
            <span style={{ color: 'white' }}>{width}px</span>

            <button onClick={handleUndo}>Undo</button>
            <button onClick={handleRedo}>Redo</button>
        </div>
    );
};
