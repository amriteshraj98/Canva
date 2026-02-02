import { useState } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { CursorOverlay } from './components/CursorOverlay';
import './style.css';

function App() {
    const [color, setColor] = useState('#000000');
    const [width, setWidth] = useState(5);

    return (
        <div className="app" style={{ position: 'relative', width: '100vw', height: '100vh', backgroundColor: '#f0f0f0' }}>
            <Toolbar color={color} setColor={setColor} width={width} setWidth={setWidth} />
            <div style={{ position: 'relative', width: 1200, height: 800, margin: '50px auto', backgroundColor: 'white', display: 'block', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                <CursorOverlay />
                <Canvas color={color} width={width} />
            </div>
        </div>
    );
}

export default App;
